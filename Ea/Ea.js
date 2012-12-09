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

		targetClass = targetClass || Ea.Helper.Target;
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

		return this._application;
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
			this._project.load(params.path);
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
