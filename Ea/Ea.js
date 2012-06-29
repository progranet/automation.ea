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
		this._prepare(Ea.Any);
		Ea.Application.initializeDefault();
		
		var systemTarget = new Ea.Helper.Target("System", true);
		var scriptTarget = new Ea.Helper.Target("Script", false);
		
		Core.Log.registerTarget("error", systemTarget);
		Core.Log.registerTarget("warn", systemTarget);
		Core.Log.registerTarget("info", scriptTarget);
	},
	
	_prepare: function(_class) {
		for (var name in _class) {
			var property = _class[name];
			if (Ea.Helper.AbstractProperty.isInstance(property)) {
				property.prepare();
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

include("Ea.Helper@Ea");

Ea.Source = define({
	_api: null,
	_value: null,
	create: function(api) {
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
		return this._value[property.property];
	},
	setValue: function(property, value) {
		this._value[property.property] = value;
	},
	isInitialized: function(property) {
		return (property.property in this._value);
	}
});


Ea.Any = define({
	
	create: function() {
		_super.create();
	},
	
	getParent: function() {
		return null;
	},
	
	getXmlGuid: function() {
		return Ea.Application.getApplication().getProject().guidToXml(this.getGuid());
	},
	
	toString: function() {
		return this._toString();
	},
	
	_toString: function() {
		return "[" + this._class + "]";
	}
}, 
{
	__parent: new Ea.Helper.CustomProperty({type: "Ea.Namespace", get: "getParent"}),
	
	getType: function() {
		return this.namespace._Base;
	},
	
	_get: function(api, params) {
		return this._createProxy(api, params);
	},
	
	_createProxy: function(api, params) {
		var source = new Ea.Source(api);
		var type = this.getType(source);
		var proxy = new type(params);
		proxy._source = source;
		return proxy;
	},
	
	initialize: function() {
		this._properties = {};
	},
	
	_addProperty: function(property) {
		this._properties[property.property] = property;
	},
	
	getProperties: function() {
		var properties = {};
		if (this._super.getProperties) {
			var superProperties = this._super.getProperties();
			for (var name in superProperties)
				properties[name] = superProperties[name];
		}
		for (var name in this._properties)
			properties[name] = this._properties[name];
		return properties;
	}
});

Ea.Named = extend(Ea.Any, {

	_splitName: function() {
		var name = this.getName();
		var split = new RegExp("^([\\w\\-\\.]+[0-9]+):?\\s+([\\W\\w]+)$").exec(name);
		return split || [name, "", name];
	},
	
	_businessId: null,
	_businessName: null,

	getBusinessName: function() {
		if (!this._businessName || Ea.mm) {
			var split = this._splitName();
			this._businessId = split[1];
			this._businessName = split[2];
		}
		return this._businessName;
	},
	
	getBusinessId: function() {
		if (!this._businessId || Ea.mm) {
			var split = this._splitName();
			this._businessId = split[1];
			this._businessName = split[2];
		}
		return this._businessId;
	},
	
	hasParent: function(namespace) {
		var parent = this.getParent();
		if (!parent) return false;
		namespace = Ea.ensure(Ea.Package._Base, namespace);
		return (parent == namespace ? namespace : parent.hasParent(namespace));
	},
	
	_toString: function() {
		return this.getName() + " " + _super._toString();
	},
	
	_qualifedName: null,
	getQualifiedName: function() {
		if (!this._qualifedName || Ea.mm) {
			var parent = this.getParent();
			this._qualifedName = (parent ? parent.getQualifiedName() + " / " : "") + this.getName();
		}
		return this._qualifedName;
	}
	
},
{
	_name: new Ea.Helper.Property({api: "Name"}),
	_alias: new Ea.Helper.Property({api: "Alias"}),
	_notes: new Ea.Helper.Property({api: "Notes"}),
	_stereotype: new Ea.Helper.Property({api: "Stereotype"}),
	
	_qualifiedName: new Ea.Helper.CustomProperty({get: "getQualifiedName"})
});

Ea.Namespace = extend(Ea.Named);

include("Ea.Application@Ea.Types.Core");

Ea.register("Ea.Collection@Ea.Types", 3);
Ea.register("Ea.Package@Ea.Types", 5);
Ea.register("Ea.Connector@Ea.Types.Connector", 7);
Ea.register("Ea.Diagram@Ea.Types.Diagram", 8);
Ea.register("Ea.Element@Ea.Types.Element", 4);
