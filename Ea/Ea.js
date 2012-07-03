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

Ea = {
	
	mm: false, // Modification Mode switch
	
	TRUE: 1,
	FALSE: 0,
	
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
		this._prepare(Ea.Types.Any);
		Ea.Application.initializeDefault();
		
		var systemTarget = new Ea.Helper.Target("System", true);
		var scriptTarget = new Ea.Helper.Target("Script", false);
		
		Core.Log.registerTarget("error", systemTarget);
		Core.Log.registerTarget("warn", systemTarget);
		Core.Log.registerTarget("debug", systemTarget);
		Core.Log.registerTarget("info", scriptTarget);
	},
	
	_prepare: function(_class) {
		for (var name in _class) {
			var property = _class[name];
			if (Ea.Class.AttributeProxy.isInstance(property)) {
				property.prepare(_class, name);
			}
		}
		for (var c = 0; c < _class.subClass.length; c++) {
			this._prepare(_class.subClass[c]);
		}
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
	
	register: function(type, objectType) {
		var namespace = include(type);
		this._objectTypes[objectType] = namespace;
	},
	
	log: function(element) {
		Ea.Helper.Log.getLog(element).log();
	}
};

include("Ea.Class@Ea");
include("Ea.Helper@Ea");
include("Ea.Types@Ea.Types");
include("Ea.Application@Ea.Types.Core");
Ea.register("Ea.Collection@Ea.Types", 3);
Ea.register("Ea.Package@Ea.Types", 5);
Ea.register("Ea.Connector@Ea.Types.Connector", 7);
Ea.register("Ea.Diagram@Ea.Types.Diagram", 8);
Ea.register("Ea.Element@Ea.Types.Element", 4);
