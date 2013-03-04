/*
   Copyright 2013 300 D&C

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

DataAccess.Oracle = {
	initialize: function() {
		DataAccess.registerProviderClass("Oracle", this.Provider);
	}
};

DataAccess.Oracle.Provider = extend(DataAccess._Provider, {
	
	_tables: {
		Element: {
			meta: {
				id: "OBJECT_ID",
				guid: "EA_GUID",
				name: "T_OBJECT"
			},
			columns: {
				id: {
					name: "OBJECT_ID",
					type: Number
				},
				guid: {
					name: "EA_GUID",
					type: String
				},
				name: {
					name: "NAME",
					type: String
				},
				alias: {
					name: "ALIAS",
					type: String
				},
				author: {
					name: "AUTHOR",
					type: String
				},
				version: {
					name: "VERSION",
					type: String
				},
				notes: {
					name: "NOTE",
					type: String
				},
				packageId: {
					name: "PACKAGE_ID",
					type: Number
				},
				stereotype: {
					name: "STEREOTYPE",
					type: String
				},
				complexity: {
					name: "COMPLEXITY",
					type: String
				},
				effort: {
					name: "EFFORT",
					type: String
				},
				created: {
					name: "CREATEDDATE",
					type: Date
				},
				modified: {
					name: "MODIFIEDDATE",
					type: Date
				},
				status: {
					name: "STATUS",
					type: String
				},
				_abstract: {
					name: "ABSTRACT",
					type: String
				},
				visibility: {
					name: "VISIBILITY",
					type: String
				},
				persistence: {
					name: "PERSISTENCE",
					type: String
				},
				cardinality: {
					name: "CARDINALITY",
					type: String
				},
				phase: {
					name: "PHASE",
					type: String
				},
				scope: {
					name: "SCOPE",
					type: String
				},
				classifierId: {
					name: "CLASSIFIER",
					type: Number
				},
				parentId: {
					name: "PARENTID",
					type: Number
				},
				runState: {
					name: "RUNSTATE",
					type: String
				},
				classifierGuid: {
					name: "CLASSIFIER_GUID",
					type: String
				},
				position: {
					name: "TPOS",
					type: Number
				},
				multiplicity: {
					name: "MULTIPLICITY",
					type: String
				},
				backColor: {
					name: "BACKCOLOR",
					type: Number
				},
				fontColor: {
					name: "FONTCOLOR",
					type: Number
				},
				borderColor: {
					name: "BORDERCOLOR",
					type: Number
				},
				borderStyle: {
					name: "BORDERSTYLE",
					type: Number
				},
				borderWidth: {
					name: "BORDERWIDTH",
					type: Number
				}
			}
		},
		XRef: {
			meta: {
				guid: "XREFID",
				name: "T_XREF"
			},
			columns: {
				guid: {
					name: "XREFID",
					type: String
				},
				name: {
					name: "NAME",
					type: String
				},
				type: {
					name: "TYPE",
					type: String
				},
				description: {
					name: "DESCRIPTION",
					type: String
				},
				clientGuid: {
					name: "CLIENT",
					type: String
				},
				supplierGuid: {
					name: "SUPPLIER",
					type: String
				},
				link: {
					name: "LINK",
					type: String
				}
			}
		},
		Scenario: {
			meta: {
				guid: "EA_GUID",
				name: "T_OBJECTSCENARIOS"
			},
			columns: {
				guid: {
					name: "EA_GUID",
					type: String
				},
				elementId: {
					name: "OBJECT_ID",
					type: Number
				},
				name: {
					name: "SCENARIO",
					type: String
				},
				type: {
					name: "SCENARIOTYPE",
					type: String
				},
				notes: {
					name: "NOTES",
					type: String
				},
				content: {
					name: "XMLCONTENT",
					type: String
				}
			}
		},
		DiagramObject: {
			meta: {
				id: "INSTANCE_ID",
				name: "T_DIAGRAMOBJECTS"
			},
			columns: {
				id: {
					name: "INSTANCE_ID",
					type: Number
				},
				elementId: {
					name: "OBJECT_ID",
					type: Number
				},
				parentId: {
					name: "DIAGRAM_ID",
					type: Number
				}
			}
		}
	},
	
	getSelect: function(table) {
		table = this._tables[table].meta.name;
		var sql = "SELECT * FROM " + table + " WHERE";
		return sql;
	},
	
	getExpression: function(table, key, value, operator) {
		var column = this._tables[table].columns[key];
		key = column.name;
		var type = column.type;
		if (type == String)
			value = "\"" + value + "\"";
		
		// TODO: other operators
		var expression = key + " = " + value;
			
		return expression;
	},
	
	getColumn: function(table, column) {
		column = this._tables[table].columns[column].name;
		return column;
	}
});

