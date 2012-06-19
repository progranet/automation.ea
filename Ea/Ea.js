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
	
	getCollection: function(property, source) {
		var api = property.type.getCollection(property.elementType, source);
		var proxy = Ea.Application.getRepository().get(property.type, api, property);
		return proxy;
	},

	initialize: function() {
		this._prepare(Ea.Any);
		Ea.Application.initializeDefault();
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
	}
};

include("Ea.Helper@Ea");

Ea.Log = define({
	
	_path: null,
	_parented: null,
	
	create: function(parented) {
		_super.create();
		this._parented = parented;
	},
	
	getPath: function() {
		if (!this._path || Ea.mm) {
			this._path = [];
			var parent = this._parented.getParent();
			if (parent) {
				var parentPath = parent.getLog().getPath();
				for (var p = 0; p < parentPath.length; p++) {
					this._path.push(parentPath[p]);
				}
			}
			this._path.push(this._parented);
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
				if (!Ea.Log._currentPath || p >= Ea.Log._currentPath.length || Ea.Log._currentPath[p] != path[p]) {
					var parented = path[p];
					var string = parented.instanceOf(Ea.Package._Base) ? "[•] " + parented + "" : " " + parented;
					info(_tab(p, "      |") + "—" + string + "");
				}
			}
			Ea.Log._currentPath = path;
		}
	}
},
{
	_currentPath: null
});

Ea.Any = define({
	
	// usun¹æ logowanie z tego poziomu
	_log: null,
	
	create: function() {
		_super.create();
		this._log = new Ea.Log(this);
	},
	
	getLog: function() {
		return this._log;
	},
	
	log: function() {
		this._log.log();
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
	
	__parent: new Ea.Helper.CustomProperty({type: "Ea.Namespace", getter: "getParent"}),
	
	getType: function() {
		return this.namespace._Base;
	},
	
	_get: function(api) {
		var source = new Ea.Helper.Source(api);
		var type = this.getType(source);
		var proxy = new type();
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

include("Ea.Application@Ea.Types");
Ea.register("Ea.Project@Ea.Types", 1);
Ea.register("Ea.Repository@Ea.Types", 2);

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
	
	_qualifiedName: new Ea.Helper.CustomProperty({getter: "getQualifiedName"})
});

Ea.Namespace = extend(Ea.Named);

Ea.Stereotype = extend(Ea.Named);

Ea.register("Ea.Collection@Ea.Types", 3);
Ea.register("Ea.Package@Ea.Types", 5);
Ea.register("Ea.Connector@Ea.Types.Connector", 7);
Ea.register("Ea.Diagram@Ea.Types.Diagram", 8);

Ea.register("Ea.Element@Ea.Types.Element", 4);
