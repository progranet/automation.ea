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

Ea.Helper = {
		
	params: {
		updateFn: "Update"
	},
	
	isCollectionType: function(type) {
		return Core.Lang.isClass(type) && (type == Core.Types.Collection || type.isSubclassOf(Core.Types.Collection));
	},
	
	typeEval: function(type) {
		return (typeof type == "string") ? eval(type) : type;
	},

	inspect: function(object, indent) {
		
		indent = indent || "      ";
		
		var type = object._class;
		var properties = type.getProperties();
		
		info("$ = {", [object._class]);

		for (var name in properties) {

			var property = properties[name];
			var name = property.property.replace(/^_+/, "");
			var _private = property.private;
			var type = property.type;
			var value = property.get(object);
			var isCollection = value && property.type.isClass && value.instanceOf(Core.Types.Collection);
			var elementType = isCollection ? property.elementType : null;
			
			var out = function(sufix) {
				if (isCollection)
					Core.Log.logs.info.call(Inspect, "execute", indent + "$$ [$<$>] = $", [_private ? "–  " : "+ ", name, type, elementType, sufix]);
				else
					Core.Log.logs.info.call(Inspect, "execute", indent + "$$ [$] = $", [_private ? "–  " : "+ ", name, type, sufix]);
				//Core.Log.logs.info.call(Inspect, "execute", indent + "$$ [$] = $", [_private ? "–  " : "+ ", name, type, sufix]);
			};
			
			if (isCollection) {
				if (value.instanceOf(Core.Types.Map)) {
					if (value.size == 0) {
						out("{}");
					}
					else {
						out("{");
						value.forEach(function(value, key) {
							if (value && value._toString)
								value = value._toString();
							info(indent + indent + "$ = $", [key, value]);
						});
						info(indent + "}");
					}
				}
				else {
					if (value.size == 0) {
						out("[]");
					}
					else {
						out("[");
						value.forEach(function(value, index) {
							if (value && value._toString)
								value = value._toString();
							info(indent + indent + "$", [value]);
						});
						info(indent + "]");
					}
				}
			}
			else {
				if (value && value._toString)
					value = value._toString();
				out(value);
			}
			
		}
		info("}");
	}
};

Ea.Helper.AbstractProperty = define({

	private: null,
	type: null,
	elementType: null,

	owner: null,
	property: null,
	qualifiedName: null,
	
	getter: null,
	setter: null,
	
	create: function(params) {
		this.private = params.private;
		this.type = params.type || this._class.typeDefault;
	},
	
	initialize: function(_class, propertyName, properties) {
		this.owner = _class;
		this.property = propertyName;
		this.qualifiedName = this.owner.qualifiedName + "." + this.property;
		this._initialize(_class, propertyName, properties);
	},
	
	_prepared: false,
	prepare: function() {
		if (this._prepared) return;
		this.type = Ea.Helper.typeEval(this.type);
		this.owner._addProperty(this);
		this._prepare();
		this._prepared = true;
	},
	
	_prepare: function() {

	},
	
	get: function(object, params) {
		return null;
	}
},
{
	typeDefault: String,
	elementTypeDefault: "Ea.Element._Base"
});

Ea.Helper.CustomProperty = extend(Ea.Helper.AbstractProperty, {

	create: function(params) {
		_super.create(params);
		this.getter = params.getter;
		this.setter = params.setter;
		this.elementType = params.elementType || this._class.elementTypeDefault;
	},
	
	_prepare: function() {
		this.elementType = Ea.Helper.isCollectionType(this.type) ? Ea.Helper.typeEval(this.elementType) : null;
	},
	
	_initialize: function(_class, propertyName, properties) {

	},
	
	get: function(object, params) {
		return object[this.getter].apply(object, params || []);
	}
});

Ea.Helper.Source = define({
	_api: null,
	_value: null,
	create: function(api) {
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
		return this._value[property.property];
	},
	setValue: function(property, value) {
		this._value[property.property] = value;
	},
	isInitialized: function(property) {
		return (property.property in this._value);
	}
});

Ea.Helper.ApiProperty = extend(Ea.Helper.AbstractProperty, {
	
	api: null,
	index: null,

	create: function(params) {
		_super.create(params);
		this.api = params.api;
		this.index = params.index;
	},
	
	_getAccessor: function(kind) {
		var body = "return this._class." + this.property + "." + kind + "(this._source, arguments);";
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
	
	_initialize: function(_class, propertyName, properties) {
		var accesorName = this.property.replace(/^_+/g, "");
		accesorName = accesorName.substring(0,1).toUpperCase() + accesorName.substring(1);

		this.getter = this._createAccessor("get", properties, accesorName);
		this.setter = this._createAccessor("set", properties, accesorName);
	},
	
	getTyped: function(source, type) {
		var value = source.getApiValue(this);
		return (type.isClass ? new type(value) : value);
	},
	
	get: function(object, params) {
		var source = object.instanceOf(Ea.Helper.Source) ? object : object._source;
		if (!source.isInitialized(this))
			this._init(source);
		return this._get(source, params || []);
	},
	
	_get: function(source) {
		return source.getValue(this);
	},
	
	_toString: function() {
		return (this.private ? "- " : "+ ") + this.qualifiedName;
	}
});

Ea.Helper.Collection = extend(Ea.Helper.ApiProperty, {
	
	filter: null,
	
	create: function(params) {
		_super.create(params);
		this.filter = params.filter;
		this.elementType = params.elementType || this._class.elementTypeDefault;
	},
	
	_prepare: function() {
		this.elementType = Ea.Helper.typeEval(this.elementType);
	},
	
	_get: function(source, params) {
		return source.getValue(this).filter(params[0]);
	},
	
	_init: function(source) {
		source.setValue(this, Ea.getCollection(this, source.getApiValue(this)));
	}
},
{
	typeDefault: "Ea.Collection._Base"
});

Ea.Helper.CollectionMap = extend(Ea.Helper.Collection, {

	key: null,
	value: null,
	
	create: function(params) {
		_super.create(params);
		this.key = params.key;
		this.value = params.value;
	}
},
{
	typeDefault: "Ea.Collection.Map"
});

Ea.Helper.Property = extend(Ea.Helper.ApiProperty, {
	
	updateFn: null,

	create: function(params) {
		_super.create(params);
		this.updateFn = params.updateFn || Ea.Helper.params.updateFn;
	},
	
	_init: function(source) {
		source.setValue(this, this.getTyped(source, this.type));
	},
	
	set: function(params) {
		this.value = params[0];
		this._set();
		this._update();
	},
	
	_set: function() {
		this.context.api[this.property] = this.value;
	},
	
	_update: function() {
		this.context.api[this.updateFn]();
	}
});

Ea.Helper.List = extend(Ea.Helper.Property, {
	
	separator: null,
	
	create: function(params) {
		_super.create(params);
		this.separator = params.separator || this._class.separatorDefault;
	},
	
	_init: function(source) {
		var string = this.getTyped(source, String);
		var value = string ? string.split(this.separator) : [];
		var list = {
			value: value,
			forEach: function(fn) {
				for (var i = 0; i < value.length; i++) {
					fn(value[i], i);
				}
			}
		};
		source.setValue(this, list);
	},
	
	_set: function() {
		throw new Error("Invalid method call");
	}
},
{
	separatorDefault: ","
});

Ea.Helper.Map = extend(Ea.Helper.Property, {
	
	separator: null,
	assigment: null,
	
	create: function(params) {
		_super.create(params);
		this.separator = params.separator || this._class.separatorDefault;
		this.assigment = params.assigment || this._class.assigmentDefault;
	},

	_init: function(source) {
		var string = this.getTyped(source, String);
		var mapValue = Ea.Helper.Map.stringToMap(string, this.separator, this.assigment);
		var context = this;
		var map = {
			value: mapValue,
			get: function(key) {
				return mapValue[key];
			},
			set: function(key, value) {
				mapValue[key] = value;
				context.api[context.property] = Ea.Helper.Map.mapToString(mapValue, context.separator, context.assigment);
				context._update();
			}
		};
		source.setValue(this, map);
	},
	
	_set: function() {
		throw new Error("Invalid method call");
	}
},
{
	separatorDefault: ";",
	assigmentDefoult: "=",
	
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
	
	mapToString: function(object, separator, assigment) {
		var string = "";
		for (var propertyName in object) {
			string = string + propertyName + assigment + object[propertyName] + separator;
		}
		return string;
	}
});

Ea.Helper.Reference = extend(Ea.Helper.ApiProperty, {
	create: function(params) {
		_super.create(params);
	},
	_init: function(source) {
		source.setValue(this, Ea.get(this.type, source.getApiValue(this)));
	}
},
{
	typeDefault: "Ea.Element._Base"
});

Ea.Helper.ReferenceByPointer = extend(Ea.Helper.Property, {
	
	getBy: null,
	reference: null,
	referenceType: null,

	_init: function(source) {
		var reference = this.getTyped(source, this.referenceType);
		source.setValue(this, (reference ? Ea[this.getBy](this.type, reference) : null));
	},
	
	_set: function() {
		this.context.api[this.property] = (this.value ? this.value.api[this.reference] : null);
	}
},
{
	typeDefault: "Ea.Element._Base"
});

Ea.Helper.ReferenceById = extend(Ea.Helper.ReferenceByPointer, {
	create: function(params) {
		_super.create(params);
		this.getBy = "getById";
		this.referenceType = Number;
	}
});

Ea.Helper.ReferenceByGuid = extend(Ea.Helper.ReferenceByPointer, {
	create: function(params) {
		_super.create(params);
		this.getBy = "getByGuid";
		this.referenceType = String;
	}
});

Ea.Helper.Inspect = define({
});