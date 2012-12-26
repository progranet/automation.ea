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
Ea.Element = {};

Ea.Element._Base = extend(Ea.Types.Namespace, /** @lends Ea.Element._Base# */ {

	getParent: function() {
		return this._getParent() || this._getPackage();
	},
	
	getLinkedDiagram: function() {
		var linkedDiagram = this.fromCache("linkedDiagram");
		if (linkedDiagram === undefined) {
			var id = this._getMiscData0();
			if (!id || !(id = (new Number(id)).valueOf()))
				linkedDiagram = null;
			else
				linkedDiagram = this._source.application.getRepository().getById(Ea.Diagram._Base, id);
			this.toCache("linkedDiagram", linkedDiagram);
		}
		return linkedDiagram;
	},
	
	_getRelationships: function() {
		var relationships = this.fromCache("relationships");
		if (relationships === undefined) {
			relationships = new Core.Types.Collection();
			this.getConnectors().forEach(function(connector) {
				var client = (connector.getClient() == this);
				var thisConnectorEnd = !client ? connector.getSupplierEnd() : connector.getClientEnd();
				var secondEnd = client ? connector.getSupplier() : connector.getClient();
				var secondConnectorEnd = client ? connector.getSupplierEnd() : connector.getClientEnd();
				if (secondEnd) { // EA integrity problem (Connector.Supplier == null) workaround
					relationships.add(new Ea.Relationship({
						from: this,
						fromEnd: thisConnectorEnd,
						connector: connector,
						isClient: client,
						to: secondEnd,
						toEnd: secondConnectorEnd
					}));		
				}
			});
			this.toCache("relationships", relationships);
		}
		return relationships;
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
	
	getCustomReferences: function() {
		var customReferences = this.fromCache("customReferences");
		if (customReferences === undefined) {
			customReferences = this._source.application.getRepository().getCustomReferences(this);
			this.toCache("customReferences", customReferences);
		}
		return customReferences;
	},
	
	getContextReferences: function() {
		var contextReferences = this.fromCache("contextReferences");
		if (contextReferences === undefined) {
			contextReferences = new Core.Types.Collection();
			this.getCustomReferences().forEach(function(reference) {
				contextReferences.add(new Ea.ContextReference(reference.getNotes() || "", reference.getSupplier(), ""));
			});
			this._getRelationships().forEach(function(relationship) {
				var connection = relationship.getConnector()._class.getName();
				var supplier = relationship.getTo();
				var notes = relationship.getConnector().getName();
				contextReferences.add(new Ea.ContextReference(notes, supplier, connection));
			});
			this.toCache("contextReferences", contextReferences);
		}
		return contextReferences;
	},

	findDiagrams: function() {
		return this._source.application.getRepository().getByQuery(Ea.Diagram._Base, "t_diagramobjects", "Object_ID", this.getId(), "Diagram_ID");
	},
	
	getAppearance: function() {
		var appearance = this.fromCache("appearance");
		if (appearance === undefined) {
			var rows = this._source.application.getRepository().findByQuery("t_object", "Object_ID", this.getId());
			var row = rows[0];
			appearance = new Ea.DataTypes.Appearance(row);
			this.toCache("appearance", appearance);
		}
		return appearance;
	}
},
{
	api: "Element",
	
	_subTypes: {
		Event: {
			0: "SendSignalAction",	// Send event
			1: "AcceptEventAction",	// Accept event
			2: "AcceptEventAction"	// Accept time event
		},
		Pseudostate: {
			4: "FinalState",
			100: "InitialNode",
			101: "ActivityFinalNode",
			102: "FlowFinalNode"
		},
		Note: {
			1: "ConnectorNote",
			2: "ConnectorConstraint"
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
		
		if (metaType)
			typeName = metaType;
		
		if (typeName == "Event") {
			
		}
		var subTypes = this._subTypes[typeName];
		if (subTypes)
			typeName = subTypes[this._subtype.get(source)] || typeName;
		
		// don't trust subtype == 17 - EA loses this information sometimes (when element becomes "composite" with subtype == 8)
		if (typeName == "Class") {
			var association = this._miscData3.get(source);
			if (association && association != 0)
				typeName = "AssociationClass";
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
	
	_linkedDiagram: derived({getter: "getLinkedDiagram", type: "Ea.Diagram._Base"}),
	_customReferences: derived({getter: "getCustomReferences", type: "Core.Types.Collection", elementType: "Ea.Element._Base"}),
	_appearance: derived({getter: "getAppearance", type: "Ea.DataTypes.Appearance"})
});

Ea.Element.PackageableElement = extend(Ea.Element._Base);

Ea.Element.Package = extend(Ea.Element.PackageableElement, {
	getPackage: function() {
		return this._source.application.getRepository().getByGuid(Ea.Package._Base, this.getGuid());
	}
},
{
	__package: derived({getter: "getPackage", type: "Ea.Package._Base"})
});

Ea.Element.Type = extend(Ea.Element.PackageableElement);
	
Ea.Element.Classifier = extend(Ea.Element.Type, {

	/**
	 * @memberOf Ea.Element.Classifier#
	 * @returns {Boolean}
	 */
	isAbstract: function() {
		return this._getAbstract() == 1;
	},
	
	/*
	 * Scenarios are custom EA behavior specification.
	 * Place, where scenarios are specified in Element specialization hierarchy is dictated by pragmatic usage not by any formal specification
	 */
	
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
	__abstract: attribute({api: "Abstract", private: true}),
	_abstract: derived({getter: "isAbstract", type: Boolean}),
	_attributes: attribute({api: "Attributes", type: "Ea.Collection._Base", elementType: "Ea.Attribute.Attribute", filter: "this.getStereotype() != 'enum'", aggregation: "composite"}),
	_methods: attribute({api: "Methods", type: "Ea.Collection._Base", elementType: "Ea.Method._Base", aggregation: "composite"}),

	/* don't use EA API: Element.Scenarios - it returns faked scenarios (not used in scenario extensions)!
	 * _scenarios: attribute({api: "Scenarios", type: "Ea.Collection._Base", elementType: "Ea.Scenario._Base", aggregation: "composite"}) */
	_basicScenarios: attribute({api: "Scenarios", type: "Ea.Collection._Base", elementType: "Ea.Scenario._Base", filter: "this.instanceOf(Ea.Scenario.BasicPath)", private: true}),
	_basicScenario: derived({type: "Ea.Scenario.BasicPath", getter: "getBasicScenario", aggregation: "composite"}),
	_scenarioExtensions: derived({type: "Core.Types.Collection", elementType: "Ea.ScenarioExtension._Base", getter: "getScenarioExtensions", aggregation: "composite"})
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
		var associationId = Number(this._getMiscData3()).valueOf();
		var association = this._source.application.getRepository().getById(Ea.Connector._Base, associationId);
		if (!association)
			warn("Association no longer exists [id = " + associationId + "] for association class guid = " + this.getGuid());
		return association;
	}
},
{
	__association: derived({getter: "getAssociation", type: "Ea.Connector._Base"})
});

Ea.Element.Interface = extend(Ea.Element.Classifier);

Ea.Element.BehavioredClassifier = extend(Ea.Element.Classifier);

Ea.Element.Actor = extend(Ea.Element.BehavioredClassifier);

Ea.Element.UseCase = extend(Ea.Element.BehavioredClassifier, {},
{
	_extensionPoints: attribute({api: "ExtensionPoints", type: Ea.DataTypes.List})
});

Ea.Element.Behavior = extend(Ea.Element.Class);

Ea.Element.Activity = extend(Ea.Element.Behavior);

Ea.Element.Action = extend(Ea.Element._Base);
Ea.Element.AcceptEventAction = extend(Ea.Element.Action);
Ea.Element.InvocationAction = extend(Ea.Element.Action);
Ea.Element.SendSignalAction = extend(Ea.Element.InvocationAction);

Ea.Element.CallAction = extend(Ea.Element.Action, {
	_toString: function() {
		var classifier = this.getClassifier();
		return this.getName() + " :" + (classifier ? classifier.getName() : "<<undefined reference>>") + " [" + this._class  + "]";
	}
});
Ea.Element.CallBehaviorAction = extend(Ea.Element.CallAction);
Ea.Element.CallOperationAction = extend(Ea.Element.CallAction);

Ea.Element.State = extend(Ea.Element._Base);
Ea.Element.FinalState = extend(Ea.Element.State);

Ea.Element.Pseudostate = extend(Ea.Element._Base, {
	
	getKind: function() {
		return Ea.Element.Pseudostate.kind[this._getSubtype()];
	}
	
}, {
	
	kind: {
		3: "initial",
		//4: "FinalState", // not a kind of PseudoState - its class itself, specialization of State
		5: "shallowHistory",
		6: "Synch", // TODO - not a kind in UML specification
		// TODO fork and join pseudostate kinds
		10: "junction",
		11: "choice",
		12: "terminate",
		13: "entryPoint",
		14: "exitPoint",
		15: "deepHistory"
	},
	
	_kind: derived({getter: "getKind"})
	
});

Ea.Element.ActivityNode = extend(Ea.Element._Base);
Ea.Element.ControlNode = extend(Ea.Element.ActivityNode);
Ea.Element.InitialNode = extend(Ea.Element.ControlNode);
Ea.Element.FinalNode = extend(Ea.Element.ControlNode);
Ea.Element.ActivityFinalNode = extend(Ea.Element.FinalNode);
Ea.Element.FlowFinalNode = extend(Ea.Element.FinalNode);

Ea.Element.Constraint = extend(Ea.Element._Base, {
	getConstrainted: function() {
		var string = this.getMiscData0();
		if (string == null) return null;
		// TODO: parse 'idref1=264627;idref2=264626;'
	}
});

/*
 * EA custom types
 */
Ea.Element.Requirement = extend(Ea.Element._Base);
Ea.Element.Artifact = extend(Ea.Element._Base);
Ea.Element.Process = extend(Ea.Element.BehavioredClassifier); // TODO verify with BPMN specification

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
		return this._source.application.getRepository().getById(Ea.Diagram._Base, link);
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
