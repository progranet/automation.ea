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
	
	getSelectedPackage: function() {
		return Ea.Application.getRepository().getSelectedPackage();
	},

	getSelectedObject: function() {
		return Ea.Application.getRepository().getSelectedObject();
	},

	get: function(type, api, params) {
		return Ea.Application.getRepository().get(type, api, params);
	},
	
	getById: function(type, id) {
		return Ea.Application.getRepository().getById(type, id);
	},
	
	getByGuid: function(type, guid) {
		return Ea.Application.getRepository().getByGuid(type, guid);
	},
	
	getCollection: function(type, api, params) {
		return Ea.Application.getRepository().getCollection(type, api, params);
	},

	initialize: function() {
		Ea.Class.prepareClasses();
	},
	
	initializeApplication: function(params) {
		params = params || {};
		Ea.Application.create(params);
		Ea.Application.activate(params.name);
	},
	
	initializeLogs: function(targetClass) {
		var systemTarget = new targetClass("System", Core.Target.Type.DEBUG);
		var scriptTarget = new targetClass("Script", Core.Target.Type.INFO);
		var treeTarget = new targetClass("Script", Core.Target.Type.TREE);
		
		Core.Log.registerTarget("error", systemTarget);
		Core.Log.registerTarget("warn", systemTarget);
		Core.Log.registerTarget("debug", systemTarget);
		Core.Log.registerTarget("info", scriptTarget);
		Core.Log.registerTarget("tree", treeTarget);
	},
	
	_guid: /^\{[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}\}$/i,
	
	isGuid: function(guid) {
		return this._guid.test(guid);
	},
	
	ensure: function(type, ea) {
		if (typeof ea == "string" && this.isGuid(ea))
			ea = Ea.getByGuid(type, ea);
		return ea;
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
