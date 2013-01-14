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
Ea.Repository = {

	meta: {
		objectType: 2
	},
	
	Syntax: {
		JetDB: {
			Tables: {
				
			}
		},
		Oracle: {
			
		}
	}
};

Ea.Repository._Base = extend(Ea.Types.Any, /** @lends Ea.Repository._Base# */ {
	
	_cacheId: null,
	_cacheGuid: null,
	_cacheStats: null,
	
	_syntax: null,
	
	/**
	 * @constructs
	 * @param source
	 * @param params
	 */
	create: function(source, params) {
		_super.create(source);
		params = params || {};
		this._syntax = params.syntax || Ea.Repository.Syntax.JetDB;
		
		this._cacheId = new Array(Ea.OBJECT_TYPES_NUMBER);
		this._cacheGuid = new Array(Ea.OBJECT_TYPES_NUMBER);
		this._cacheStats = new Array(Ea.OBJECT_TYPES_NUMBER + 1);
		for (var ot = 0; ot <= Ea.OBJECT_TYPES_NUMBER; ot++) {
			if (ot != Ea.OBJECT_TYPES_NUMBER) {
				this._cacheId[ot] = [];
				this._cacheGuid[ot] = {};
			}
			this._cacheStats[ot] = {
					cwi: 0,
					cwg: 0,
					cri: 0,
					crgi: 0,
					crg: 0,
					crgg: 0,
					tr: 0,
					trg: 0,
					trgi: 0,
					trgg: 0,
					trgig: 0,
					trggg: 0
				};
		}

	},
	
	/**
	 * @memberOf Ea.Repository._Base#
	 */
	cacheInfo: function() {
		var stats = {};
		var g = this._cacheStats[Ea.OBJECT_TYPES_NUMBER];
		for (var ot = 0; ot <= Ea.OBJECT_TYPES_NUMBER; ot++) {
			var type = Ea._objectTypes[ot];
			if (!type && ot != Ea.OBJECT_TYPES_NUMBER)
				continue;
			var s = this._cacheStats[ot];
			stats[ot != Ea.OBJECT_TYPES_NUMBER ? type.namespace : "TOTAL"] = {
					"total read from get": s.trg,
					"total read by id from get": s.trgig,
					"total read by guid from get": s.trggg,
					"total read by id": s.trgi,
					"total read by guid": s.trgg,
					"cache read by id": s.cri,
					"cache read by id from get": s.crgi,
					"cache read by guid": s.crg,
					"cache read by guid from get": s.crgg,
					"cache white by id": s.cwi,
					"cache white by guid": s.cwg
				};
			for (var n in g) {
				g[n] = (ot != Ea.OBJECT_TYPES_NUMBER) ? (g[n] + s[n]) : 0;
			}
		}
		info("cache stats: $", [JSON.stringify(stats, null, '\t')]);
	},
	
	/**
	 * Returns proxy object for specified EA API object
	 * 
	 * @param {Class} type
	 * @param {Object} api
	 * @param {Object} params
	 * @type {Ea.Types.Any}
	 */
	get: function(type, api, params) {
		var meta = type.namespace.meta;
		this._cacheStats[meta.objectType].trg++;
		if (meta.id) {
			this._cacheStats[meta.objectType].trgig++;
			var id = api[meta.id];
			var proxy = this._cacheId[meta.objectType][id];
			if (proxy) {
				this._cacheStats[meta.objectType].crgi++;
				return proxy;
			}
		}
		else if (meta.guid) {
			this._cacheStats[meta.objectType].trggg++;
			var guid = api[meta.guid];
			var proxy = this._cacheGuid[meta.objectType][guid];
			if (proxy) {
				this._cacheStats[meta.objectType].crgg++;
				return proxy;
			}
		}
		return this._get(type, api, params);
	},
	
	getById: function(type, id) {
		if (!id || id == 0)
			return null;
		var meta = type.namespace.meta;
		this._cacheStats[meta.objectType].trgi++;
		var proxy = this._cacheId[meta.objectType][id];
		if (proxy) {
			this._cacheStats[meta.objectType].cri++;
			return proxy;
		}
		var method = "Get" + type.namespace.name + "ByID";
		var api;
		// EA ElementID integrity problem
		try {
			api = this._source.api[method](id);
		}
		catch (e) {
			warn("$ not found by Id = $", [type, id]);
			return null;
		}
		return this._get(type, api);
	},
	
	getByGuid: function(type, guid) {
		var meta = type.namespace.meta;
		this._cacheStats[meta.objectType].trgg++;
		var proxy = this._cacheGuid[meta.objectType][guid];
		if (proxy) {
			this._cacheStats[meta.objectType].crg++;
			return proxy;
		}
		var method = "Get" + type.namespace.name + "ByGuid";
		var api = this._source.api[method](guid);
		if (!api) {
			warn("$ not found by Guid = $", [type, guid]);
			return null;
		}
		return this._get(type, api);
	},

	_get: function(type, api, params) {
		var meta = type.namespace.meta;
		var proxy = Ea._Base.Class.createProxy(this._source.application, type, api, params);
		if (meta.id) {
			this._cacheId[meta.objectType][api[meta.id]] = proxy;
			this._cacheStats[meta.objectType].cwi++;
		}
		if (meta.guid) {
			this._cacheGuid[meta.objectType][api[meta.guid]] = proxy;
			this._cacheStats[meta.objectType].cwg++;
		}
		return proxy;
	},
	
	findByQuery: function(table, key, value) {
		var sql = "select * from " + table + " where " + key + " = " + value;
		var xml = this._source.api.SQLQuery(sql);
		
		var dom = new ActiveXObject("MSXML2.DOMDocument");
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
		var rows = this.findByQuery(table, key, value);
		for (var ri = 0; ri < rows.length; ri++) {
			var row = rows[ri];
			var id = row[identity];
			var proxy = this.getById(type, id);
			collection.add(proxy);
		}
		return collection;
	},
	
	getCustomReferences: function(element) {
		var collection = new Core.Types.Collection();
		var rows = this.findByQuery("t_xref", "Client", "\"" + element.getGuid() + "\"");
		for (var ri = 0; ri < rows.length; ri++) {
			var row = rows[ri];
			if (row["Type"] == "reference" && row["Name"] == "Element") {
				var supplier = this.getByGuid(Ea.Element._Base, row["Supplier"]);
				if (supplier) {
					var reference = new Ea._Base.CustomReference(row["Description"], supplier);
					collection.add(reference);
				}
			}
		}
		return collection;
	},
	
	/**
	 * Returns selected package
	 * 
	 * @type {Ea.Package._Base}
	 */
	getSelectedPackage: function() {
		return this.get(Ea.Package._Base, this._source.api.GetTreeSelectedPackage());
	},
	
	/**
	 * Returns class of selected object
	 * 
	 * @type {Class}
	 */
	getSelectedType: function() {
		var objectType = this._source.api.GetTreeSelectedItemType();
		var type = Ea._objectTypes[objectType];
		if (!type) 
			throw new Error("Unregistered EA object type: " + objectType);
		return type;
	},
	
	/**
	 * Returns selected object
	 * 
	 * @type {Ea.Types.Any}
	 */
	getSelectedObject: function() {
		var api = this._source.api.GetTreeSelectedObject();
		var object = this.get(this.getSelectedType(), api);
		return object;
	},
	
	closeDiagram: function(diagram) {
		this._source.api.CloseDiagram(diagram.getId());
	},
	
	search: function(name, term, options, data) {
		this._source.api.RunModelSearch(name, term, options, data);
	},
	
	showOutput: function(name) {
		this._source.api.EnsureOutputVisible(name);
	},
	
	clearOutput: function(name) {
		this._source.api.ClearOutput(name);
	},
	
	writeOutput: function(name, message) {
		this._source.api.WriteOutput(name, message, undefined);
	},
	
	createOutput: function(name) {
		this._source.api.CreateOutputTab(name);
	},
	
	closeOutput: function(name) {
		this._source.api.RemoveOutputTab(name);
	},
	
	/**
	 * Opens specified repository file or database connection
	 * 
	 * @param {String} path
	 * @type {Boolean}
	 */
	open: function(path) {
		return this._source.api.OpenFile(path);
	},
	
	close: function() {
		this._source.api.CloseFile();
	}
},
{
	_projectGuid: property({api: "ProjectGUID"}),

	/**
	 * @type {Boolean}
	 */
	_batchAppend: property({api: "BatchAppend"}),
	
	/**
	 * @type {Boolean}
	 */
	_enableCache: property({api: "EnableCache"}),
	
	/**
	 * @type {Boolean}
	 */
	_enableUIUpdates: property({api: "EnableUIUpdates"}),
	
	/**
	 * @type {Boolean}
	 */
	_flagUpdate: property({api: "FlagUpdate"}),
	
	/**
	 * @type {Boolean}
	 */
	_securityEnabled: property({api: "IsSecurityEnabled"}),
	
	_path: property({api: "ConnectionString"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Package._Base>}
	 * @aggregation composite
	 */
	_models: property({api: "Models"})
	
});
