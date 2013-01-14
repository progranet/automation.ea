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

Ea._Base.Class = {

	_types: {},
	
	/**
	 * @param {Class} _class
	 * @memberOf Ea._Base.Class
	 */
	registerClass: function(_class) {
		
		if (_class in this._types)
			return;

		this._types[_class] = {
			attributes: []
		};
		
		var meta = _class.namespace.meta;
		if (meta && meta.objectType)
			Ea._objectTypes[meta.objectType] = _class;
	},
	
	/**
	 * @param {Ea._Base.Class._Attribute} attribute
	 */
	registerAttribute: function(attribute) {
		var _class = attribute.owner;
		this.registerClass(_class);
		var _classReflection = Ea._Base.Class._types[_class];
		_classReflection.attributes.push(attribute);
	},
	
	/**
	 * Returns attributes owned (directly) by specified class
	 * 
	 * @param {Class} _class
	 * @type {Array<Ea._Base.Class._Attribute>}
	 */
	getOwnedAttributes: function(_class) {
		return Ea._Base.Class._types[_class].attributes;
	},
		
	/**
	 * Returns all attributes of specified class
	 * 
	 * @param {Class} _class
	 * @type {Array<Ea._Base.Class._Attribute>}
	 */
	getAttributes: function(_class) {
		var attributes = [];
		if (_class._super == Ea.Types.Any || _class._super.isSubclassOf(Ea.Types.Any)) {
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
	 * Creates new property. Used on class initialization, to create accessors
	 * 
	 * @param {Object} params Parameters of property such as type, visibility
	 */
	property: function(params) {
		if (params.derived) {
			return new Ea._Base.Class.DerivedAttribute(params);
		}
		return new Ea._Base.Class.ApiAttribute(params);
	},
	
	/**
	 * Creates abstraction layer proxy object for specified EA API object
	 * 
	 * @param {Object} application
	 * @param {Class} baseType
	 * @param {Object} api
	 * @param {Object} params
	 * @type {Ea.Types.Any}
	 */
	createProxy: function(application, baseType, api, params) {
		var source = {
			api: api,
			application: application,
			value: {}
		};
		var type = baseType.determineType({_source: source});
		var proxy = new type(source, params);
		return proxy;
	}	
};

Ea._Base.Class._Attribute = define({

	owner: null,
	name: null,
	qualifiedName: null,

	create: function(params) {
		_super.create();
		Core.merge(this, params);
	},
	
	/**
	 * 
	 */
	initialize: function(_class, propertyName, properties) {
		this.owner = _class;
		this.name = propertyName;
		this.qualifiedName = this.owner.qualifiedName + "." + this.name;

		var accesorName = this.name.replace(/^_+/g, "");
		accesorName = accesorName.substring(0,1).toUpperCase() + accesorName.substring(1);
		
		var prefix = this.type == "Boolean" ? "is" : "get";
		var getter = (this.private ? "_" : "") + prefix + accesorName;
		this._createAccessor("get", getter, properties);
		
		if (this.elementType) {
			var adder = (this.private ? "_" : "") + "create" + accesorName.substr(0, accesorName.length - 1);
			this._createAccessor("add", adder, properties);
			var remover = (this.private ? "_" : "") + "delete" + accesorName.substr(0, accesorName.length - 1);
			this._createAccessor("remove", remover, properties);
		}
		else {
			var setter = (this.private ? "_" : "") + "set" + accesorName;
			this._createAccessor("set", setter, properties);
		}
		
		Ea._Base.Class.registerAttribute(this);
	},
	
	_prepared: false,
	prepare: function() {
		
		if (this._prepared)
			throw new Error("Property " + this.qualifiedName + " already prepared");
		
		this.type = Ea._Base.Helper.typeEval(this.type || String);
		this.elementType = Ea._Base.Helper.isCollectionType(this.type) ? Ea._Base.Helper.typeEval(this.elementType) : null;
		this._prepared = true;
	},
	
	get: function(object, params) {
		return this._get(object, params);
	},
	
	set: function(object, params) {
		return this._set(object, params);
	},
	
	add: function(object, params) {
		return this._add(object, params);
	},
	
	remove: function(object, params) {
		return this._remove(object, params);
	}
});

Ea._Base.Class.ApiAttribute = extend(Ea._Base.Class._Attribute, /** @lends Ea._Base.Class.ApiAttribute# */{
	
	_getBy: null,
	
	prepare: function() {
		_super.prepare();
		if (this.type.isClass && (this.type.isSubclassOf(Core.Types.Collection) || this.type.isSubclassOf(Ea.Types.Any))) {
			this._getBy = this.referenceBy ? ("getBy" + this.referenceBy.substr(0, 1).toUpperCase() + this.referenceBy.substr(1).toLowerCase()) : "get";
		}
	},
	
	_createAccessor: function(kind, name, properties) {
		if (name in properties)
			throw new Error("Accesor already exists for not derived property: " + this.owner.qualifiedName + "." + name);
		properties[name] = new Function("return this._class." + this.name + "." + kind + "(this, arguments);");
		Core.enrichMethod(properties, name, this.qualifiedName, false);
	},
	
	_get: function(object, params) {
		var source = object._source;
		if (!source.application.cacheProperties || !(this.name in source.value))
			this._init(source);
		var value = source.value[this.name];
		if (this.type.isClass && "processValue" in this.type) {
			value = this.type.processValue(value, params || []);
		}
		return value;
	},
	
	_init: function(source) {
		var apiValue = this._getApiValue(source);
		var value = null;
		if (this.type.isClass) {
			if (this.type.isSubclassOf(Core.Types.Collection) || this.type.isSubclassOf(Ea.Types.Any)) {
				value = apiValue ? source.application._repository[this._getBy](this.type, apiValue, this) : null;
			}
			else {
				value = this.type.create(apiValue, this);
			}
		}
		else {
			value = new this.type(apiValue).valueOf();
		}
		source.value[this.name] = value;
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
	
	_set: function(object, params) {
		var source = object._source;
		var value = params[0];
		try {
			this._setApiValue(source, value);
		}
		catch (error) {
			throw new Error("Setting value for " + this.qualifiedName + " threw exception:\r\n" + error.message);
		}
		delete source.value[this.name];
	},
	
	_setApiValue: function(source, value) {
		if (this.type.isClass) {
			if (this.type.isSubclassOf(Core.Types.Collection)) {

				return;
			}
			if (this.type.isSubclassOf(Ea.Types.Any)) {
				switch (this.referenceBy) {
				case "guid":
					source.api[this.api] = value ? value.getGuid() : null;
					break;
				case "id":
					source.api[this.api] = value ? value.getId() : null;
					break;
				default:
					source.api[this.api] = value ? value._source.api : null;
				}
				return;
			}
			// TODO: better solution based on data types
			source.api[this.api] = value;
			return;
		}
		if (this.index == null) {
			source.api[this.api] = value;
			return;
		}
	},
	
	_add: function(object, params) {
		var source = object._source;
		var name = params[0];
		var type = params[1];
		var element = params[2];
		if (!(this.name in source.value)){
			object._class[this.name].get(object);
		}
		var added = source.value[this.name]._create(name, type, element);
		delete source.value[this.name];
		this._get(object);
		return added;
	},
	
	_remove: function(object, params) {
		var source = object._source;
		var element = params[0];
		source.value[this.name]._delete(element);
		delete source.value[this.name];
		// TODO: remove from repository cache
	}
});

Ea._Base.Class.DerivedAttribute = extend(Ea._Base.Class._Attribute, /** @lends Ea._Base.Class.DerivedAttribute# */{
	
	_accesors: null,
	
	create: function(params) {
		_super.create(params);
		this._accesors = {};
	},
	
	_createAccessor: function(kind, name, properties) {
		var accessor = properties[name];
		if (!accessor) {
			if (kind == "get")
				throw new Error("Getter not defined for derived property: " + this.owner.qualifiedName + "." + name);
			return;
		}
		
		properties[name + "$inner"] = accessor;
		this._accesors[kind] = name + "$inner";
		
		properties[name] = new Function("return this._class." + this.name + "." + kind + "(this, arguments);");
		Core.enrichMethod(properties, name, this.qualifiedName, false);
	},

	_get: function(object, params) {
		var source = object._source;
		params = params || [];
		// if there's any arguments passed to getter (such as filter for collection type properties) cache is omitted
		if (params.length != 0 || !source.application.cacheProperties || !(this.name in source.value))
			return this._init(object, params);
		var value = source.value[this.name];
		return value;
	},
	
	_init: function(object, params) {
		var value = object[this._accesors["get"]].apply(object, params);
		if (params.length == 0)
			object._source.value[this.name] = value;
		return value;
	},
	
	_set: function(object, params) {
		object[this._accesors["set"]].apply(object, params || []);
		delete object._source.value[this.name];
	},
	
	_add: function(object, params) {
		var added = object[this._accesors["add"]].apply(object, params || []);
		delete object._source.value[this.name];
		this._get(object);
		return added;
	},
	
	_remove: function(object, params) {
		//return object[this._accesors["remove"]].apply(object, params || []);
	}
});

