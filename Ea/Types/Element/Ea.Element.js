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

Ea.Element = {};

Ea.Element._Base = extend(Ea.Types.Namespace, {
	
	isAbstract: function() {
		return this._getAbstract() == 1;
	},
	
	getParent: function() {
		return this._getParent() || this._getPackage();
	},
	
	getLinkedDiagram: function() {
		var id = this._getMiscData0();
		if (!id || !(id = (new Number(id)).valueOf())) return null;
		return Ea.getById(Ea.Diagram._Base, id);
	},
	
	_relationships: null,
	_getRelationships: function() {
		if (!this._relationships || Ea.mm) {
			this._relationships = new Core.Types.Collection();
			this.getConnectors().forEach(function(connector) {
				var client = (connector.getClient() == this);
				var thisConnectorEnd = !client ? connector.getSupplierEnd() : connector.getClientEnd();
				var secondEnd = client ? connector.getSupplier() : connector.getClient();
				var secondConnectorEnd = client ? connector.getSupplierEnd() : connector.getClientEnd();
				if (secondEnd) { // EA integrity problem (Connector.Supplier == null) workaround
					this._relationships.add(new Ea.Connector.Relationship({
						from: this,
						fromEnd: thisConnectorEnd,
						connector: connector,
						isClient: client,
						to: secondEnd,
						toEnd: secondConnectorEnd
					}));		
				}
			});
		}
		return this._relationships;
	},
	
	getRelationships: function(relation, filter) {
		var relations = new Core.Types.Collection();
		this._getRelationships().forEach(function(relationship) {
			if (!relation || (typeof relation == "string" && relation == relationship.getRelation()) || (relation.isClass && relation.isSubclassOf(Ea.Connector._Base) && relationship.getConnector().instanceOf(relation))) {
				var related = relationship.getTo();
				if (related.match(filter))
					relations.add(relationship);
			}
		});
		return relations;
	},
	
	getRelated: function(relation, filter) {
		var relations = new Core.Types.Collection();
		this.getRelationships(relation, filter).forEach(function(property) {
			relations.add(property.getTo());
		});
		return relations;
	},
	
	_customReferences: null,
	getCustomReferences: function() {
		if (!this._customReferences || Ea.mm) {
			this._customReferences = Ea.Application.getRepository().getCustomReferences(this);
		}
		return this._customReferences;
	},
	
	_contextReferences: null,
	getContextReferences: function() {
		if (!this._contextReferences || Ea.mm) {
			this._contextReferences = new Core.Types.Collection();
			this.getCustomReferences().forEach(function(reference) {
				this._contextReferences.add(new Ea.Element.ContextReference(reference.getNotes() || "", reference.getSupplier(), ""));
			});
			this._getRelationships().forEach(function(property) {
				var connection = property.getConnector()._class.getName();
				var supplier = property.getTo();
				var notes = property.getConnector().getName();
				this._contextReferences.add(new Ea.Element.ContextReference(notes, supplier, connection));
			});
		}
		return this._contextReferences;
	},

	findDiagrams: function() {
		return Ea.Application.getRepository().getByQuery(Ea.Diagram._Base, "t_diagramobjects", "Object_ID", this.getId(), "Diagram_ID");
	},
	
	_appearance: null,
	getAppearance: function() {
		if (!this._appearance || Ea.mm) {
			var rows = Ea.Application.getRepository().findByQuery("t_object", "Object_ID", this.getId());
			var row = rows[0];
			this._appearance = new Ea.DataTypes.Appearance(row);
		}
		return this._appearance;
	}
},
{
	api: "Element",
	
	_subTypes: {
		Class: {
			17: "AssociationClass"
		},
		Event: {
			0: "SendSignal",
			1: "AcceptEvent",
			2: "AcceptEvent" // Accept time event
		},
		Note: {
			1: "ConnectorNote",
			2: "ConnectorConstraint"
		},
		Pseudostate: {
			3: "InitialState",
			4: "FinalState",
			5: "History",
			6: "Synch",
			10: "Junction",
			11: "Choice",
			12: "Terminate",
			13: "EntryPoint",
			14: "ExitPoint",
			100: "ActivityInitial",
			101: "ActivityFinal",
			102: "FlowFinal"
		},
		Text: {
			18: "DiagramNotes",
			19: "Hyperlink",
			76: "Legend"
		}
	},
	
	getType: function(source) {
		var typeName = this._type.get(source).replace(/\s/g,"");
		var metaType = this._metatype.get(source);
		var subType;
		if (metaType) {
			typeName = metaType;
		}
		if (subType = (this._subTypes[typeName] || {})[this._subtype.get(source)]) {
			typeName = subType;
		}
		var type = this.namespace[typeName] || Ea.addType(this.namespace, typeName);
		return type;
	},
	
	_id: attribute({api: "ElementID", type: Number, id: "id"}),
	_guid: attribute({api: "ElementGUID", id: "guid"}),
	
	_alias: attribute({api: "Alias"}),
	_notes: attribute({api: "Notes"}),
	_stereotype: attribute({api: "Stereotype"}),

	_type: attribute({api: "Type", private: true}),
	_subtype: attribute({api: "Subtype", type: Number, private: true}),
	_metatype: attribute({api: "MetaType", private: true}),
	
	__abstract: attribute({api: "Abstract", private: true}),
	_tags: attribute({api: "TaggedValues", type: "Ea.Collection.Map", elementType: "Ea.TaggedValue._Base", key: "this.getName()", value: "this", aggregation: "composite"}),
	_customProperties: attribute({api: "CustomProperties", type: "Ea.Collection.Map", elementType: "Ea.CustomProperty._Base", key: "this.getName()", value: "this.getValue()", aggregation: "composite"}),
	_properties: attribute({api: "Properties", type: "Ea.Properties._Base", elementType: "Ea.Property._Base", key: "this.getName()", value: "this", aggregation: "composite"}),
	_constraints: attribute({api: "Constraints", type: "Ea.Collection._Base", elementType: "Ea.Constraint._Base", aggregation: "composite"}),
	_requirements: attribute({api: "Requirements", type: "Ea.Collection._Base", elementType: "Ea.Requirement._Base", aggregation: "composite"}),
	_embedded: attribute({api: "EmbeddedElements", type: "Ea.Collection._Base", elementType: "Ea.Element._Base", aggregation: "shared"}),
	_transitions: attribute({api: "StateTransitions", type: "Ea.Collection._Base", elementType: "Ea.Transition._Base", aggregation: "composite"}),
	
	_status: attribute({api: "Status"}),
	_difficulty: attribute({api: "Difficulty"}),
	_keywords: attribute({api: "Tag"}),
	_phase: attribute({api: "Phase"}),
	_version: attribute({api: "Version"}),
	_visibility: attribute({api: "Visibility"}),
	_author: attribute({api: "Author"}),
	_created: attribute({api: "Created", type: Ea.DataTypes.Date}),
	_modified: attribute({api: "Modified", type: Ea.DataTypes.Date}),
	_complexity: attribute({api: "Complexity", type: Number}),
	_multiplicity: attribute({api: "Multiplicity"}),
	_persistence: attribute({api: "Persistence"}),
	_priority: attribute({api: "Priority"}),
	
	_elements: attribute({api: "Elements", type: "Ea.Collection._Base", elementType: "Ea.Element._Base", aggregation: "composite"}),
	_diagrams: attribute({api: "Diagrams", type: "Ea.Collection._Base", elementType: "Ea.Diagram._Base", aggregation: "composite"}),
	_stereotypes: attribute({api: "StereotypeEx", type: Ea.DataTypes.List}),
	_connectors: attribute({api: "Connectors", type: "Ea.Collection._Base", elementType: "Ea.Connector._Base", aggregation: "shared"}),
	_files: attribute({api: "Files", type: "Ea.Collection._Base", elementType: "Ea.File._Base", aggregation: "composite"}),
	_parent: attribute({api: "ParentID", type: "Ea.Element._Base", referenceBy: "id", private: true}),
	_package: attribute({api: "PackageID", type: "Ea.Package._Base", referenceBy: "id", private: true}),
	_classifier: attribute({api: "ClassifierID", type: "Ea.Element.Classifier", referenceBy: "id"}),

	_miscData0: attribute({api: "MiscData", private: true, index: 0}),
	_miscData1: attribute({api: "MiscData", private: true, index: 1}),
	_miscData2: attribute({api: "MiscData", private: true, index: 2}),
	_miscData3: attribute({api: "MiscData", private: true, index: 3}),
	_position: attribute({api: "TreePos", type: Number}),

	_compositeDiagram: attribute({api: "CompositeDiagram", type: "Ea.Diagram._Base"}),
	
	//_inDiagrams: derived({getter: "findDiagrams", type: "Ea.Collection._Base", elementType: "Ea.Diagram._Base"}),
	
	_abstract: derived({getter: "isAbstract", type: Boolean}),
	_linkedDiagram: derived({getter: "getLinkedDiagram", type: "Ea.Diagram._Base"}),
	_customReferences: derived({getter: "getCustomReferences", type: "Core.Types.Collection", elementType: "Ea.Element._Base"}),
	_appearance: derived({getter: "getAppearance", type: "Ea.DataTypes.Appearance"})
});

Ea.Element.ContextReference = define({
	_notes: null,
	_supplier: null,
	_connection: null,

	create: function(notes, supplier, connection) {
		_super.create(params);
		this._notes = notes;
		this._supplier = supplier;
		this._connection = connection;
	},
	
	getNotes: function() {
		return this._notes;
	},
	
	getSupplier: function() {
		return this._supplier;
	},
	
	getConnection: function() {
		return this._connection;
	}
});

Ea.Element.Object = extend(Ea.Element._Base, {

	_toString: function() {
		var metaClass = this.getMetaClass();
		return this.getName() + " :" + (metaClass ? metaClass.getName() : "<<unknown class>>") + " [" + this._class  + "]";
	}
},
{
	_metaClass: attribute({api: "ClassifierID", type: "Ea.Element.Classifier", referenceBy: "id"}),
	_runState: attribute({api: "RunState", type: Ea.DataTypes.RunState})
});

Ea.Element.Goal = extend(Ea.Element.Object);

Ea.Element.Package = extend(Ea.Element._Base, {
	getPackage: function() {
		return Ea.getByGuid(Ea.Package._Base, this.getGuid());
	}
},
{
	__package: derived({getter: "getPackage", type: "Ea.Package._Base"})
});

Ea.Element.Type = extend(Ea.Element._Base);
	
Ea.Element.Classifier = extend(Ea.Element.Type, {},
{
	_attributes: attribute({api: "Attributes", type: "Ea.Collection._Base", elementType: "Ea.Attribute.Attribute", filter: "this.getStereotype() != 'enum'", aggregation: "composite"}),
	_method: attribute({api: "Methods", type: "Ea.Collection._Base", elementType: "Ea.Method._Base", aggregation: "composite"})
});

Ea.Element.DataType = extend(Ea.Element.Classifier);

Ea.Element.Enumeration = extend(Ea.Element.DataType, {},
{
	_literals: attribute({api: "Attributes", type: "Ea.Collection._Base", elementType: "Ea.Attribute.EnumerationLiteral", filter: "this.getStereotype() == 'enum'", aggregation: "composite"})
});

Ea.Element.PrimitiveType = extend(Ea.Element.DataType);

Ea.Element.Class = extend(Ea.Element.Classifier);

Ea.Element.Metaclass = extend(Ea.Element.Class);

Ea.Element.Meaning = extend(Ea.Element.Class);

Ea.Element.AssociationClass = extend(Ea.Element.Class, {
	getAssociation: function() {
		return Ea.getById(Ea.Connector._Base, Number(this._getMiscData3()).valueOf());
	}
},
{
	__association: derived({getter: "getAssociation", type: "Ea.Connector._Base"})
});

Ea.Element.Interface = extend(Ea.Element.Classifier);

Ea.Element._BehavioralElement = extend(Ea.Element._Base, {
	getBasicScenario: function() {
		var basic = this._getBasicScenarios();
		if (basic.isEmpty())
			return null;
		if (basic.getSize() == 1)
			return basic.first();
		throw new Error("More than one basic scenario");
	},
	
	getScenarioExtensions: function() {
		var basic = this.getBasicScenario();
		var extensions = new Core.Types.Collection();
		if (basic)
			basic.getSteps().forEach(function(step) {
				extensions.addAll(step._getExtensions());
			});
		return extensions;
	}
},
{
	/*
	 * don't use this property - EA returns faked scenarios (not used in scenario extensions)!
	 * _scenarios: attribute({api: "Scenarios", type: "Ea.Collection._Base", elementType: "Ea.Scenario._Base", aggregation: "composite"}),
	 */
	_basicScenarios: attribute({api: "Scenarios", type: "Ea.Collection._Base", elementType: "Ea.Scenario._Base", filter: "this.instanceOf(Ea.Scenario.BasicPath)", private: true}),
	_basicScenario: derived({type: "Ea.Scenario.BasicPath", getter: "getBasicScenario", aggregation: "composite"}),
	_scenarioExtensions: derived({type: "Core.Types.Collection", elementType: "Ea.ScenarioExtension._Base", getter: "getScenarioExtensions", aggregation: "composite"})
});

// Activity --> Behavior --> Class --> Classifier
Ea.Element.Activity = extend(Ea.Element._BehavioralElement);

// UseCase --> BehavioredClassifier --> Classifier
Ea.Element.UseCase = extend(Ea.Element._BehavioralElement, {},
{
	_extensionPoints: attribute({api: "ExtensionPoints", type: Ea.DataTypes.List})
});

Ea.Element.Process = extend(Ea.Element._BehavioralElement);

//Action --> ActivityNode --> NamedElement
Ea.Element.Action = extend(Ea.Element._Base);
Ea.Element._CallAction = extend(Ea.Element.Action, {
	_toString: function() {
		var classifier = this.getClassifier();
		return this.getName() + " :" + (classifier ? classifier.getName() : "<<undefined reference>>") + " [" + this._class  + "]";
	}
});
Ea.Element.CallBehaviorAction = extend(Ea.Element._CallAction);
Ea.Element.CallOperationAction = extend(Ea.Element._CallAction);

Ea.Element.Pseudostate = extend(Ea.Element._Base);
Ea.Element.ActivityInitial = extend(Ea.Element.Pseudostate);
Ea.Element.ActivityFinal = extend(Ea.Element.Pseudostate);

Ea.Element.Constraint = extend(Ea.Element._Base, {
	getConstrainted: function() {
		var string = this.getMiscData0();
		if (string == null) return null;
		// TODO: parse 'idref1=264627;idref2=264626;'
	}
});

Ea.Element.Note = extend(Ea.Element._Base, {
	getNoted: function() {
		var string = this._getMiscData0();
		if (string == null) return null;
		// TODO: parse 'idref1=241181;idref2=241185;idref3=243101;' // ids of Connectors
	}
});
Ea.Element.ConnectorNote = extend(Ea.Element.Note);
Ea.Element.ConnectorConstraint = extend(Ea.Element.Note);

Ea.Element.Text = extend(Ea.Element._Base, {
	getDiagram: function() {
		var link = this._getMiscData0();
		if (link == null) return null;
		return Ea.getById(Ea.Diagram._Base, link);
	}
});

Ea.Element.Requirement = extend(Ea.Element._Base);

Ea.Element.Actor = extend(Ea.Element._Base);

Ea.Element.Artifact = extend(Ea.Element._Base);

include("Ea.TypedElement@Ea.Types.Common");

Ea.register("Ea.Attribute@Ea.Types.Element.Feature", 23);
Ea.register("Ea.Method@Ea.Types.Element.Feature", 24);

Ea.register("Ea.File@Ea.Types.Element", 13);
Ea.register("Ea.Requirement@Ea.Types.Element", 9);

Ea.register("Ea.TaggedValue@Ea.Types.Element", 12);
Ea.register("Ea.Properties@Ea.Types.Element.Property", 48);
Ea.register("Ea.CustomProperty@Ea.Types.Element", 42);

Ea.register("Ea.Constraint@Ea.Types.Element", 11);
Ea.register("Ea.Transition@Ea.Types.Element", 44);

Ea.register("Ea.Scenario@Ea.Types.Element.Scenario", 10);
