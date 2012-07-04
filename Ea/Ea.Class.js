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

	id: null,
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
		
		this.id = params.id;
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
		for (var ti = 0; ti < Ea.Class.Attribute.types.length; ti++) {
			var type = Ea.Class.Attribute.types[ti];
			var filter = type.unique.filter;
			if (filter) {
				if (filter(this)) {
					attributeType = type;
					break;
				}
			}
		}
		this._attribute = new attributeType(this);

		this.owner._addProperty(this);
		this._prepared = true;
	},
	
	get: function(object, params) {
		return this._attribute.get(object, params);
	}
});

include("Ea.Class.Attribute@Ea");
