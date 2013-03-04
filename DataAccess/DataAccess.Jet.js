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

DataAccess.Jet = {
	initialize: function() {
		DataAccess.registerProviderClass("Jet", this.Provider);
	}
};

DataAccess.Jet.Provider = extend(DataAccess._Provider, {
	
	_tables: {
		Element: {
			meta: {
				id: "Object_ID",
				guid: "ea_guid",
				name: "t_object"
			},
			columns: {
				id: {
					name: "Object_ID",
					type: Number
				},
				guid: {
					name: "ea_guid",
					type: String
				},
				name: {
					name: "Name",
					type: String
				},
				alias: {
					name: "Alias",
					type: String
				},
				author: {
					name: "Author",
					type: String
				},
				version: {
					name: "Version",
					type: String
				},
				notes: {
					name: "Note",
					type: String
				},
				packageId: {
					name: "Package_ID",
					type: Number
				},
				stereotype: {
					name: "Stereotype",
					type: String
				},
				complexity: {
					name: "Complexity",
					type: String
				},
				effort: {
					name: "Effort",
					type: String
				},
				created: {
					name: "CreatedDate",
					type: Date
				},
				modified: {
					name: "ModifiedDate",
					type: Date
				},
				status: {
					name: "Status",
					type: String
				},
				_abstract: {
					name: "Abstract",
					type: String
				},
				visibility: {
					name: "Visibility",
					type: String
				},
				persistence: {
					name: "Persistence",
					type: String
				},
				cardinality: {
					name: "Cardinality",
					type: String
				},
				phase: {
					name: "Phase",
					type: String
				},
				scope: {
					name: "Scope",
					type: String
				},
				classifierId: {
					name: "Classifier",
					type: Number
				},
				parentId: {
					name: "ParentID",
					type: Number
				},
				runState: {
					name: "RunState",
					type: String
				},
				classifierGuid: {
					name: "Classifier_guid",
					type: String
				},
				position: {
					name: "TPos",
					type: Number
				},
				multiplicity: {
					name: "Multiplicity",
					type: String
				},
				backColor: {
					name: "Backcolor",
					type: Number
				},
				fontColor: {
					name: "Fontcolor",
					type: Number
				},
				borderColor: {
					name: "Bordercolor",
					type: Number
				},
				borderStyle: {
					name: "BorderStyle",
					type: Number
				},
				borderWidth: {
					name: "BorderWidth",
					type: Number
				}
			}
		},
		XRef: {
			meta: {
				guid: "XrefID",
				name: "t_xref"
			},
			columns: {
				guid: {
					name: "XrefID",
					type: String
				},
				name: {
					name: "Name",
					type: String
				},
				type: {
					name: "Type",
					type: String
				},
				description: {
					name: "Description",
					type: String
				},
				clientGuid: {
					name: "Client",
					type: String
				},
				supplierGuid: {
					name: "Supplier",
					type: String
				},
				link: {
					name: "Link",
					type: String
				}
			}
		},
		Scenario: {
			meta: {
				guid: "ea_guid",
				name: "t_objectscenarios"
			},
			columns: {
				guid: {
					name: "ea_guid",
					type: String
				},
				elementId: {
					name: "Object_ID",
					type: Number
				},
				name: {
					name: "Scenario",
					type: String
				},
				type: {
					name: "ScenarioType",
					type: String
				},
				notes: {
					name: "Notes",
					type: String
				},
				content: {
					name: "XMLContent",
					type: String
				}
			}
		},
		DiagramObject: {
			meta: {
				id: "Instance_ID",
				name: "t_diagramobjects"
			},
			columns: {
				id: {
					name: "Instance_ID",
					type: Number
				},
				elementId: {
					name: "Object_ID",
					type: Number
				},
				parentId: {
					name: "Diagram_ID",
					type: Number
				}
			}
		}
	},
	
	getSelect: function(table) {
		table = this._tables[table].meta.name;
		var sql = "select * from " + table + " where";
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

