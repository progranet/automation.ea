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

include("Ea.Stereotype@Ea.Types");

/**
 * @namespace
 */
Ea.Repository = {

	meta: {
		objectType: 2
	},
	
	eaPrimitiveTypes: {},

	initialize: function() {
		DataAccess.registerProviderClass("Jet", DataAccess.Jet.Provider);
		DataAccess.registerProviderClass("Oracle", DataAccess.Oracle.Provider);
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
		_super.create(params);
		params = params || {};
		this._provider = DataAccess.getProvider(params.provider || "Jet");
	},
	
	_findByQuery: function(table, key, value) {
		
		var sql = this._provider.getSelect(table) + " " + this._provider.getExpression(table, key, value);
		//info(sql);
		var xml;
		try {
			xml = this._source.api.SQLQuery(sql);
		}
		catch (error) {
			warn("Query error: " + error.message + " (SQL: " + sql + ")");
			return [];
		}
		
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
				var column = this._provider.getColumnByNative(table, c.nodeName);
				if (column)
					row[column.name] = c.text;
			}
			rows.push(row);
		}
		return rows;
	},
	
	/**
	 * Finds objects matching specified criteria in underlying database.
	 * Output collection contains objects selected from [table] matching [key] == [value] condition.
	 * 
	 * @param {Core.Lang.Class} type Type of searched objects
	 * @param {String} table Table name where search to
	 * @param {String} key Name of column in table to search by
	 * @param {String} value Value which key must match
	 * @param {String} identity Name of column containing identity (id values) of searched objects
	 * @type {Core.Types.Collection<Ea.Types.Any>}
	 */
	getByQuery: function(type, table, key, value, identity) {
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
	 * Returns collection of element custom references
	 * 
	 * @param {Ea.Element._Base} element
	 * @type {Core.Types.Collection<Ea._Base.CustomReference>}
	 */
	getCustomReferences: function(element) {
		var collection = new Core.Types.Collection();
		var rows = this._findByQuery("XRef", "clientGuid", element.getGuid());
		for (var ri = 0; ri < rows.length; ri++) {
			var row = rows[ri];
			if (row.type == "reference" && row.name == "Element") {
				var supplier = this._source.application.getByGuid(Ea.Element._Base, row.supplierGuid);
				if (supplier) {
					var reference = new Ea._Base.CustomReference(row.description, supplier);
					collection.add(reference);
				}
			}
		}
		return collection;
	},
	
	/**
	 * Returns stereotypes applied to object
	 * 
	 * @param {Ea.Types.Any} object
	 * @type {Core.Types.Collection<Ea._Base.AbstractStereotype>}
	 */
	getStereotypes: function(object) {
		var list = null;
		var rows = this._findByQuery("XRef", "clientGuid", (typeof object == "string") ? object : object.getGuid());
		for (var ri = 0; ri < rows.length; ri++) {
			var row = rows[ri];
			if (row.name == "Stereotypes") {
				list = new Ea._Base.DataTypes.ObjectList(row.description).getList();
				break;
			}
		}

		var stereotypes = new Core.Types.Collection();
		if (list) {
			for (var s = 0; s < list.length; s++) {
				var stereotypeDefinition = list[s];
				if (stereotypeDefinition.GUID) {
					var stereotype = this._source.application.getByGuid(Ea.Stereotype._Base, stereotypeDefinition.GUID, null, true);
					if (stereotype) {
						stereotypes.add(stereotype);
						continue;
					}
				}
				stereotypes.add(new Ea._Base.Stereotype(stereotypeDefinition));
			}
		}
		return stereotypes;
	},
	
	getProjectStereotypes: function() {
		//this._source.api[Ea.Repository._Base.__projectStereotype.api].Refresh();
		this._getProjectStereotypes().refresh();
		Ea.Repository._Base.getProperty("_projectStereotypes").refresh(this);
		return this._getProjectStereotypes();
	},

	createProjectStereotype: function(name, type) {
		return this._createProjectStereotype(name, type);
	},

	deleteProjectStereotype: function(stereotype) {
		return this._deleteProjectStereotype(stereotype);
	},

	/**
	 * Returns object properties
	 * 
	 * @param {Ea.Types.Any} object
	 * @type {Ea._Base.DataTypes.Properties}
	 */
	getProperties: function(object) {
		var properties = null;
		var rows = this._findByQuery("XRef", "clientGuid", object.getGuid());
		for (var ri = 0; ri < rows.length; ri++) {
			var row = rows[ri];
			if (row.name == "CustomProperties") {
				properties = new Ea._Base.DataTypes.Properties(row.description);
				break;
			}
		}
		return properties;
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
	 * @type {Core.Lang.Class}
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
	 * Returns selected objects
	 * 
	 * @type {Core.Types.Collection<Ea.Types.Any>}
	 */
	getSelectedObjects: function() {
		var apiCollection = this._source.api.GetTreeSelectedElements();
		var objects = new Core.Types.Collection();
		for (var o = 0; o < apiCollection.Count; o++) {
			var api = apiCollection.GetAt(o);
			var objectType = api.ObjectType;
			var type = Ea._objectTypes[objectType];
			if (!type) 
				throw new Error("Unregistered EA object type: " + objectType);
			var object = this._source.application.get(type, api);
			objects.add(object);
		}
		return objects;
	},
	
	/**
	 * Opens specified diagram
	 * 
	 * @param {Ea.Diagram._Base} diagram
	 */
	openDiagram: function(diagram) {
		this._source.api.OpenDiagram(diagram.getId());
	},
	
	/**
	 * Reloads specified diagram
	 * 
	 * @param {Ea.Diagram._Base} diagram
	 */
	reloadDiagram: function(diagram) {
		this._source.api.ReloadDiagram(diagram.getId());
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
	 * Advises EA that connector has changed
	 * 
	 * @param {Ea.Connector._Base} connector
	 */
	adviseConnectorChange: function(connector) {
		this._source.api.AdviseConnectorChange(connector.getId());
	},
	
	/**
	 * Advises EA that element has changed
	 * 
	 * @param {Ea.Element._Base} element
	 */
	adviseElementChange: function(element) {
		this._source.api.AdviseElementChange(element.getId());
	},
	
	/**
	 * Reloads specified package or the entire model (if package is not specified), updating the user interface.
	 * Method should not be used in model processing because it causes that script execution is stopped.
	 * 
	 * @param {Ea.Package._Base} _package
	 */
	reloadPackage: function(_package) {
		this._source.api.RefreshModelView(_package ? _package.getId() : 0);
	},
	
	/**
	 * Returns proxy object for specified type and guid
	 * 
	 * @deprecated Use Ea.Application.getByGuid() instead
	 * @param {Core.Lang.Class} type
	 * @param {String} guid
	 * @type {Ea.Types.Any}
	 */
	getByGuid: function(type, guid) {
		return this._source.application.getByGuid(type, guid);
	},
	
	/**
	 * Returns specified scenario context elements
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
		
		var xml = row.content;
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
		var rows = this._findByQuery("Element", "id", element.getId());
		var row = rows[0];
		var appearance = new Ea._Base.DataTypes.Appearance(row);
		return appearance;
	},

	/**
	 * Returns classifier related to specified element. Type of classifier must be specified, too.
	 * 
	 * @param {Ea.Element._Base} element
	 * @param {Core.Lang.Class} type
	 * @type {Ea.Types.Any}
	 */
	getElementRelatedClassifier: function(element, type) {
		var rows = this._findByQuery("Element", "id", element.getId());
		var guid = rows[0].classifierGuid;
		if (!guid)
			return null;
		return this._source.application.getByGuid(type, guid);
	},
	
	/**
	 * Returns type of typed element.
	 * 
	 * @param {Ea.Element.TypedElement} element
	 * @type {Core.Types.Object}
	 */
	getTypedElementType: function(element) {
		var rows = this._findByQuery("Element", "id", element.getId());
		var guid = rows[0].classifierGuid || rows[0].miscData0;
		if (!guid)
			return null;
		var type = this._source.application.getByGuid(Ea.Element._Base, guid);
		if (!type) {
			var typeId = guid.substr(1, 8);
			type = Ea.Repository.eaPrimitiveTypes[typeId];
			if (!type)
				warn("Type not recognized for predefined EA primitive type guid: $", [guid]);
		}
		return type;
	}
}, {},
{
	/**
	 * Project guid
	 * 
	 * @readOnly
	 */
	projectGuid: {api: "ProjectGUID"},

	/**
	 * Project batch append switch value
	 * 
	 * @type {Boolean}
	 */
	batchAppend: {api: "BatchAppend"},
	
	/**
	 * Project enable cache switch value
	 * 
	 * @type {Boolean}
	 */
	enableCache: {api: "EnableCache"},
	
	/**
	 * Project enable UI updates switch value
	 * 
	 * @type {Boolean}
	 */
	enableUIUpdates: {api: "EnableUIUpdates"},
	
	/**
	 * Project flag update switch value
	 * 
	 * @type {Boolean}
	 */
	flagUpdate: {api: "FlagUpdate"},
	
	/**
	 * Project security enabled switch value
	 * 
	 * @type {Boolean}
	 */
	securityEnabled: {api: "IsSecurityEnabled"},
	
	/**
	 * Project path
	 * 
	 * @readOnly
	 */
	path: {api: "ConnectionString"},
	
	/**
	 * All stereotypes available in project
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.Stereotype._Base>}
	 */
	_projectStereotypes: {api: "Stereotypes"},
	
	/**
	 * All stereotypes available in project
	 * 
	 * @derived
	 * @type {Ea.Collection._Base<Ea.Stereotype._Base>}
	 * @aggregation composite
	 */
	projectStereotypes: {},
	
	/**
	 * Collection containing all project models.
	 * 
	 * @type {Ea.Collection._Base<Ea.Package._Base>}
	 * @aggregation composite
	 */
	models: {api: "Models"}
	
});
