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

Ea._Base.Class = {};

Ea._Base.Class.Source = define({
	
	created: null,
	_transient: null,
	api: null,
	application: null,
	value: null,
	
	create: function(application, api) {
		this.api = api;
		this.application = application;
		this.value = {};
	}
	
});

Ea._Base.Class._Property = define({

	_prepared: false,

	_isClass: null,
	_isCollection: null,
	_isEaType: false,
	_isEaElementType: false,
	_isDataType: false,
	
	owner: null,
	className: null,
	qualifiedName: null,
	typeName: null,

	/**
	 * Evaluates type name to type
	 * 
	 * @private
	 * @param {String} typeName
	 * @type {Function}
	 */
	_typeEval: function(typeName) {
		var type = eval(typeName);
		if (!type)
			throw new Error("Unknown type name [" + typeName + "]");
		return type;
	},
	
	create: function(className, params) {
		
		_super.create();

		Core.merge(this, params);

		this.className = className;
		this.qualifiedName = this.className + "." + this.name;
		this._isCollection = this.elementType != null;
		this.typeName = (this.type || "String") + (this._isCollection ? "<" + this.elementType + ">" : "");
		
		var accessorName = this.name.replace(/^_+/g, "");
		accessorName = accessorName.substring(0,1).toUpperCase() + accessorName.substring(1);
		
		this._createAccessor("get", (this.private ? "_" : "") + (this.type == "Boolean" ? "is" : "get") + accessorName);
		
		if (!this.readOnly) {
			if (this._isCollection) {
				var mutatorName = this.single || this.name.replace(/^_+/g, "").replace(/s$/, "");
				mutatorName = mutatorName.substring(0,1).toUpperCase() + mutatorName.substring(1);
				this._createAccessor("add", (this.private ? "_" : "") + "create" + mutatorName);
				this._createAccessor("remove", (this.private ? "_" : "") + "delete" + mutatorName);
			}
			else {
				this._createAccessor("set", (this.private ? "_" : "") + "set" + accessorName);
			}
		}
	},
	
	_createAccessor: function(kind, name) {
		this._prepareAccessor(kind, name);
	},
	
	prepare: function() {
		
		if (this._prepared)
			throw new Error("Property already prepared: " + this.toString());

		this.owner = eval(this.className);
		this.type = this._typeEval(this.type || "String");
		
		if (this._isCollection && !Core.Types.AbstractCollection.isAssignableFrom(this.type))
			throw new Error("Element type declared for non collection property: " + this.toString());
		
		this._isClass = Core.Lang.isClass(this.type);

		if (this._isClass) {

			if (Core.Types.AbstractCollection.isAssignableFrom(this.type) && !this._isCollection)
				throw new Error("Element type not declared for collection property: " + this.toString());
			
			if (this._isCollection) {
				this.elementType = this._typeEval(this.elementType);
				if (this.elementType.conformsTo(Ea.Types.Any)) {
					this._isEaElementType = true;
				}
			}
			
			if (this.type.conformsTo(Ea.Types.Any)) {
				this._isEaType = true;
			}
			else if (this.type.conformsTo(Ea._Base.DataTypes.DataType)) {
				this._isDataType = true;
			}
			else if (!this._isCollection && !this.type.conformsTo(Ea._Base.Type)) {
				throw new Error("Illegal type for property: " + this.toString());
			}
		}
		this._prepared = true;
	},
	
	isPrepared: function() {
		return this._prepared;
	},
	
	get: function(object, params) {
		var value = this._get(object);
		return (this._isCollection && params && params.length != 0) ? value.filter(params[0]) : value;
	},
	
	set: function(object, params) {
		return this._set(object, params || []);
	},
	
	add: function(object, params) {
		return this._add(object, params || []);
	},
	
	remove: function(object, params) {
		return this._remove(object, params || []);
	},
	
	refresh: function(object) {
		var source = object._source;
		
		if (!(this.name in source.value))
			return false;
		
		delete source.value[this.name];
		return true;
	},
	
	_toString: function() {
		return this.qualifiedName + " :" + this.typeName;
	}
});

Ea._Base.Class.ApiProperty = extend(Ea._Base.Class._Property, {
	
	_getBy: null,
	tag: false,
	
	create: function(_class, features, params) {
		_super.create(_class, features, params);
		if (this.api.indexOf("tag:") == 0) {
			this.tag = true;
			this.api = this.api.substring(4);
		}
	},
	
	prepare: function() {
		_super.prepare();
		if (this._isEaType) {
			this._getBy = this.referenceBy ? ("getBy" + this.referenceBy.substr(0, 1).toUpperCase() + this.referenceBy.substr(1).toLowerCase()) : "get";
		}
	},
	
	_prepareAccessor: function(kind, name) {

	},
	
	_get: function(object) {
		
		var source = object._source;
		
		if (this.name in source.value)
			return source.value[this.name];

		var apiValue = this.getApiValue(source.api);
		var value = null;
		if (this._isEaType) {
			if (apiValue) {
				value = source.application[this._getBy](this.type, apiValue, {
					elementType: this.elementType,
					key: this.key
				});
				if (value) {
					var namespace = this.aggregation == "composite" ? object :null;
					value._namespace = namespace;
					if (this._isCollection && this._isEaElementType) {
						value.forEach(function(value) {
							value._namespace = namespace;
						});
					}
				}
			}
		}
		else if (this._isClass) {
			value = new this.type(apiValue, this);
		}
		else if (this.type == Boolean) {
			value = (typeof(apiValue) == "string") ? (apiValue.toLowerCase() === "true") : (new Boolean(apiValue)).valueOf();
		}
		else {
			value = (new this.type(apiValue)).valueOf();
		}
		source.value[this.name] = value;
		return value;
	},
	
	getApiValue: function(api) {
		if (this.index == null) {
			var value;
			if (this.tag) {
				var tags = api.TaggedValues;
				var tag = null;
				for (var i = 0; i < tags.Count; i++) {
					var t = tags.GetAt(i);
					if (t.Name == this.api) {
						tag = t;
						break;
					}
				}
				value = (tag ? tag.Value : null);
			}
			else {
				try {
					value = api[this.api];
					//	don't remove this dumb check:
					//		EA for some reason throws exception on access to Ea.Property._Base._value value for NoteLink property
					//		logging of this value is necessary for proper exception handing (i don't know why)
					if (this.qualifiedName == "Ea.Property._Base._value")
						_quietLogger("$", [value]);
				}
				catch(error) {
					warn("EA API exception on getting property value $ ($)", [this.toString(), error.message]);
					value = null;
				}
			}
			return value;
		}
		return api[this.api](this.index);
	},
	
	_set: function(object, params) {
		var source = object._source;
		var value = params[0];
		
		if (this._isEaType) {
			
			if (source._transient) {
				source._transient.push(value);
			}

			switch (this.referenceBy) {
			case "guid":
				value = value ? value.getGuid() : null;
				break;
			case "id":
				value = value ? value.getId() : null;
				break;
			default:
				value = value ? value._source.api : null;
			}
		}
		if (this._isDataType) {
			if (!value)
				throw new Error("Value of DataType cannot be null for property: " + this.toString());
			value = value.valueOf();
		}
		
		try {
			this.setApiValue(source.api, value);
		}
		catch (error) {
			throw new Error("Setting value for property: " + this.toString() + " threw exception:\r\n" + error.message);
		}
		
		delete source.value[this.name];
		return object;
	},
	
	setApiValue: function(api, value) {
		
		if (this.index == null) {
			if (this.tag) {
				var tag = api.TaggedValues.GetByName(this.api);
				if (tag) {
					tag.Value = value;
				}
				else {
					warn("Tagged Value not found: " + this.api);
				}
				return;
			}
			api[this.api] = value;
			return;
		}
		throw new Error("Setting indexed properties not supported: " + this.toString());
	},
	
	_add: function(object, params) {
		
		var source = object._source;
		
		var name = params[0];
		if (!(this.name in source.value)) {
			object._class._properties[this.name].get(object);
		}
		var collection = source.value[this.name];

		var type = params[1];
		
		var added = collection._create(name, type);
		added._source._transient = [];
		added._source._transient.push(object);
		added._source.creator = {
			object: object,
			property: this,
			collection: collection
		};

		return added;
	},
	
	_remove: function(object, params) {
		var source = object._source;
		var element = params[0];
		this._get(object);
		
		if (!this.elementType.isInstance(element))
			throw new Error("Specified object " + element + " type not conforms to collection element type [" + this.elementType.qualifiedName + "] for property: " + this.toString());
		
		var collection = source.value[this.name];
		collection._delete(element);
		collection.refresh();

		source.application.wipe(element);

		delete source.value[this.name];
		this._get(object);
	}	
});

Ea._Base.Class.DerivedProperty = extend(Ea._Base.Class._Property, {
	
	_accessors: null,
	
	create: function(_class, features, params) {
		this._accessors = {};
		_super.create(_class, features, params);
	},
	
	_prepareAccessor: function(kind, name) {
		this._accessors[kind] = name + "$inner";
	},

	_get: function(object) {

		var source = object._source;
		
		if (this.name in source.value)
			return source.value[this.name];
		
		var value = object[this._accessors["get"]].apply(object);
		source.value[this.name] = value;
		return value;
	},
	
	_set: function(object, params) {
		object[this._accessors["set"]].apply(object, params);
		delete object._source.value[this.name];
		return object;
	},
	
	_add: function(object, params) {
		var added = object[this._accessors["add"]].apply(object, params);
		delete object._source.value[this.name];
		this._get(object);
		return added;
	},
	
	_remove: function(object, params) {
		object[this._accessors["remove"]].apply(object, params);
		delete object._source.value[this.name];
		this._get(object);
	}
});
