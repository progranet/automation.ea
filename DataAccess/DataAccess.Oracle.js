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

DataAccess.Oracle = {};

DataAccess.Oracle.Provider = extend(DataAccess._Provider, {
	
	_getTables: function() {
		return this._class._tables;
	},
	
	getSelect: function(table) {
		var sql = "SELECT * FROM " + this.getTable(table).native + " WHERE";
		return sql;
	},
	
	getExpression: function(table, key, value, operator) {
		var column = this.getColumn(table, key);
		var type = column.type;
		if (type == String)
			value = "\"" + value + "\"";
		
		// TODO: other operators
		var expression = column.native + " = " + value;
			
		return expression;
	}
},
{
	_tables: {
		Element: {
			meta: {
				id: "OBJECT_ID",
				guid: "EA_GUID",
				native: "T_OBJECT"
			},
			columns: {
				id: {
					native: "OBJECT_ID",
					type: Number
				},
				guid: {
					native: "EA_GUID",
					type: String
				},
				name: {
					native: "NAME",
					type: String
				},
				alias: {
					native: "ALIAS",
					type: String
				},
				author: {
					native: "AUTHOR",
					type: String
				},
				version: {
					native: "VERSION",
					type: String
				},
				notes: {
					native: "NOTE",
					type: String
				},
				packageId: {
					native: "PACKAGE_ID",
					type: Number
				},
				stereotype: {
					native: "STEREOTYPE",
					type: String
				},
				complexity: {
					native: "COMPLEXITY",
					type: String
				},
				effort: {
					native: "EFFORT",
					type: String
				},
				created: {
					native: "CREATEDDATE",
					type: Date
				},
				modified: {
					native: "MODIFIEDDATE",
					type: Date
				},
				status: {
					native: "STATUS",
					type: String
				},
				_abstract: {
					native: "ABSTRACT",
					type: String
				},
				visibility: {
					native: "VISIBILITY",
					type: String
				},
				persistence: {
					native: "PERSISTENCE",
					type: String
				},
				cardinality: {
					native: "CARDINALITY",
					type: String
				},
				phase: {
					native: "PHASE",
					type: String
				},
				scope: {
					native: "SCOPE",
					type: String
				},
				classifierId: {
					native: "CLASSIFIER",
					type: Number
				},
				parentId: {
					native: "PARENTID",
					type: Number
				},
				runState: {
					native: "RUNSTATE",
					type: String
				},
				classifierGuid: {
					native: "CLASSIFIER_GUID",
					type: String
				},
				position: {
					native: "TPOS",
					type: Number
				},
				multiplicity: {
					native: "MULTIPLICITY",
					type: String
				},
				backColor: {
					native: "BACKCOLOR",
					type: Number
				},
				fontColor: {
					native: "FONTCOLOR",
					type: Number
				},
				borderColor: {
					native: "BORDERCOLOR",
					type: Number
				},
				borderStyle: {
					native: "BORDERSTYLE",
					type: Number
				},
				borderWidth: {
					native: "BORDERWIDTH",
					type: Number
				},
				miscData0: {
					native: "PDATA1",
					type: String
				},
				miscData1: {
					native: "PDATA2",
					type: String
				},
				miscData2: {
					native: "PDATA3",
					type: String
				},
				miscData3: {
					native: "PDATA4",
					type: String
				},
				miscData4: {
					native: "PDATA5",
					type: String
				}
			}
		},
		XRef: {
			meta: {
				guid: "XREFID",
				native: "T_XREF"
			},
			columns: {
				guid: {
					native: "XREFID",
					type: String
				},
				name: {
					native: "NAME",
					type: String
				},
				type: {
					native: "TYPE",
					type: String
				},
				description: {
					native: "DESCRIPTION",
					type: String
				},
				clientGuid: {
					native: "CLIENT",
					type: String
				},
				supplierGuid: {
					native: "SUPPLIER",
					type: String
				},
				link: {
					native: "LINK",
					type: String
				}
			}
		},
		Scenario: {
			meta: {
				guid: "EA_GUID",
				native: "T_OBJECTSCENARIOS"
			},
			columns: {
				guid: {
					native: "EA_GUID",
					type: String
				},
				elementId: {
					native: "OBJECT_ID",
					type: Number
				},
				name: {
					native: "SCENARIO",
					type: String
				},
				type: {
					native: "SCENARIOTYPE",
					type: String
				},
				notes: {
					native: "NOTES",
					type: String
				},
				content: {
					native: "XMLCONTENT",
					type: String
				}
			}
		},
		DiagramObject: {
			meta: {
				id: "INSTANCE_ID",
				native: "T_DIAGRAMOBJECTS"
			},
			columns: {
				id: {
					native: "INSTANCE_ID",
					type: Number
				},
				elementId: {
					native: "OBJECT_ID",
					type: Number
				},
				parentId: {
					native: "DIAGRAM_ID",
					type: Number
				}
			}
		}
	}	
});

