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
		
	_attributeTypes: [],	
		
	attribute: function(params) {
		return new Ea.Class.AttributeProxy(params);
	},
	
	initialize: function() {
		var callbackSource = function(qualifiedName, source) {
			source = source.replace(/([\s,\.])([A-Z_][A-Za-z0-9_$]*)(\s*[:=]\s*)(attribute|method)\s*\(/g, function(whole, prefix, name, assignment, method) {
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

Ea.Class.AttributeProxy = define({

	private: null,
	type: null,
	elementType: null,
	api: null,
	index: null,
	separator: null,
	assigment: null,
	filter: null,
	key: null,
	value: null,
	referenceType: null,
	subtype: null,

	params: null,
	
	owner: null,
	name: null,
	qualifiedName: null,
	
	getter: null,
	setter: null,
	
	_attribute: null,
	
	create: function(params) {
		
		_super.create();
		
		this.private = params.private;
		this.getter = params.get;
		this.setter = params.set;
		this.api = params.api;
		this.index = params.index;
		this.filter = params.filter;
		this.key = params.key;
		this.value = params.value;
		this.subtype = params.subtype;

		this.referenceType = params.referenceType;
		
		this.type = params.type;
		this.elementType = params.elementType;
		this.separator = params.separator;
		this.assigment = params.assigment;

		this.params = params;
	},
	
	_getAccessor: function(kind) {
		var body = "return this._class." + this.name + "." + kind + "(this, arguments);";
		var accessor = new Function(body);
		return accessor;
	},
	
	_createAccessor: function(kind, properties, accesorName) {
		var accessor = this._getAccessor(kind);
		var name = (this.private ? "_" : "") + kind + accesorName;
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
	},
	
	_prepared: false,
	prepare: function() {
		
		if (this._prepared)
			return;
		
		this.type = Ea.Helper.typeEval(this.type || String);
		this.elementType = Ea.Helper.isCollectionType(this.type) ? Ea.Helper.typeEval(this.elementType) : null;
		var attributeType = null;

		if (!this.api)
			attributeType = Ea.Class.CustomProperty;
		else if (this.type.isClass && (this.type == Ea.Types.Any || this.type.isSubclassOf(Ea.Types.Any))) {
			if (this.referenceType == "id")
				attributeType = Ea.Class.ReferenceById;
			else if (this.referenceType == "guid")
				attributeType = Ea.Class.ReferenceByGuid;
			else
				attributeType = Ea.Class.Reference;
		}
		else if (this.type == Ea.Collection.Map)
			attributeType = Ea.Class.CollectionMap;
		else if (this.type.isClass && (this.type == Ea.Collection._Base || this.type.isSubclassOf(Ea.Collection._Base)))
			attributeType = Ea.Class.Collection;
		else if (this.subtype == "Map")
			attributeType = Ea.Class.Map;
		else if (this.subtype == "List")
			attributeType = Ea.Class.List;
		else
			attributeType = Ea.Class.Property;
		
		this._attribute = new attributeType(this);

		this.owner._addProperty(this);
		this._prepared = true;
	},
	
	get: function(object, params) {
		return this._attribute.get(object, params);
	}
});

Ea.Class._Attribute = define({
	
	_proxy: null,
	
	create: function(proxy) {
		this._proxy = proxy;
	}
});

Ea.Class.ApiProperty = extend(Ea.Class._Attribute, {
	
	getTyped: function(source, type) {
		var value = source.getApiValue(this._proxy);
		return (type.isClass ? new type(value) : value);
	},
	
	get: function(object, params) {
		var source = object.instanceOf(Ea.Class.Source) ? object : object._source;
		if (Ea.mm || !source.isInitialized(this._proxy))
			this._init(source);
		return this._get(source, params || []);
	},
	
	_get: function(source) {
		return source.getValue(this._proxy);
	}
});

Ea.Class.Property = extend(Ea.Class.ApiProperty, {
	
	_init: function(source) {
		source.setValue(this._proxy, this.getTyped(source, this._proxy.type));
	}
});

Ea.Class.List = extend(Ea.Class.Property, {
	
	_init: function(source) {
		var string = this.getTyped(source, String);
		var value = string ? string.split(this._proxy.separator || ",") : [];
		var list = {
			value: value,
			forEach: function(fn) {
				for (var i = 0; i < value.length; i++) {
					fn(value[i], i);
				}
			}
		};
		source.setValue(this._proxy, list);
	}
});

Ea.Class.Map = extend(Ea.Class.Property, {
	
	_init: function(source) {
		var string = this.getTyped(source, String);
		var mapValue = Ea.Class.Map.stringToMap(string, this._proxy.separator || ";", this._proxy.assigment || "=");
		var map = {
			value: mapValue,
			get: function(key) {
				return mapValue[key];
			}
		};
		source.setValue(this._proxy, map);
	}
},
{
	stringToMap: function(string, separator, assigment) {
		var object = {};
		if (string) {
			var tab = string.split(separator);
			for (var t = 0; t < tab.length; t++) {
				var value = tab[t];
				if (value) {
					value = value.split(assigment);
					object[value[0]] = value[1];
				}
			}
		}
		return object;
	}
});

Ea.Class.Collection = extend(Ea.Class.ApiProperty, {
	
	_get: function(source, params) {
		return source.getValue(this._proxy).filter(params[0]);
	},
	
	_init: function(source) {
		source.setValue(this._proxy, Ea.getCollection(this._proxy.type, source.getApiValue(this._proxy), this._proxy));
	}
});

Ea.Class.CollectionMap = extend(Ea.Class.Collection);

Ea.Class.Reference = extend(Ea.Class.ApiProperty, {
	_init: function(source) {
		var api = source.getApiValue(this._proxy);
		var proxy = api ? Ea.get(this._proxy.type, api) : null;
		source.setValue(this._proxy, proxy);
	}
});

Ea.Class.ReferenceByPointer = extend(Ea.Class.Property, {
	
	_init: function(source) {
		var reference = this.getTyped(source, this._class.referenceType);
		source.setValue(this._proxy, (reference ? Ea[this._class.getBy](this._proxy.type, reference) : null));
	}
});

Ea.Class.ReferenceById = extend(Ea.Class.ReferenceByPointer, {},
{
	getBy: "getById",
	referenceType: Number
});

Ea.Class.ReferenceByGuid = extend(Ea.Class.ReferenceByPointer, {},
{
	getBy: "getByGuid",
	referenceType: String
});

Ea.Class.CustomProperty = extend(Ea.Class._Attribute, {
	get: function(object, params) {
		return object[this._proxy.getter].apply(object, params || []);
	}
});
