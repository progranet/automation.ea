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
Ea.Element = {
		meta: {
			id: "ElementID",
			guid: "ElementGUID",
			objectType: 4
		}
};

Ea.Element._Base = extend(Ea.Types.Namespace, /** @lends Ea.Element._Base# */ {

	getParent: function() {
		return this._getParent() || this._getPackage();
	},
	
	getLinkedDiagram: function() {
		var id = this._getMiscData0();
		var linkedDiagram = null;
		if (!id || !(id = (new Number(id)).valueOf()))
			linkedDiagram = null;
		else
			linkedDiagram = this._source.application.getById(Ea.Diagram._Base, id);
		return linkedDiagram;
	},
	
	_getRelationships: function(filter) {
		var relationships = new Core.Types.Collection();
		this.getConnectors().forEach(function(connector) {
			var client = (connector.getClient() == this);
			var thisConnectorEnd = !client ? connector.getSupplierEnd() : connector.getClientEnd();
			var secondEnd = client ? connector.getSupplier() : connector.getClient();
			var secondConnectorEnd = client ? connector.getSupplierEnd() : connector.getClientEnd();
			if (secondEnd) { // EA integrity problem (Connector.Supplier == null) workaround
				relationships.add(new Ea._Base.Relationship({
					from: this,
					fromEnd: thisConnectorEnd,
					connector: connector,
					isClient: client,
					to: secondEnd,
					toEnd: secondConnectorEnd
				}));		
			}
		});
		return relationships.filter(filter);
	},
	
	getRelationships: function(relation, filter) {
		var relations = new Core.Types.Collection();
		this._getRelationships().forEach(function(relationship) {
			if (!relation || (typeof relation == "string" && relation == relationship.getRelation()) || (relation.isClass && relation.conformsTo(Ea.Connector._Base) && relationship.getConnector().instanceOf(relation))) {
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
	
	getCustomReferences: function(filter) {
		var customReferences = this._source.application.getRepository().getCustomReferences(this);
		return customReferences.filter(filter);
	},
	
	getContextReferences: function(filter) {
		var contextReferences = new Core.Types.Collection();
		this.getCustomReferences().forEach(function(reference) {
			contextReferences.add(new Ea._Base.ContextReference(reference.getNotes() || "", reference.getSupplier(), ""));
		});
		this._getRelationships().forEach(function(relationship) {
			var connection = relationship.getConnector()._class.getName();
			var supplier = relationship.getTo();
			var notes = relationship.getConnector().getName();
			contextReferences.add(new Ea._Base.ContextReference(notes, supplier, connection));
		});
		return contextReferences.filter(filter);
	},

	findDiagrams: function() {
		return this._source.application.getRepository().getByQuery(Ea.Diagram._Base, "DiagramObject", "elementId", this.getId(), "parentId");
	},
	
	getAppearance: function() {
		return this._source.application.getRepository().getElementAppearance(this);
	}
},
{
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
	
	/**
	 * Recognizes class of EA Element from source
	 * 
	 * @param {Object} source
	 * @type {Class}
	 */
	determineType: function(source) {
		
		var typeName = this.__type.get(source).replace(/\s/g,"");
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
		
		var type = this.namespace[typeName] || this._createType(typeName);
		
		return type;
	},
	
	/**
	 * Determines EA API Element type name on creating API object
	 * 
	 * @type {String}
	 */
	determineEaType: function() {
		return this.eaType;
	},

	/**
	 * @type {Number}
	 */
	_id: property({api: "ElementID"}),

	_guid: property({api: "ElementGUID"}),
	
	_alias: property({api: "Alias"}),
	
	_notes: property({api: "Notes"}),
	
	_stereotype: property({api: "Stereotype"}),

	/**
	 * @private
	 */
	__type: property({api: "Type"}),
	
	/**
	 * @type {Number}
	 * @private
	 */
	_subtype: property({api: "Subtype"}),

	/**
	 * @private
	 */
	_metatype: property({api: "MetaType"}),
	
	/**
	 * @type {Ea.Collection.Map<Ea.TaggedValue._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_tag: property({api: "TaggedValues"}),
	
	/**
	 * @type {Ea.Collection.Map<Ea.CustomProperty._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_customProperty: property({api: "CustomProperties"}),
	
	/**
	 * @type {Ea.Properties._Base<Ea.Property._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_property: property({api: "Properties"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Constraint._Base>}
	 * @aggregation composite
	 */
	_constraint: property({api: "Constraints"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Requirement._Base>}
	 * @aggregation composite
	 */
	_requirement: property({api: "Requirements"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Issue._Base>}
	 * @aggregation composite
	 */
	_issue: property({api: "Issues"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 * @aggregation composite
	 */
	_embeddedElement: property({api: "EmbeddedElements"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Transition._Base>}
	 * @aggregation composite
	 */
	_transition: property({api: "StateTransitions"}),
	
	_status: property({api: "Status"}),
	
	_difficulty: property({api: "Difficulty"}),
	
	_keywords: property({api: "Tag"}),
	
	_phase: property({api: "Phase"}),
	
	_version: property({api: "Version"}),
	
	_visibility: property({api: "Visibility"}),
	
	_author: property({api: "Author"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_created: property({api: "Created"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_modified: property({api: "Modified"}),
	
	/**
	 * @type {Number}
	 */
	_complexity: property({api: "Complexity"}),
	
	_multiplicity: property({api: "Multiplicity"}),
	
	_persistence: property({api: "Persistence"}),
	
	_priority: property({api: "Priority"}),
	
	/**
	 * @type {Core.Types.Collection<Ea._Base.Relationship>}
	 * @derived
	 * @private
	 */
	_relationship: property(),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 * @aggregation composite
	 */
	_element: property({api: "Elements"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Diagram._Base>}
	 * @aggregation composite
	 */
	_diagram: property({api: "Diagrams"}),
	
	/**
	 * @type {Ea._Base.DataTypes.List}
	 */
	_stereotypes: property({api: "StereotypeEx"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Connector._Base>}
	 * @aggregation shared
	 */
	_connector: property({api: "Connectors"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.File._Base>}
	 * @aggregation composite
	 */
	_file: property({api: "Files"}),
	
	/**
	 * @type {Ea.Types.Namespace}
	 * @derived
	 */
	_parent: property(),

	/**
	 * @type {Ea.Element._Base}
	 * @private
	 */
	__parent: property({api: "ParentID", referenceBy: "id"}),
	
	/**
	 * @type {Ea.Package._Base}
	 * @private
	 */
	__package: property({api: "PackageID", referenceBy: "id"}),
	
	/**
	 * @type {Ea.Element.Classifier}
	 */
	_classifier: property({api: "ClassifierID", referenceBy: "id"}),

	/**
	 * @private
	 */
	_miscData0: property({api: "MiscData", index: 0}),
	
	/**
	 * @private
	 */
	_miscData1: property({api: "MiscData", index: 1}),
	
	/**
	 * @private
	 */
	_miscData2: property({api: "MiscData", index: 2}),
	
	/**
	 * @private
	 */
	_miscData3: property({api: "MiscData", index: 3}),
	
	/**
	 * @type {Number}
	 */
	_position: property({api: "TreePos"}),

	/**
	 * @type {Ea.Diagram._Base}
	 */
	_compositeDiagram: property({api: "CompositeDiagram"}),
	
	/**
	 * @type {Ea.Diagram._Base}
	 * @derived
	 */
	_linkedDiagram: property(),
	
	/**
	 * @type {Core.Types.Collection<Ea.Element._Base>}
	 * @derived
	 */
	_customReference: property(),
	
	/**
	 * @type {Core.Types.Collection<Ea._Base.ContextReference>}
	 * @derived
	 */
	_contextReference: property(),
	
	/**
	 * @type {Ea._Base.DataTypes.Appearance}
	 * @derived
	 */
	_appearance: property()
});

Ea.Element.PackageableElement = extend(Ea.Element._Base);

Ea.Element.Package = extend(Ea.Element.PackageableElement, {
	getPackage: function() {
		return this._source.application.getByGuid(Ea.Package._Base, this.getGuid());
	}
},
{
	eaType: "Package", // see t_objecttypes table
	
	/**
	 * @type {Ea.Package._Base}
	 * @derived
	 */
	_package: property()
});

Ea.Element.Type = extend(Ea.Element.PackageableElement);
	
Ea.Element.Classifier = extend(Ea.Element.Type, {

	/**
	 * @memberOf Ea.Element.Classifier#
	 * @type {Boolean}
	 */
	isAbstract: function() {
		return this._getAbstract() == 1;
	},
	
	/*
	 * Scenarios are custom EA behavior specification.
	 * Place, where scenarios are specified in Element specialization hierarchy is dictated by pragmatic usage not by any formal specification
	 */
	
	getBasicScenario: function() {
		var basicScenarios = this._getScenarios().filter("this.instanceOf(Ea.Scenario.BasicPath)");
		var basicScenario;
		if (basicScenarios.isEmpty())
			basicScenario = null;
		else if (basicScenarios.getSize() == 1)
			basicScenario = basicScenarios.first();
		else
			throw new Error("More than one basic scenario");
		return basicScenario;
	},
	
	getScenarioExtensions: function(filter) {
		var basic = this.getBasicScenario();
		var scenarioExtensions = new Core.Types.Collection();
		if (basic)
			basic.getSteps().forEach(function(step) {
				scenarioExtensions.addAll(step._getExtensions());
			});
		return scenarioExtensions.filter(filter);
	},
	
	getAttributes: function(filter) {
		var attributes = this._getAttributes().filter("this.getStereotype() != 'enum'");
		return attributes.filter(filter);
	},
	
	createAttribute: function(name, type) {
		return this._createAttribute(name, type);
	},
	
	deleteAttribute: function(attribute) {
		return this._deleteAttribute(attribute);
	}
},
{
	/**
	 * @private
	 */
	__abstract: property({api: "Abstract"}),
	
	/**
	 * @type {Boolean}
	 * @derived
	 */
	_abstract: property(),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Attribute.Attribute>}
	 * @private
	 */
	__attribute: property({api: "Attributes"}),
	
	/**
	 * @type {Core.Types.Collection<Ea.Attribute.Attribute>}
	 * @aggregation composite
	 * @derived
	 */
	_attribute: property(),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Method._Base>}
	 * @aggregation composite
	 */
	_method: property({api: "Methods"}),

	/* don't use EA API: Element.Scenarios directly - it returns faked scenarios (not used in scenario extensions)! */
	/**
	 * @type {Ea.Collection._Base<Ea.Scenario._Base>}
	 * @private
	 */
	__scenario: property({api: "Scenarios"}),
	
	/**
	 * @type {Ea.Scenario.BasicPath}
	 * @aggregation composite
	 * @derived
	 */
	_basicScenario: property(),
	
	/**
	 * @type {Core.Types.Collection<Ea.ScenarioExtension._Base>}
	 * @aggregation composite
	 * @derived
	 */
	_scenarioExtension: property()
});

Ea.Element.DataType = extend(Ea.Element.Classifier);

Ea.Element.Enumeration = extend(Ea.Element.DataType, {
	
	getLiterals: function(filter) {
		var literals = this._getAttributes().filter("this.getStereotype() == 'enum'");
		return literals.filter(filter);
	}
	
},
{
	eaType: "Enumeration",

	/**
	 * @type {Core.Types.Collection<Ea.Attribute.EnumerationLiteral>}
	 * @aggregation composite
	 * @derived
	 */
	_literal: property()
});

Ea.Element.PrimitiveType = extend(Ea.Element.DataType);

Ea.Element.Class = extend(Ea.Element.Classifier, {}, {

	eaType: "Class"
	
});

Ea.Element.Metaclass = extend(Ea.Element.Class);

Ea.Element.AssociationClass = extend(Ea.Element.Class, {
	getAssociation: function() {
		var associationId = Number(this._getMiscData3()).valueOf();
		var association = this._source.application.getById(Ea.Connector._Base, associationId);
		if (!association)
			warn("Association no longer exists [id = " + associationId + "] for association class guid = " + this.getGuid());
		return association;
	}
},
{
	/**
	 * @type {Ea.Connector._Base}
	 * @derived
	 */
	_association: property()
});

Ea.Element.Interface = extend(Ea.Element.Classifier, {}, {
	eaType: "Interface"	
});

Ea.Element.BehavioredClassifier = extend(Ea.Element.Classifier);

Ea.Element.Actor = extend(Ea.Element.BehavioredClassifier, {}, {
	eaType: "Actor"
});

Ea.Element.UseCase = extend(Ea.Element.BehavioredClassifier, {},
{
	eaType: "UseCase",
	
	/**
	 * @type {Ea._Base.DataTypes.List}
	 */
	_extensionPoints: property({api: "ExtensionPoints"})
});

Ea.Element.Behavior = extend(Ea.Element.Class);

Ea.Element.Activity = extend(Ea.Element.Behavior, {}, {
	
	eaType: "Activity"
	
});

Ea.Element.Action = extend(Ea.Element._Base, {}, {
	eaType: "Action"
	
});
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

Ea.Element.State = extend(Ea.Element._Base, {}, {
	
	eaType: "State"
	
});

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
	
	/**
	 * @derived
	 */
	_kind: property()
	
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
}, {
	eaType: "Constraint"
});

/*
 * Custom types
 */

Ea.Element.Meaning = extend(Ea.Element.Class);

Ea.Element.Requirement = extend(Ea.Element._Base, {}, {
	
	eaType: "Requirement"
	
});

Ea.Element.Artifact = extend(Ea.Element._Base, {}, {
	
	eaType: "Artifact"
	
});

Ea.Element.Process = extend(Ea.Element.BehavioredClassifier); // TODO verify with BPMN specification

Ea.Element.Note = extend(Ea.Element._Base, {
	getNoted: function() {
		var string = this._getMiscData0();
		if (string == null) return null;
		// TODO: parse 'idref1=241181;idref2=241185;idref3=243101;' // ids of Connectors
	}
},
{
	eaType: "Note"
});

Ea.Element.ConnectorNote = extend(Ea.Element.Note);

Ea.Element.ConnectorConstraint = extend(Ea.Element.Note);

Ea.Element.Text = extend(Ea.Element._Base, {
	getDiagram: function() {
		var link = this._getMiscData0();
		if (link == null) return null;
		return this._source.application.getById(Ea.Diagram._Base, link);
	}
},
{
	eaType: "Text"
});

Ea.Element.Object = extend(Ea.Element._Base, {

	_toString: function() {
		var metaClass = this.getMetaClass();
		return this.getName() + " :" + (metaClass ? metaClass.getName() : "<<unknown class>>") + " [" + this._class  + "]";
	}
},
{
	eaType: "Object",
	
	/**
	 * @type {Ea.Element.Classifier}
	 */
	_metaClass: property({api: "ClassifierID", referenceBy: "id"}),
	
	/**
	 * @type {Ea._Base.DataTypes.RunState}
	 */
	_runState: property({api: "RunState"})
});

Ea.Element.Goal = extend(Ea.Element.Object);

include("Ea.TypedElement@Ea.Types.Abstract");

include("Ea.Attribute@Ea.Types.Element.Feature");
include("Ea.Method@Ea.Types.Element.Feature");

include("Ea.File@Ea.Types.Element");
include("Ea.Requirement@Ea.Types.Element");
include("Ea.Issue@Ea.Types.Element");

include("Ea.TaggedValue@Ea.Types.Element");
include("Ea.Properties@Ea.Types.Element.Property");
include("Ea.CustomProperty@Ea.Types.Element");

include("Ea.Constraint@Ea.Types.Element");
include("Ea.Transition@Ea.Types.Element");

include("Ea.Scenario@Ea.Types.Element.Scenario");
