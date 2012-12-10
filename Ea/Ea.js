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
Ea = {
	
	/**
	 * Modification Mode switch
	 * 
	 * @memberOf Ea
	 * @constant
	 * @type Boolean
	 */
	mm: false,
	
	params: {},
	
	_application: null,
	
	/**
	 * Returns EA application if initialized
	 * 
	 * @param name
	 * @returns {Ea.Application._Base}
	 * @static
	 */
	getApplication: function() {
		return this._application;
	},
	
	initialize: function() {
		Ea.Class.prepareClasses();
	},
	
	initializeDefaultApplication: function(targetClass) {
		this._application =  new Ea.Instance();
		this.initializeLogs(targetClass || Ea.Helper.Target);
		return this._application;
	},
	
	initializeLogs: function(targetClass) {
		
		var systemTarget = new targetClass("System", Core.Target.Type.DEBUG);
		var scriptTarget = new targetClass("Script", Core.Target.Type.INFO);
		var treeTarget = new targetClass("Script", Core.Target.Type.TREE);
		var quietTarget = new Core.Target.AbstractTarget(Core.Target.Type.BLIND);
		
		Core.Log.registerTarget("error", systemTarget);
		Core.Log.registerTarget("exception", systemTarget);
		Core.Log.registerTarget("stack", systemTarget);
		Core.Log.registerTarget("warn", systemTarget);
		Core.Log.registerTarget("debug", systemTarget);
		Core.Log.registerTarget("info", scriptTarget);
		Core.Log.registerTarget("tree", treeTarget);
		Core.Log.registerTarget("quiet", quietTarget);
	},
	
	_guid: /^\{[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}\}$/i,
	
	isGuid: function(guid) {
		return this._guid.test(guid);
	},
	
	_objectTypes: {},
	_namespaces: {},
	
	register: function(type, objectType) {
		var namespace = include(type);
		this._namespaces[namespace.qualifiedName] = namespace;
		if (objectType)
			this._objectTypes[objectType] = namespace;
	},
	
	addType: function(namespace, typeName) {
		if (typeName in namespace)
			throw new Error("Type already exists: $", [namespace[typeName]]);
		namespace[typeName] = Core.Lang.extend(namespace, typeName, namespace._Base);
		warn("Not implemented $.$ type", [namespace.qualifiedName, typeName]);
		return namespace[typeName];
	},
	
	log: function(element) {
		Ea.Helper.Log.getLog(element).log();
	}
};

Ea.Instance = define(/** @lends Ea.Instance# */{
	
	_application: null,
	_project: null,
	_repository: null,
	
	/**
	 * @constructs
	 */
	create: function(params) {
		params = params || {};
		var app = params.path ? new ActiveXObject("EA.App") : App;
		this._application = Ea.Class.createProxy(this, Ea.Application._Base, app);
		this._project = Ea.Class.createProxy(this, Ea.Project._Base, app.Project);
		this._repository = Ea.Class.createProxy(this, Ea.Repository._Base, app.Repository, {syntax: params.syntax});
		if (params.path)
			this._repository.open(params.path);
	},
	
	/**
	 * @memberOf Ea.Instance#
	 * @returns {Ea.Application._Base}
	 */
	getApplication: function() {
		return this._application;
	},
	
	/**
	 * @memberOf Ea.Instance#
	 * @returns {Ea.Project._Base}
	 */
	getProject: function() {
		return this._project;
	},
	
	/**
	 * @memberOf Ea.Instance#
	 * @returns {Ea.Repository._Base}
	 */
	getRepository: function() {
		return this._repository;
	}
	
});


Ea.PrimitiveType = extend(Core.Types.Named, {},
{
	_primitiveTypes: {},
	getPrimitiveType: function(name) {
		if (!name)
			return null;
		if (!(name in this._primitiveTypes)) {
			this._primitiveTypes[name] = new Ea.PrimitiveType(name);
		}
		return this._primitiveTypes[name];
		
	},
	
	create: function(source, params) {
		return new this(source, params);
	}
});


Ea.Relationship = define({
	
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
		this._isClient = params.isClient;
		this._relation = this._connector.getRelation(!this._isClient);
		
		this._guard = this._connector.getGuard();

		this._from = params.from;
		this._fromEnd = params.fromEnd;
		this._to = params.to;
		this._toEnd = params.toEnd;
		
		this._role = this._toEnd.getRole();

		this._fromAttribute = this._isClient ? this._connector.getSupplierAttribute() : this._connector.getClientAttribute();
		this._fromMethod = this._isClient ? this._connector.getSupplierMethod() : this._connector.getClientMethod();
		this._toAttribute = !this._isClient ? this._connector.getSupplierAttribute() : this._connector.getClientAttribute();
		this._toMethod = !this._isClient ? this._connector.getSupplierMethod() : this._connector.getClientMethod();
		
		this._opposite = params.opposite || new Ea.Relationship({
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
		return this._fromEnd.getAggregation() != "none";
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


Ea.CustomReference = define(/** @lends Ea.CustomReference# */{
	_notes: null,
	_supplier: null,
	
	/**
	 * @constructs
	 * @param notes
	 * @param supplier
	 */
	create: function(notes, supplier) {
		_super.create(params);
		this._notes = notes;
		this._supplier = supplier;
	},
	
	/**
	 * @memberOf Ea.CustomReference#
	 */
	getNotes: function() {
		return this._notes;
	},
	
	getSupplier: function() {
		return this._supplier;
	},
	
	_toString: function() {
		return " --> " + this._supplier;
	}
});

Ea.ContextReference = define({
	_notes: null,
	_supplier: null,
	_connection: null,

	create: function(notes, supplier, connection) {
		_super.create(params);
		this._notes = notes;
		this._supplier = supplier;
		this._connection = connection;
	},
	
	getNotes: function() {
		return this._notes;
	},
	
	getSupplier: function() {
		return this._supplier;
	},
	
	getConnection: function() {
		return this._connection;
	}
});

include("Ea.Class@Ea");
include("Ea.Helper@Ea");

Ea.register("Ea.Types@Ea.Types");
Ea.register("Ea.Application@Ea.Types.Core");
Ea.register("Ea.Collection@Ea.Types", 3);
Ea.register("Ea.Package@Ea.Types", 5);

include("Ea.Tag@Ea.Types.Common");
include("Ea.FeatureConstraint@Ea.Types.Common");

Ea.register("Ea.Connector@Ea.Types.Connector", 7);
Ea.register("Ea.Diagram@Ea.Types.Diagram", 8);
Ea.register("Ea.Element@Ea.Types.Element", 4);
