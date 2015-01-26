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
	 * @const
	 * @type {Number}
	 */
	OBJECT_TYPES_NUMBER: 100,
	
	_objectTypes: new Array(this.OBJECT_TYPES_NUMBER),
	
	_namespaces: [],
	
	_application: null,
	
	preapreProperties: function(_class) {

		for (var propertyName in _class._properties) {
			var property = _class.getProperty(propertyName);
			if (!property.isPrepared())
				property.prepare();
		}
		
		for (var c = 0; c < _class._subClass.length; c++) {
			Ea.preapreProperties(_class._subClass[c]);
		}
	},
	
	initialize: function() {
		
		for (var n = 0; n < this._namespaces.length; n++) {
			var namespace = this._namespaces[n];
			if (namespace.meta && namespace.meta.objectType)
				Ea._objectTypes[namespace.meta.objectType] = namespace._Base;
		}
		
		Ea.preapreProperties(Ea.Types.Any);

		Ea.Repository.eaPrimitiveTypes.EABOOL00 = Ea._Base.PrimitiveType.getPrimitiveType("Boolean");
		Ea.Repository.eaPrimitiveTypes.EAINT000 = Ea._Base.PrimitiveType.getPrimitiveType("Integer");
		Ea.Repository.eaPrimitiveTypes.EAREAL00 = Ea._Base.PrimitiveType.getPrimitiveType("Real");
		Ea.Repository.eaPrimitiveTypes.EASTRING = Ea._Base.PrimitiveType.getPrimitiveType("String");
		Ea.Repository.eaPrimitiveTypes.EAUNAT00 = Ea._Base.PrimitiveType.getPrimitiveType("UnlimitedNatural");
	},
	
	/**
	 * Initializes default EA application
	 * 
	 * @param {Core.Target.AbstractTarget} targetClass Target for logger mechanism
	 * @param {Object} params
	 * @type {Ea.Application._Base}
	 */
	initializeDefaultApplication: function(params) {
		if (!this._application) {
			params = params || {};
			this._application = Ea.Application.createApplication(params);
			this._initializeLogs(params.targetClass || Ea._Base.Utils.Target, this._application.getRepository());
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
	_initializeLogs: function(targetClass, repository) {
		
		var systemTarget = new targetClass(Core.Target.Type.DEBUG, {name: "System", repository: repository});
		var scriptTarget = new targetClass(Core.Target.Type.INFO, {name: "Script", repository: repository});
		var treeTarget = new targetClass(Core.Target.Type.TREE, {name: "Script", repository: repository});
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
	
	/**
	 * Logs element to tree logger
	 * 
	 * @param {Ea.Types.Any} element
	 */
	log: function(element) {
		Ea._Base.Utils.Log.getLog(element).log();
	},
	
	/**
	 * Adds owned namespace
	 * 
	 * @param {Object} namespace
	 */
	addOwned: function(namespace) {
		this._namespaces.push(namespace);
	}
};

include("Ea._Base@Ea.Infrastructure");

include("Ea.Types@Ea.Types.Abstract");

include("Ea.Application@Ea.Types");
include("Ea.Collection@Ea.Types");
include("Ea.Package@Ea.Types");

include("Ea.Tag@Ea.Types.Abstract");
include("Ea.FeatureConstraint@Ea.Types.Abstract");

include("Ea.Connector@Ea.Types.Connector");
include("Ea.Diagram@Ea.Types.Diagram");
include("Ea.Element@Ea.Types.Element");
