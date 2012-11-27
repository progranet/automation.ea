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

Ea.Repository = {
	Syntax: {
		JetDB: {
			
		},
		Oracle: {
			
		}
	}
};

Ea.Repository._Base = extend(Ea.Types.Any, {
	
	cache: null,
	cacheEnabled: true,
	syntax: null,
	
	create: function(api, params) {
		_super.create(api);
		this.syntax = params.syntax || Ea.Repository.Syntax.JetDB;
		this.cache = {};
	},
	
	stats: {
		cwi: 0,
		cwg: 0,
		cri: 0,
		crg: 0,
		tr: 0
	},
	
	cacheInfo: function() {
		info("cache stats: {total read: $, cache read by id: $, cache read by guid: $, cache white by id: $, cache write by guid: $}", [this.stats.tr, this.stats.cri, this.stats.crg, this.stats.cwi, this.stats.cwg]);
	},
	
	getCollection: function(type, api, params) {
		var proxy = Ea.Class.createProxy(type, api, params);
		return proxy;
	},
	
	get: function(type, api, params) {
		this.stats.tr++;
		if (this.cacheEnabled && !Ea.mm && this.cache[type.namespace.name]) {
			var idAttribute;
			var guidAttribute;
			if (idAttribute = Ea.Class.getIdAttribute(type)) {
				var id = api[idAttribute.api];
				var proxy = this.cache[type.namespace.name].id[id];
				if (proxy) {
					this.stats.cri++;
					return proxy;
				}
			}
			else if (guidAttribute = Ea.Class.getGuidAttribute(type)) {
				var guid = api[guidAttribute.api];
				var proxy = this.cache[type.namespace.name].guid[guid];
				if (proxy) {
					this.stats.crg++;
					return proxy;
				}
			}
		}
		return this._get(type, api, params);
	},
	
	getById: function(type, id) {
		if (!id || id == 0)
			return null;
		this.stats.tr++;
		if (this.cacheEnabled && !Ea.mm && this.cache[type.namespace.name]) {
			var proxy = this.cache[type.namespace.name].id[id];
			if (proxy) {
				this.stats.cri++;
				return proxy;
			}
		}
		var method = "Get" + type.api + "ByID";
		var api;
		// EA ElementID integrity problem
		try {
			api = this._source.getApi()[method](id);
		}
		catch (e) {
			warn("$ not found by Id = $", [type, id]);
			return null;
		}
		return this._get(type, api);
	},
	
	getByGuid: function(type, guid) {
		this.stats.tr++;
		if (this.cacheEnabled && !Ea.mm && this.cache[type.namespace.name]) {
			var proxy = this.cache[type.namespace.name].guid[guid];
			if (proxy) {
				this.stats.crg++;
				return proxy;
			}
		}
		var method = "Get" + type.api + "ByGuid";
		var api = this._source.getApi()[method](guid);
		if (!api) {
			warn("$ not found by Guid = $", [type, guid]);
			return null;
		}
		return this._get(type, api);
	},

	_get: function(type, api, params) {
		var proxy = Ea.Class.createProxy(type, api, params);
		if (this.cacheEnabled && !Ea.mm) {
			var idAttribute = Ea.Class.getIdAttribute(type);
			var guidAttribute = Ea.Class.getGuidAttribute(type);
			if (idAttribute || guidAttribute) {
				if (!this.cache[type.namespace.name]) {
					this.cache[type.namespace.name] = {
						id: {},
						guid: {}
					};
				}
				if (idAttribute) {
					this.cache[type.namespace.name].id[api[idAttribute.api]] = proxy;
					this.stats.cwi++;
				}
				if (guidAttribute) {
					this.cache[type.namespace.name].guid[api[guidAttribute.api]] = proxy;
					this.stats.cwg++;
				}
			}
		}
		return proxy;
	},
	
	findByQuery: function(table, key, value) {
		var sql = "select * from " + table + " where " + key + " = " + value;
		var xml = this._source.getApi().SQLQuery(sql);
		
		var dom = new ActiveXObject( "MSXML2.DOMDocument" );
		dom.validateOnParse = false;
		dom.async = false;
		
		var parsed = dom.loadXML(xml);
		if (!parsed) {
			throw new Error("Error while XML parsing for {table: " + table + ", key: " + key + ", value: " + value + "}");
		}
		
		var nodes = dom.selectNodes("//Dataset_0/Data/Row");
		
		var rows = [];
		for (var ni = 0; ni < nodes.length; ni++) {
			var node = nodes[ni];
			var row = {};
			var cs = node.childNodes;
			for (var ci = 0; ci < cs.length; ci++) {
				var c = cs[ci];
				row[c.nodeName] = c.text;
			}
			rows.push(row);
		}
		
		return rows;
	},
	
	getByQuery: function(type, table, key, value, identity) {

		var collection = new Core.Types.Collection();
		
		var rows = this._findByQuery(table, key, value);
		for (var ri = 0; ri < rows.length; ri++) {
			var row = rows[ri];
			var id = row[identity];
			var proxy = this.getById(type, id);
			collection.add(proxy);
		}
		
		return collection;
	},
	
	_getXRef: function(guid) {
		//TODO: refactor to findByQuery
		var sql = "select t.XrefID, t.Name, t.Type, t.Description, t.Supplier from t_xref t where t.Client = \"" + guid + "\"";
		var xml = this._source.getApi().SQLQuery(sql);
		var records = {};
		xml.replace(new RegExp("<Row><XrefID>([^<]*)<\\/XrefID><Name>([^<]*)<\\/Name><Type>([^<]*)<\\/Type>(<Description>([^<]*)<\\/Description>)?(<Supplier>([^<]*)<\\/Supplier>)?</Row>", "g"), 
			function(whole, guid, name, type, _t1, description, _t2, supplierGuid) {
				records[guid] = {
					name: name,
					type: type,
					description: description,
					supplierGuid: supplierGuid
				};
			});
		return records;
	},
	
	getCustomReferences: function(element) {
		var records = this._getXRef(element.getGuid());
		var customReferences = new Core.Types.Collection();
		for (var guid in records) {
			var record = records[guid];
			if (record.type == "reference" && record.name == "Element") {
				var supplier = this.getByGuid(Ea.Element._Base, record.supplierGuid);
				if (supplier) {
					var reference = new Ea.Repository.CustomReference(record.description, supplier);
					customReferences.add(reference);
				}
			}
		}
		return customReferences;
	},

	getSelectedPackage: function() {
		return this.get(Ea.Package._Base, this._source.getApi().GetTreeSelectedPackage());
	},
	
	getSelectedType: function() {
		var objectType = this._source.getApi().GetTreeSelectedItemType();
		var namespace = Ea._objectTypes[objectType];
		if (!namespace) 
			throw new Error("Undefined EA object type: " + objectType);
		return namespace._Base;
	},
	
	getSelectedObject: function() {
		var api = this._source.getApi().GetTreeSelectedObject();
		var object = this.get(this.getSelectedType(), api);
		return object;
	},
	
	closeDiagram: function(diagram) {
		this._source.getApi().CloseDiagram(diagram.getId());
	},
	
	search: function(name, term, options, data) {
		this._source.getApi().RunModelSearch(name, term, options, data);
	},
	
	showOutput: function(name) {
		Repository.EnsureOutputVisible(name);
	},
	
	clearOutput: function(name) {
		Repository.ClearOutput(name);
	},
	
	writeOutput: function(name, message) {
		Repository.WriteOutput(name, message, undefined);
	}
},
{
	api: "Repository",
	
	_projectGuid: attribute({api: "ProjectGUID"}),
	_connectionString: attribute({api: "ConnectionString"}),
	_models: attribute({api: "Models", type: "Ea.Collection._Base", elementType: "Ea.Package._Base", aggregation: "composite"})
});

Ea.Repository.CustomReference = define({
	_notes: null,
	_supplier: null,
	
	create: function(notes, supplier) {
		_super.create(params);
		this._notes = notes;
		this._supplier = supplier;
	},
	
	getNotes: function() {
		return this._notes;
	},
	
	getSupplier: function() {
		return this._supplier;
	}
});

