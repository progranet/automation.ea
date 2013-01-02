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
	
	OBJECT_TYPES_NUMBER: 100,

	params: {},
	
	_application: null,
	
	/**
	 * Returns default EA application if initialized
	 * 
	 * @memberOf Ea
	 * @type {Ea.Application._Base}
	 */
	getDefaultApplication: function() {
		return this._application;
	},
	
	initialize: function() {
		Ea.Class.prepareClasses();
	},
	
	/**
	 * Creates new EA application
	 * 
	 * @param {Object} params Specifies parameters of application: params.path - path in the file system
	 * @type {Ea.Application._Base}
	 */
	createApplication: function(params) {
		params = params || {};
		var applicationApi = params.path ? new ActiveXObject("EA.App") : App;
		var application = Ea.Class.createProxy(null, Ea.Application._Base, applicationApi, params);
		if (params.path)
			application.getRepository().open(params.path);
		return application;
	},
	
	
	/**
	 * Initializes default EA application
	 * 
	 * @param {Core.Target.AbstractTarget} targetClass Target for logger mechanizm
	 * @param {Object} params
	 * @type {Ea.Application._Base}
	 */
	initializeDefaultApplication: function(targetClass, params) {
		if (!this._application) {
			this._application = this.createApplication(params);
			this._initializeLogs(targetClass || Ea.Helper.Target);
		}
		else {
			warn("Default application already initialized");
		}
		return this._application;
	},
	
	/**
	 * @private
	 * @param {Core.Target.AbstractTarget} targetClass
	 */
	_initializeLogs: function(targetClass) {
		
		var systemTarget = new targetClass("System", Core.Target.Type.DEBUG);
		var scriptTarget = new targetClass("Script", Core.Target.Type.INFO);
		var treeTarget = new targetClass("Script", Core.Target.Type.TREE);
		var blindTarget = new Core.Target.AbstractTarget(Core.Target.Type.BLIND);
		
		Core.Log.registerTarget("info", scriptTarget);
		Core.Log.registerTarget("error", systemTarget);
		Core.Log.registerTarget("warn", systemTarget);
		Core.Log.registerTarget("debug", systemTarget);

		Core.Log.registerTarget("_treeLogger", treeTarget);
		Core.Log.registerTarget("_quietLogger", blindTarget);

		Core.Log.registerTarget("__exceptionLogger", systemTarget);
		Core.Log.registerTarget("__stackLogger", systemTarget);
	},
	
	_guid: /^\{[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}\}$/i,
	
	/**
	 * Checks if specified string has proper GUID format
	 * 
	 * @param {String} guid
	 * @type {Boolean}
	 */
	isGuid: function(guid) {
		return this._guid.test(guid);
	},
	
	_objectTypes: new Array(this.OBJECT_TYPES_NUMBER),
	
	/**
	 * Logs element to tree logger
	 * 
	 * @param {Ea.Types.Any} element
	 */
	log: function(element) {
		Ea.Helper.Log.getLog(element).log();
	}
};

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
		
		_super.create();
		
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
		_super.create();
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
		_super.create();
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

include("Ea.Types@Ea.Types.Abstract");

include("Ea.Application@Ea.Types");
include("Ea.Collection@Ea.Types");
include("Ea.Package@Ea.Types");

include("Ea.Tag@Ea.Types.Abstract");
include("Ea.FeatureConstraint@Ea.Types.Abstract");

include("Ea.Connector@Ea.Types.Connector");
include("Ea.Diagram@Ea.Types.Diagram");
include("Ea.Element@Ea.Types.Element");
