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

Ea.Repository = {};

Ea.Repository._Base = extend(Ea.Any, {
	
	cache: null,
	
	create: function() {
		_super.create();
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
		info("stats: {total read: $, cache read by id: $, cache read by guid: $, cache white by id: $, cache write by guid: $}", [this.stats.tr, this.stats.cri, this.stats.crg, this.stats.cwi, this.stats.cwg]);
	},
	
	getCollection: function(type, api, params) {
		var proxy = type._get(api, params);
		return proxy;
	},
	
	get: function(type, api, params) {
		this.stats.tr++;
		if (this.cache[type.namespace.name]) {
			if (type._id) {
				var id = api[type._id.api];
				var proxy = this.cache[type.namespace.name].id[id];
				if (proxy) {
					this.stats.cri++;
					return proxy;
				}
			}
			else if (type._guid) {
				var guid = api[type._guid.api];
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
		if (!id) // || id == 0	
			return null;
		this.stats.tr++;
		if (this.cache[type.namespace.name]) {
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
		if (this.cache[type.namespace.name]) {
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
		var proxy = type._get(api, params);
		if (type._id || type._guid) {
			if (!this.cache[type.namespace.name]) {
				this.cache[type.namespace.name] = {
					id: {},
					guid: {}
				};
			}
			if (type._id) {
				this.cache[type.namespace.name].id[api[type._id.api]] = proxy;
				this.stats.cwi++;
			}
			if (type._guid) {
				this.cache[type.namespace.name].guid[api[type._guid.api]] = proxy;
				this.stats.cwg++;
			}
		}
		return proxy;
	},
	
	getByQuery: function(type, table, key, value, id) {
		var sql = "select t." + id + " from " + table + " t where t." + key + " = " + value;
		var xml = this._source.getApi().SQLQuery(sql);
		var ids = new Array();
		xml.replace(new RegExp("<" + id + ">(\\d+)<\\/" + id + ">", "g"), function(whole, id) {
			ids.push(id);
		});
		var collection = new Core.Types.Collection();
		for (var idi = 0; idi < ids.length; idi++) {
			var id = ids[idi];
			var proxy = this.getById(type, id);
			collection.add(proxy);
		}
		return collection;
	},
	
	_getXRef: function(guid) {
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
					var reference = new Ea.Element.CustomReference(record.description, supplier);
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
	}

}, {
	api: "Repository",
	
	_models: new Ea.Helper.CollectionMap({api: "Models", elementType: "Ea.Package._Base"})
});
