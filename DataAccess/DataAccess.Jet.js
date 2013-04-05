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

DataAccess.Jet = {};

DataAccess.Jet.Provider = extend(DataAccess._Provider, {
	
	_getTables: function() {
		return this._class._tables;
	},
	
	getSelect: function(table) {
		var sql = "select * from " + this.getTable(table).native + " where";
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
				id: "Object_ID",
				guid: "ea_guid",
				native: "t_object"
			},
			columns: {
				id: {
					native: "Object_ID",
					type: Number
				},
				guid: {
					native: "ea_guid",
					type: String
				},
				name: {
					native: "Name",
					type: String
				},
				alias: {
					native: "Alias",
					type: String
				},
				author: {
					native: "Author",
					type: String
				},
				version: {
					native: "Version",
					type: String
				},
				notes: {
					native: "Note",
					type: String
				},
				packageId: {
					native: "Package_ID",
					type: Number
				},
				stereotype: {
					native: "Stereotype",
					type: String
				},
				complexity: {
					native: "Complexity",
					type: String
				},
				effort: {
					native: "Effort",
					type: String
				},
				created: {
					native: "CreatedDate",
					type: Date
				},
				modified: {
					native: "ModifiedDate",
					type: Date
				},
				status: {
					native: "Status",
					type: String
				},
				_abstract: {
					native: "Abstract",
					type: String
				},
				visibility: {
					native: "Visibility",
					type: String
				},
				persistence: {
					native: "Persistence",
					type: String
				},
				cardinality: {
					native: "Cardinality",
					type: String
				},
				phase: {
					native: "Phase",
					type: String
				},
				scope: {
					native: "Scope",
					type: String
				},
				classifierId: {
					native: "Classifier",
					type: Number
				},
				parentId: {
					native: "ParentID",
					type: Number
				},
				runState: {
					native: "RunState",
					type: String
				},
				classifierGuid: {
					native: "Classifier_guid",
					type: String
				},
				position: {
					native: "TPos",
					type: Number
				},
				multiplicity: {
					native: "Multiplicity",
					type: String
				},
				backColor: {
					native: "Backcolor",
					type: Number
				},
				fontColor: {
					native: "Fontcolor",
					type: Number
				},
				borderColor: {
					native: "Bordercolor",
					type: Number
				},
				borderStyle: {
					native: "BorderStyle",
					type: Number
				},
				borderWidth: {
					native: "BorderWidth",
					type: Number
				}
			}
		},
		XRef: {
			meta: {
				guid: "XrefID",
				native: "t_xref"
			},
			columns: {
				guid: {
					native: "XrefID",
					type: String
				},
				name: {
					native: "Name",
					type: String
				},
				type: {
					native: "Type",
					type: String
				},
				description: {
					native: "Description",
					type: String
				},
				clientGuid: {
					native: "Client",
					type: String
				},
				supplierGuid: {
					native: "Supplier",
					type: String
				},
				link: {
					native: "Link",
					type: String
				}
			}
		},
		Scenario: {
			meta: {
				guid: "ea_guid",
				native: "t_objectscenarios"
			},
			columns: {
				guid: {
					native: "ea_guid",
					type: String
				},
				elementId: {
					native: "Object_ID",
					type: Number
				},
				name: {
					native: "Scenario",
					type: String
				},
				type: {
					native: "ScenarioType",
					type: String
				},
				notes: {
					native: "Notes",
					type: String
				},
				content: {
					native: "XMLContent",
					type: String
				}
			}
		},
		DiagramObject: {
			meta: {
				id: "Instance_ID",
				native: "t_diagramobjects"
			},
			columns: {
				id: {
					native: "Instance_ID",
					type: Number
				},
				elementId: {
					native: "Object_ID",
					type: Number
				},
				parentId: {
					native: "Diagram_ID",
					type: Number
				}
			}
		}
	}
	
});

