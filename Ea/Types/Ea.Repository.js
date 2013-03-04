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

include("DataAccess@DataAccess");
include("DataAccess.Jet@DataAccess");
include("DataAccess.Oracle@DataAccess");

/**
 * @namespace
 */
Ea.Repository = {

	meta: {
		objectType: 2
	}
};

			
Ea.Repository._Base = extend(Ea.Types.Any, {
	
	_provider: null,
	
	/**
	 * Constructs Ea.Repository._Base
	 * 
	 * @param {Object} params
	 */
	create: function(params) {
		_super.create();
		params = params || {};
		this._provider = DataAccess.getProvider(params.provider || "Jet");
	},
	
	_findByQuery: function(table, key, value) {
		
		//var sql = "select * from " + table + " where " + key + " = " + value;
		var sql = this._provider.getSelect(table) + " " + this._provider.getExpression(table, key, value);
		
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
	
	/**
	 * Finds objects matching specified criteria in underlying database.
	 * Output collection contains objects selected from [table] matching [key] == [value] condition.
	 * 
	 * @param {Class} type Type of searched objects
	 * @param {String} table Table name where search to
	 * @param {String} key Name of column in table to search by
	 * @param {String} value Value which key must match
	 * @param {String} identity Name of column containing identity (id values) of searched objects
	 * @type {Core.Types.Collection}
	 */
	getByQuery: function(type, table, key, value, identity) {
		identity = this._provider.getColumn(table, identity);
		var collection = new Core.Types.Collection();
		var rows = this._findByQuery(table, key, value);
		for (var ri = 0; ri < rows.length; ri++) {
			var row = rows[ri];
			var id = row[identity];
			var proxy = this._source.application.getById(type, id);
			collection.add(proxy);
		}
		return collection;
	},
	
	/**
	 * Returns collection of element's custom references
	 * 
	 * @param {Ea.Element._Base} element
	 * @type {Core.Types.Collection<Ea._Base.CustomReference>}
	 */
	getCustomReferences: function(element) {
		var collection = new Core.Types.Collection();
		var rows = this._findByQuery("XRef", "clientGuid", element.getGuid());
		var columns = {
			type: this._provider.getColumn("XRef", "type"),
			name: this._provider.getColumn("XRef", "name"),
			supplierGuid: this._provider.getColumn("XRef", "supplierGuid"),
			description: this._provider.getColumn("XRef", "description")
		};
		for (var ri = 0; ri < rows.length; ri++) {
			var row = rows[ri];
			if (row[columns.type] == "reference" && row[columns.name] == "Element") {
				var supplier = this._source.application.getByGuid(Ea.Element._Base, row[columns.supplierGuid]);
				if (supplier) {
					var reference = new Ea._Base.CustomReference(row[columns.description], supplier);
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
		return this._source.application.get(Ea.Package._Base, this._source.api.GetTreeSelectedPackage());
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
		var object = this._source.application.get(this.getSelectedType(), api);
		return object;
	},
	
	/**
	 * Closes specified diagram
	 * 
	 * @param {Ea.Diagram._Base} diagram
	 */
	closeDiagram: function(diagram) {
		this._source.api.CloseDiagram(diagram.getId());
	},
	
	/**
	 * Renders search results in Model Search EA view
	 * 
	 * @param {String} data XML in EA ReportViewData format
	 */
	renderSearchResults: function(data) {
		this._source.api.RunModelSearch("", "", "", data);
	},
	
	/**
	 * Shows output view of specified name
	 * 
	 * @param {String} name
	 */
	showOutput: function(name) {
		this._source.api.EnsureOutputVisible(name);
	},
	
	/**
	 * Clears output view of specified name
	 * 
	 * @param {String} name
	 */
	clearOutput: function(name) {
		this._source.api.ClearOutput(name);
	},
	
	/**
	 * Writes message to output view of specified name
	 * 
	 * @param {String} name
	 * @param {String} message
	 */
	writeOutput: function(name, message) {
		this._source.api.WriteOutput(name, message, undefined);
	},
	
	/**
	 * Creates output view of specified name
	 * 
	 * @param {String} name
	 */
	createOutput: function(name) {
		this._source.api.CreateOutputTab(name);
	},
	
	/**
	 * Closes output view of specified name
	 * 
	 * @param {String} name
	 */
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
	
	/**
	 * Closes current repository file or database connection
	 */
	close: function() {
		this._source.api.CloseFile();
	},
	
	/**
	 * Returns proxy object for specified type and guid
	 * 
	 * @deprecated Use Ea.Application.getByGuid() instead
	 * @param {Class} type
	 * @param {String} guid
	 * @type {Ea.Types.Any}
	 */
	getByGuid: function(type, guid) {
		return this._source.application.getByGuid(type, guid);
	},
	
	/**
	 * Returns specified scenario's context elements
	 * 
	 * @param {Ea.Scenario._Base} scenario
	 * @type {Object}
	 */
	getScenarioContext: function(scenario) {
		
		var rows = this._findByQuery("Scenario", "guid", scenario.getGuid());
		var row = rows[0];
		
		var dom = new ActiveXObject("MSXML2.DOMDocument");
		dom.validateOnParse = false;
		dom.async = false;
		
		var xml = row[this._provider.getColumn("Scenario", "content")];
		var parsed = dom.loadXML(xml);

		var context = {};

		if (!parsed) {
			warn("Error while XML parsing scenario content: " + xml + " " + scenario.getGuid());
		}
		else {
			var nodes = dom.selectNodes("//path/context/item");
			for (var ni = 0; ni < nodes.length; ni++) {
				var node = nodes[ni];
				context[node.getAttribute("oldname")] = this._source.application.getByGuid(Ea.Element._Base, node.getAttribute("guid"));
			}
		}
		return context;
	},
	
	/**
	 * Returns appearance of specified element
	 * 
	 * @param {Ea.Element._Base} element
	 * @type {Ea._Base.DataTypes.Appearance}
	 */
	getElementAppearance: function(element) {
		var rows = this._source.application.getRepository()._findByQuery("Element", "id", element.getId());
		var row = rows[0];
		var source = {
			backColor: row[this._provider.getColumn("Element", "backColor")],
			fontColor: row[this._provider.getColumn("Element", "fontColor")],
			borderColor: row[this._provider.getColumn("Element", "borderColor")],
			borderStyle: row[this._provider.getColumn("Element", "borderStyle")],
			borderWidth: row[this._provider.getColumn("Element", "borderWidth")]
		};
		appearance = new Ea._Base.DataTypes.Appearance(source);
		return appearance;
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
	 * @type {Ea.Collection._Base<Ea.Package.Model>}
	 * @aggregation composite
	 */
	_model: property({api: "Models"})
	
});
