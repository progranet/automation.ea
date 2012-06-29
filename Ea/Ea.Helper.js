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
		updateFn: "Update",
		indent: "      "
	},
	
	isCollectionType: function(type) {
		return Core.Lang.isClass(type) && (type == Core.Types.Collection || type.isSubclassOf(Core.Types.Collection));
	},
	
	typeEval: function(type) {
		return (typeof type == "string") ? eval(type) : type;
	},
	
	inspect: function(object) {
		this._inspect(object, 0, "$ = {", []);
	},
	
	_ids: {},
	
	_indent: function(number) {
		var indent = "";
		for (var i = 0; i < number; i++) {
			indent = indent + this.params.indent;
		}
		return indent;
	},

	_expand: function(template, params, value, indent, _private) {
		if (Ea.Any.isInstance(value) && !value.instanceOf(Ea.Namespace)) {
			if (!_private) {
				this._inspect(value, indent + 1, template + " = {", params);
				return;
			}
			template = template + " = {#PRIVATE#}";
		}
		params.push(value);
		info(this._indent(indent + 1) + template, params);
	},
	
	_inspect: function(object, indent, template, params) {
		
		var type = object._class;
		var properties = type.getProperties();
		
		params.push(object);
		info(this._indent(indent) + template, params);

		if (this._ids[object.__id]) {
			info(this._indent(indent + 1) + "#LOOP#");
		}
		else {
			this._ids[object.__id] = object;
			for (var name in properties) {

				var property = properties[name];
				var value = property.get(object);
				
				var params = {
					name: property.property.replace(/^_+/, ""),
					_private: property.private,
					type: property.type,
					isCollection: value && property.type.isClass && value.instanceOf(Core.Types.Collection)
				};
				params.elementType = params.isCollection ? property.elementType : null;
				params.typeName = params.isCollection ? Core.Output.getString(params.type) + "<" + Core.Output.getString(params.elementType) + ">" : Core.Output.getString(params.type);
				params.template = (params._private ? "– " : "+ ") + params.name + " [" + params.typeName + "]";
				
				if (params.isCollection) {
					if (value.instanceOf(Core.Types.Map)) {
						if (value.size == 0) {
							info(this._indent(indent + 1) + "$ = {}", [params.template]);
						}
						else {
							info(this._indent(indent + 1) + "$ = {", [params.template]);
							value.forEach(function(value, key) {
								this._expand("$ = $", [key], value, indent + 1, params._private);
							});
							info(this._indent(indent + 1) + "}");
						}
					}
					else {
						if (value.size == 0) {
							info(this._indent(indent + 1) + "$ = []", [params.template]);
						}
						else {
							info(this._indent(indent + 1) + "$ = [", [params.template]);
							value.forEach(function(value, index) {
								this._expand("$", [], value, indent + 1, params._private);
							});
							info(this._indent(indent + 1) + "]");
						}
					}
				}
				else {
					this._expand("$ = $", [params.template], value, indent, params._private);
				}
				
			}
		}
		info(this._indent(indent) + "}");
	}
};

Ea.Helper.Target = extend(Core.Target.AbstractTarget, {
	
	_name: null,
	
	create: function(name, debug) {
		_super.create(debug);
		this._name = name;
		Ea.Application.getRepository().showOutput(this._name);
		Ea.Application.getRepository().clearOutput(this._name);
	},
	
	write: function(message) {
		Ea.Application.getRepository().writeOutput(this._name, message);
	}
});

Ea.Helper.Relationship = define({
	
	_connector: null,
	_relation: null,
	_isClient: null,

	_guard: null,
	_role: null,

	_to: null,
	_toEnd: null,
	_toAttribute: null,
	_toMethod: null,
	
	_from: null,
	_fromEnd: null,
	_fromAttribute: null,
	_fromMethod: null,
	
	_opposite: null,
	
	create: function(params) {
		
		_super.create(params);
		
		this._connector = params.connector;
		this._relation = this._connector.getRelation(!this._isClient);
		this._isClient = params.isClient;
		
		this._guard = this._connector.getGuard();

		this._to = params.to;
		this._toEnd = params.toEnd;
		this._toAttribute = !this._isClient ? this._connector.getSupplierAttribute() : this._connector.getClientAttribute();
		this._toMethod = !this._isClient ? this._connector.getSupplierMethod() : this._connector.getClientMethod();
		
		this._role = this._toEnd.getRole();

		this._from = params.from;
		this._fromEnd = params.fromEnd;
		this._fromAttribute = this._isClient ? this._connector.getSupplierAttribute() : this._connector.getClientAttribute();
		this._fromMethod = this._isClient ? this._connector.getSupplierMethod() : this._connector.getClientMethod();
		
		this._opposite = params.opposite || new Ea.Helper.Relationship({
			from: params.to, 
			fromEnd: params.toEnd,
			connector: params.connector, 
			isClient: !params.isClient, 
			to: params.from, 
			toEnd: params.fromEnd,
			opposite: this
		});
	},
	
	getFrom: function() {
		return this._from;
	},
	
	getFromEnd: function() {
		return this._fromEnd;
	},
	
	getFromAttribute: function() {
		return this._fromAttribute;
	},
	
	getFromMethod: function() {
		return this._fromMethod;
	},
	
	getName: function() {
		if (this._role)
			return this._role;
		var name = this._to.getName();
		return name.substr(0, 1).toLowerCase() + name.substr(1);
	},
	
	getTo: function() {
		return this._to;
	},
	
	getToEnd: function() {
		return this._toEnd;
	},
	
	getToAttribute: function() {
		return this._toAttribute;
	},
	
	getToMethod: function() {
		return this._toMethod;
	},
	
	getRelation: function() {
		return this._relation;
	},
	
	getConnector: function() {
		return this._connector;
	},
	
	isAggregation: function() {
		return this._fromEnd.getAggregation() != 0;
	},
	
	getAggregation: function() {
		return this._fromEnd.getAggregation();
	},
	
	getMultiplicity: function() {
		return this._toEnd.getCardinality();
	},
	
	isNavigable: function() {
		return this._toEnd.getNavigable() != "Non-Navigable";
	},
	
	getNavigability: function() {
		return this._toEnd.getNavigable();
	},
	
	getOpposite: function() {
		return this._opposite;
	},
	
	isClient: function() {
		return this._isClient;
	},
	
	getGuard: function() {
		return this._guard;
	}
});

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
		this.getter = params.get;
		this.setter = params.set;
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
		var source = object.instanceOf(Ea.Source) ? object : object._source;
		if (Ea.mm || !source.isInitialized(this))
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
		source.setValue(this, Ea.getCollection(this.type, source.getApiValue(this), this));
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
	}/*,
	
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
	}*/
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
	_init: function(source) {
		var api = source.getApiValue(this);
		var proxy = api ? Ea.get(this.type, api) : null;
		source.setValue(this, proxy);
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
		var reference = this.getTyped(source, this._class.referenceType);
		source.setValue(this, (reference ? Ea[this._class.getBy](this.type, reference) : null));
	}/*,
	
	_set: function() {
		this.context.api[this.property] = (this.value ? this.value.api[this.reference] : null);
	}*/
},
{
	typeDefault: "Ea.Element._Base"
});

Ea.Helper.ReferenceById = extend(Ea.Helper.ReferenceByPointer, {},
{
	getBy: "getById",
	referenceType: Number
});

Ea.Helper.ReferenceByGuid = extend(Ea.Helper.ReferenceByPointer, {},
{
	getBy: "getByGuid",
	referenceType: String
});


Ea.Helper.Log = define({
	
	_path: null,
	_element: null,
	
	create: function(element) {
		_super.create();
		this._element = element;
	},
	
	getPath: function() {
		if (!this._path || Ea.mm) {
			this._path = [];
			var parent = this._element.getParent();
			if (parent) {
				var parentPath = Ea.Helper.Log.getLog(parent).getPath();
				for (var p = 0; p < parentPath.length; p++) {
					this._path.push(parentPath[p]);
				}
			}
			this._path.push(this._element);
		}
		return this._path;
	},
	
	log: function() {
		
		var path = this.getPath();
		var _tab = function(count, string) {
			var gen = "";
			for (var i = 0; i < count; i++)
				gen = gen + string;
			return gen;
		};

		if (path.length > 0) {
			for (var p = 0; p < path.length; p++) {
				if (!Ea.Helper.Log._current || p >= Ea.Helper.Log._current.length || Ea.Helper.Log._current[p] != path[p]) {
					var element = path[p];
					var string = element.instanceOf(Ea.Package._Base) ? "[•] " + element + "" : " " + element;
					info(_tab(p, "      |") + "—" + string + "");
				}
			}
			Ea.Helper.Log._current = path;
		}
	}
},
{
	_current: null,
	
	_logs: {},

	getLog: function(element) {
		if (!Ea.Helper.Log._logs[element.getGuid()])
			Ea.Helper.Log._logs[element.getGuid()] = new Ea.Helper.Log(element);
		return Ea.Helper.Log._logs[element.getGuid()];
	}
});
