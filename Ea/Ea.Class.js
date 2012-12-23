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

/**
 * @namespace
 */
Ea.Class = {

	_types: {},
	
	/**
	 * @param {Class} _class
	 * @memberOf Ea.Class
	 */
	registerClass: function(_class) {
		if (_class in this._types)
			return;
		Ea.Class._types[_class] = {
			attributes: [],
			id: null,
			guid: null
		};
	},
	
	/**
	 * 
	 * @param {Ea.Class._Attribute} attribute
	 */
	registerAttribute: function(attribute) {
		var _class = attribute.owner;
		this.registerClass(_class);
		var _classReflection = Ea.Class._types[_class];
		_classReflection.attributes.push(attribute);
		if ("id" in attribute)
			_class.namespace["__" + attribute.id] = attribute;
	},
	
	/**
	 * @param {Class} _class
	 * @returns {Ea.Class._Attribute}
	 */
	getIdAttribute: function(_class) {
		return _class.namespace.__id;
	},
	
	/**
	 * @param {Class} _class
	 * @returns {Ea.Class._Attribute}
	 */
	getGuidAttribute: function(_class) {
		return _class.namespace.__guid;
	},
	
	/**
	 * Returns attributes owned (directly) by specified class
	 * 
	 * @param {Class} _class
	 * @returns {Array<Ea.Class._Attribute>}
	 */
	getOwnedAttributes: function(_class) {
		return Ea.Class._types[_class].attributes;
	},
		
	/**
	 * Returns all attributes of specified class
	 * 
	 * @param {Class} _class
	 * @returns {Array<Ea.Class._Attribute>}
	 */
	getAttributes: function(_class) {
		var attributes = [];
		if (_class._super.isSubclassOf(Ea.Types.Any)) {
			attributes = attributes.concat(this.getAttributes(_class._super));
		}
		attributes = attributes.concat(this.getOwnedAttributes(_class));
		return attributes;
	},
	
	/**
	 * @internal
	 */
	prepareClasses: function() {
		for (_class in this._types) {
			var attributes = this._types[_class].attributes;
			for (var ai = 0; ai < attributes.length; ai++) {
				var attribute = attributes[ai];
				attribute.prepare();
			}
		}
	},
		
	/**
	 * Creates new attribute based on EA API
	 * 
	 * @internal
	 */
	attribute: function(params) {
		return new Ea.Class.ApiAttribute(params);
	},
	
	/**
	 * Creates new derived attribute
	 * 
	 * @internal
	 */
	derived: function(params) {
		return new Ea.Class.DerivedAttribute(params);
	},
	
	/**
	 * Namespace initialization
	 */
	initialize: function() {
		var callbackSource = function(qualifiedName, source) {
			source = source.replace(/([\s,\.])([A-Z_][A-Za-z0-9_$]*)(\s*[:=]\s*)(attribute|derived)\s*\(/g, function(whole, prefix, name, assignment, method) {
				var result = prefix + name + assignment + "Ea.Class." + method + "(";
				return result;
			});
			return source;
		};

		Core.registerSourceEnrichment(callbackSource);
	},

	/**
	 * Creates abstraction layer proxy object for specified EA API object
	 * 
	 * @param {Object} instance
	 * @param {Class} baseType
	 * @param {Object} api
	 * @param {Object} params
	 * @returns {Ea.Types.Any}
	 */
	createProxy: function(application, baseType, api, params) {
		var source = {
			api: api,
			application: application,
			value: {}
		};
		var type = baseType.getType({_source: source});
		var proxy = new type(source, params);
		return proxy;
	}	
};

Ea.Class._Attribute = define(/** @lends Ea.Class._Attribute# */{

	owner: null,
	name: null,
	derived: null,
	qualifiedName: null,
	
	/**
	 * @constructs
	 * @memberOf Ea.Class._Attribute#
	 */
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

Ea.Class.ApiAttribute = extend(Ea.Class._Attribute, /** @lends Ea.Class.ApiAttribute# */{
	
	_getBy: null,
	
	/**
	 * @constructs
	 * @memberOf Ea.Class.ApiAttribute#
	 */
	create: function(params) {
		_super.create(params);
		this.derived = false;
	},
	
	prepare: function() {
		_super.prepare();
		if (this.type.isClass && this.type.isSubclassOf(Ea.Types.Any)) {
			this._getBy = this.referenceBy ? ("getBy" + this.referenceBy.substr(0, 1).toUpperCase() + this.referenceBy.substr(1).toLowerCase()) : "get";
		}
	},
	
	_get: function(object, params) {
		var source = object._source;
		if (Ea.mm || !(this.name in source.value))
			this._init(source);
		var value = source.value[this.name];
		if (this.type.isClass && "processValue" in this.type) {
			value = this.type.processValue(value, params || []);
		}
		return value;
	},
	
	_getApiValue: function(source) {
		if (this.index == null) {
			var value;
			try {
				value = source.api[this.api];
				//	don't remove this dumb check:
				//		EA for some reason throws exception on access to Ea.Property._Base._value value for NoteLink property
				//		logging of this value is necessary for proper exception handing (i don't know why)
				if (this.qualifiedName == "Ea.Property._Base._value")
					_quietLogger("$", [value]);
			}
			catch(error) {
				warn("EA API exception on get attribute value $ ($)", [this.qualifiedName, error.message]);
				value = null;
			}
			return value;
		}
		return source.api[this.api](this.index);
	},
	
	_init: function(source) {
		
		var apiValue = this._getApiValue(source);
		
		if (this.type.isClass) {
			if (this.type.isSubclassOf(Core.Types.Collection)) {
				var collection = source.application.getRepository().getCollection(this.type, apiValue, this);
				source.value[this.name] = collection;
				return;
			}
			if (this.type.isSubclassOf(Ea.Types.Any)) {
				var proxy = apiValue ? source.application.getRepository()[this._getBy](this.type, apiValue) : null;
				source.value[this.name] = proxy;
				return;
			}
			var value = this.type.create(apiValue, this);
			source.value[this.name] = value;
			return;
		}
		source.value[this.name] = (apiValue == null ? null : new this.type(apiValue).valueOf());
	}
});

Ea.Class.DerivedAttribute = extend(Ea.Class._Attribute, /** @lends Ea.Class.DerivedAttribute# */{

	/**
	 * @constructs
	 * @memberOf Ea.Class.DerivedAttribute#
	 */
	create: function(params) {
		_super.create(params);
		this.derived = true;
	},
	
	_get: function(object, params) {
		return object[this.getter].apply(object, params || []);
	}
});

include("Ea.DataTypes@Ea");
