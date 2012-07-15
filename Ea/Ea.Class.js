/*
   Copyright 2011 300 D&C

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

Ea.Class = {

	_types: {},
	
	registerClass: function(_class) {
		if (_class in this._types)
			return;
		Ea.Class._types[_class] = {
			attributes: [],
			id: null,
			guid: null
		};
	},
	
	registerAttribute: function(attribute) {
		this.registerClass(attribute.owner);
		var _classReflection = Ea.Class._types[attribute.owner];
		_classReflection.attributes.push(attribute);
		if ("id" in attribute)
			_classReflection[attribute.id] = attribute;
	},
	
	getIdAttribute: function(_class) {
		return Ea.Class._types[_class].id;
	},
	
	getGuidAttribute: function(_class) {
		return Ea.Class._types[_class].guid;
	},
	
	getOwnedAttributes: function(_class) {
		return Ea.Class._types[_class].attributes;
	},
		
	getAttributes: function(_class) {
		var attributes = [];
		if (_class._super.isSubclassOf(Ea.Types.Any)) {
			attributes = attributes.concat(this.getAttributes(_class._super));
		}
		attributes = attributes.concat(this.getOwnedAttributes(_class));
		return attributes;
	},
	
	prepareClasses: function() {
		for (_class in this._types) {
			var attributes = this._types[_class].attributes;
			for (var ai = 0; ai < attributes.length; ai++) {
				var attribute = attributes[ai];
				attribute.prepare();
			}
		}
	},
		
	attribute: function(params) {
		return new Ea.Class.ApiAttribute(params);
	},
	
	derived: function(params) {
		return new Ea.Class.DerivedAttribute(params);
	},
	
	initialize: function() {
		var callbackSource = function(qualifiedName, source) {
			source = source.replace(/([\s,\.])([A-Z_][A-Za-z0-9_$]*)(\s*[:=]\s*)(attribute|derived)\s*\(/g, function(whole, prefix, name, assignment, method) {
				var result = prefix + name + assignment + "Ea.Class." + method + "(";
				return result;
			});
			return source;
		};

		Core.enrichSourceRegister(callbackSource);
	},

	createProxy: function(baseType, api, params) {
		var source = new Ea.Class.Source(api);
		var type = baseType.getType(source);
		var proxy = new type(api, params);
		proxy._source = source;
		return proxy;
	}	
};

Ea.Class.Source = define({
	
	_api: null,
	_value: null,
	
	create: function(api) {
		_super.create();
		this._api = api;
		this._value = {};
	},
	
	getApi: function() {
		return this._api;
	},
	
	getApiValue: function(property) {
		if (property.index == null)
			return this._api[property.api];
		return this._api[property.api](property.index);
	},
	
	getValue: function(property) {
		return this._value[property.name];
	},
	
	setValue: function(property, value) {
		this._value[property.name] = value;
	},
	
	isInitialized: function(property) {
		return (property.name in this._value);
	}
});

Ea.Class._Attribute = define({

	owner: null,
	name: null,
	derived: null,
	qualifiedName: null,
	
	create: function(params) {
		_super.create();
		Core.merge(this, params);
	},
	
	_getAccessor: function(kind) {
		var body = "return this._class." + this.name + "." + kind + "(this, arguments);";
		var accessor = new Function(body);
		return accessor;
	},
	
	_createAccessor: function(kind, properties, accesorName) {
		var accessor = this._getAccessor(kind);
		var name = (this.private ? "_" : "") + kind + accesorName;
		if (name in properties)
			throw new Error("Accesor already exists: " + this.owner.qualifiedName + "." + name);
		properties[name] = accessor;
		Core.enrichMethod(properties, name, this.qualifiedName, false);
		return accessor;
	},
	
	initialize: function(_class, propertyName, properties) {
		this.owner = _class;
		this.name = propertyName;
		this.qualifiedName = this.owner.qualifiedName + "." + this.name;

		var accesorName = this.name.replace(/^_+/g, "");
		accesorName = accesorName.substring(0,1).toUpperCase() + accesorName.substring(1);

		if (!this.getter)
			this.getter = this._createAccessor("get", properties, accesorName);
		/*if (!this.setter)
			this.setter = this._createAccessor("set", properties, accesorName);*/
		
		Ea.Class.registerAttribute(this);
	},
	
	_prepared: false,
	prepare: function() {
		
		if (this._prepared)
			throw new Error("Property " + this.qualifiedName + " already prepared");
		
		this.type = Ea.Helper.typeEval(this.type || String);
		this.elementType = Ea.Helper.isCollectionType(this.type) ? Ea.Helper.typeEval(this.elementType) : null;

		this._prepared = true;
	},
	
	get: function(object, params) {
		return this._get(object, params);
	}
});

Ea.Class.ApiAttribute = extend(Ea.Class._Attribute, {
	
	create: function(params) {
		_super.create(params);
		this.derived = false;
	},
	
	_get: function(object, params) {
		var source = object.instanceOf(Ea.Class.Source) ? object : object._source;
		if (Ea.mm || !source.isInitialized(this))
			this._init(source);
		var value = source.getValue(this);
		if (this.type.isClass && "processValue" in this.type) {
			value = this.type.processValue(value, params || []);
		}
		return value;
	},
	
	_init: function(source) {
		if (this.type.isClass) {
			if (this.type.isSubclassOf(Core.Types.Collection)) {
				source.setValue(this, Ea.getCollection(this.type, source.getApiValue(this), this));
				return;
			}
			if (this.type.isSubclassOf(Ea.Types.Any)) {
				var getBy;
				if (this.referenceBy)
					getBy = ("getBy" + this.referenceBy.substr(0, 1).toUpperCase() + this.referenceBy.substr(1).toLowerCase());
				else
					getBy = "get";
				var api = source.getApiValue(this);
				var proxy = api ? Ea[getBy](this.type, api) : null;
				source.setValue(this, proxy);
				return;
			}
		}
		var value = new this.type(source.getApiValue(this), this);
		source.setValue(this, this.type.isClass ? value : value.valueOf());
	}
});

Ea.Class.DerivedAttribute = extend(Ea.Class._Attribute, {

	create: function(params) {
		_super.create(params);
		this.derived = true;
	},
	
	_get: function(object, params) {
		return object[this.getter].apply(object, params || []);
	}
});

include("Ea.DataTypes@Ea");
