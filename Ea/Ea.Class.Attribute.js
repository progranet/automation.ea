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

Ea.Class.Attribute = {
	types: [],
	initialize: function() {
		for (var name in this._classes) {
			this.types.push(this._classes[name]);
		}
		this.types.reverse();
	}
};

Ea.Class.Attribute._Attribute = define({
	
	_proxy: null,
	
	create: function(proxy) {
		this._proxy = proxy;
	}
});

Ea.Class.Attribute.ApiProperty = extend(Ea.Class.Attribute._Attribute, {
	
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

Ea.Class.Attribute.Property = extend(Ea.Class.Attribute.ApiProperty, {
	
	_init: function(source) {
		source.setValue(this._proxy, this.getTyped(source, this._proxy.type));
	}
},
{
	unique: {
		filter: function(attribute) {
			return true;
		}
	}
});

Ea.Class.Attribute.List = extend(Ea.Class.Attribute.Property, {
	
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
},
{
	unique: {
		filter: function(attribute) {
			if (attribute.subtype == "List")
				return true;
			return false;
		}
	}
});

Ea.Class.Attribute.Map = extend(Ea.Class.Attribute.Property, {
	
	_init: function(source) {
		var string = this.getTyped(source, String);
		var mapValue = Ea.Class.Attribute.Map.stringToMap(string, this._proxy.separator || ";", this._proxy.assigment || "=");
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
	},
	unique: {
		filter: function(attribute) {
			if (attribute.subtype == "Map")
				return true;
			return false;
		}
	}
});

Ea.Class.Attribute.Collection = extend(Ea.Class.Attribute.ApiProperty, {
	
	_get: function(source, params) {
		return source.getValue(this._proxy).filter(params[0]);
	},
	
	_init: function(source) {
		source.setValue(this._proxy, Ea.getCollection(this._proxy.type, source.getApiValue(this._proxy), this._proxy));
	}
},
{
	unique: {
		filter: function(attribute) {
			if (attribute.type.isClass && (attribute.type == Ea.Collection._Base || attribute.type.isSubclassOf(Ea.Collection._Base)))
				return true;
			return false;
		}
	}
});

Ea.Class.Attribute.CollectionMap = extend(Ea.Class.Attribute.Collection, {},
{
	unique: {
		filter: function(attribute) {
			if (attribute.type.isClass && (attribute.type == Ea.Collection.Map || attribute.type.isSubclassOf(Ea.Collection.Map)))
				return true;
			return false;
		}
	}
});

Ea.Class.Attribute.Reference = extend(Ea.Class.Attribute.ApiProperty, {
	_init: function(source) {
		var api = source.getApiValue(this._proxy);
		var proxy = api ? Ea.get(this._proxy.type, api) : null;
		source.setValue(this._proxy, proxy);
	}
},
{
	unique: {
		filter: function(attribute) {
			if (attribute.type.isClass && attribute.type.isSubclassOf(Ea.Types.Any))
				return true;
			return false;
		}
	}
});

Ea.Class.Attribute.ReferenceByPointer = extend(Ea.Class.Attribute.Property, {
	
	_init: function(source) {
		var reference = this.getTyped(source, this._class.referenceType);
		source.setValue(this._proxy, (reference ? Ea[this._class.getBy](this._proxy.type, reference) : null));
	}
},
{
	unique: {}
});

Ea.Class.Attribute.ReferenceById = extend(Ea.Class.Attribute.ReferenceByPointer, {},
{
	getBy: "getById",
	referenceType: Number,
	unique: {
		filter: function(attribute) {
			if (attribute.type.isClass && attribute.type.isSubclassOf(Ea.Types.Any) && attribute.referenceType == "id")
				return true;
			return false;
		}
	}
});

Ea.Class.Attribute.ReferenceByGuid = extend(Ea.Class.Attribute.ReferenceByPointer, {},
{
	getBy: "getByGuid",
	referenceType: String,
	unique: {
		filter: function(attribute) {
			if (attribute.type.isClass && attribute.type.isSubclassOf(Ea.Types.Any) && attribute.referenceType == "guid")
				return true;
			return false;
		}
	}
});

Ea.Class.Attribute.CustomProperty = extend(Ea.Class.Attribute._Attribute, {
	get: function(object, params) {
		return object[this._proxy.getter].apply(object, params || []);
	}
},
{
	unique: {
		filter: function(attribute) {
			if (attribute.api)
				return false;
			return true;
		}
	}
});
