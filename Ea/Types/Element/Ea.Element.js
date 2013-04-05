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
	
	setParent: function(parent) {
		if (parent.instanceOf(Ea.Package._Base)) {
			this._setPackage(parent);
			this._setParent(null);
		}
		else if (parent.instanceOf(Ea.Element._Base)) {
			this._setPackage(parent._getPackage());
			this._setParent(parent);
		}
		else {
			throw new Error("Illegal parent type for Element: " + parent);
		}
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
	},
	
	getStereotypes: function() {
		return this._source.application.getRepository().getStereotypes(this);
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
	 * Element id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	_id: property({api: "ElementID"}),

	/**
	 * Element guid
	 * 
	 * @readOnly
	 */
	_guid: property({api: "ElementGUID"}),
	
	/**
	 * Element alias
	 */
	_alias: property({api: "Alias"}),
	
	/**
	 * Element notes
	 */
	_notes: property({api: "Notes"}),
	
	/**
	 * Element stereotype
	 */
	_stereotype: property({api: "Stereotype"}),
	
	/**
	 * Element stereotype names list
	 * 
	 * @type {Ea._Base.DataTypes.List}
	 */
	_stereotypesList: property({api: "StereotypeEx"}),

	/**
	 * Element stereotypes collection
	 * 
	 * @readOnly
	 * @derived
	 * @type {Core.Types.Collection<Ea._Base.AbstractStereotype>}
	 * @aggregation shared
	 */
	__stereotype: property(),

	/**
	 * Element type
	 * 
	 * @private
	 */
	__type: property({api: "Type"}),
	
	/**
	 * Element subtype
	 * 
	 * @private
	 * @type {Number}
	 */
	_subtype: property({api: "Subtype"}),

	/**
	 * Element metatype
	 * 
	 * @private
	 * @readOnly
	 */
	_metatype: property({api: "MetaType"}),
	
	/**
	 * Element tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.TaggedValue._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_tag: property({api: "TaggedValues"}),
	
	/**
	 * Element custom properties collection
	 * 
	 * @type {Ea.Collection.Map<Ea.CustomProperty._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_customProperty: property({api: "CustomProperties"}),
	
	/**
	 * Element properties collection
	 * 
	 * @type {Ea.Properties._Base<Ea.Property._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_property: property({api: "Properties"}),
	
	/**
	 * Element constraints collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Constraint._Base>}
	 * @aggregation composite
	 */
	_constraint: property({api: "Constraints"}),
	
	/**
	 * Element requirements collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Requirement._Base>}
	 * @aggregation composite
	 */
	_requirement: property({api: "Requirements"}),
	
	/**
	 * Element issues collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Issue._Base>}
	 * @aggregation composite
	 */
	_issue: property({api: "Issues"}),
	
	/**
	 * Element embedded elements collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 * @aggregation composite
	 */
	_embeddedElement: property({api: "EmbeddedElements"}),
	
	/**
	 * Element transitions collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Transition._Base>}
	 * @aggregation composite
	 */
	_transition: property({api: "StateTransitions"}),
	
	/**
	 * Element status
	 */
	_status: property({api: "Status"}),
	
	/**
	 * Element difficulty
	 */
	_difficulty: property({api: "Difficulty"}),
	
	/**
	 * Element keywords
	 */
	_keywords: property({api: "Tag"}),
	
	/**
	 * Element phase
	 */
	_phase: property({api: "Phase"}),
	
	/**
	 * Element version
	 */
	_version: property({api: "Version"}),
	
	/**
	 * Element visibility
	 */
	_visibility: property({api: "Visibility"}),
	
	/**
	 * Element author
	 */
	_author: property({api: "Author"}),
	
	/**
	 * Element creation date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_created: property({api: "Created"}),
	
	/**
	 * Element modification date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_modified: property({api: "Modified"}),
	
	/**
	 * Element complexity
	 * 
	 * @type {Number}
	 */
	_complexity: property({api: "Complexity"}),
	
	/**
	 * Element multiplicity
	 */
	_multiplicity: property({api: "Multiplicity"}),
	
	/**
	 * Element persistence
	 */
	_persistence: property({api: "Persistence"}),
	
	/**
	 * Element priority
	 */
	_priority: property({api: "Priority"}),
	
	/**
	 * Element relationships collection
	 * 
	 * @private
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea._Base.Relationship>}
	 */
	_relationship: property(),
	
	/**
	 * Element owned elements collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 * @aggregation composite
	 */
	_element: property({api: "Elements"}),
	
	/**
	 * Element owned diagrams collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Diagram._Base>}
	 * @aggregation composite
	 */
	_diagram: property({api: "Diagrams"}),
	
	/**
	 * Element connectors collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Connector._Base>}
	 * @aggregation shared
	 */
	_connector: property({api: "Connectors"}),
	
	/**
	 * Element files collection
	 * 
	 * @type {Ea.Collection._Base<Ea.File._Base>}
	 * @aggregation composite
	 */
	_file: property({api: "Files"}),
	
	/**
	 * Element parent
	 * 
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	_parent: property(),

	/**
	 * Element parent element
	 * 
	 * @private
	 * @type {Ea.Element._Base}
	 */
	__parent: property({api: "ParentID", referenceBy: "id"}),
	
	/**
	 * Element parent package
	 * 
	 * @private
	 * @type {Ea.Package._Base}
	 */
	__package: property({api: "PackageID", referenceBy: "id"}),
	
	/**
	 * Element classifier
	 * 
	 * @type {Ea.Element.Classifier}
	 */
	_classifier: property({api: "ClassifierID", referenceBy: "id"}),

	/**
	 * Element extended style map
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	__styleEx: property({api: "StyleEx"}),
	
	/**
	 * Element action flags map
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	__actionFlags: property({api: "ActionFlags"}),
	
	/**
	 * Element event flags map
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	__eventFlags: property({api: "EventFlags"}),

	/**
	 * Element miscellaneous data on index 0
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData0: property({api: "MiscData", index: 0}),
	
	/**
	 * Element miscellaneous data on index 1
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData1: property({api: "MiscData", index: 1}),
	
	/**
	 * Element miscellaneous data on index 2
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData2: property({api: "MiscData", index: 2}),
	
	/**
	 * Element miscellaneous data on index 3
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData3: property({api: "MiscData", index: 3}),
	
	/**
	 * Element miscellaneous data on index 4
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData4: property({api: "MiscData", index: 4}),

	/**
	 * Element position in tree model of project browser
	 * 
	 * @type {Number}
	 */
	_position: property({api: "TreePos"}),

	/**
	 * Element composite diagram
	 * 
	 * @readOnly
	 * @type {Ea.Diagram._Base}
	 */
	_compositeDiagram: property({api: "CompositeDiagram"}),
	
	/**
	 * Element linked diagram
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Diagram._Base}
	 */
	_linkedDiagram: property(),
	
	/**
	 * Element custom references collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea.Element._Base>}
	 */
	_customReference: property(),
	
	/**
	 * Element context references collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea._Base.ContextReference>}
	 */
	_contextReference: property(),
	
	/**
	 * Element appearance
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.DataTypes.Appearance}
	 */
	_appearance: property()
});


/*
 * Classes
 */

Ea.Element.PackageableElement = extend(Ea.Element._Base);

Ea.Element.Package = extend(Ea.Element.PackageableElement, {
	getPackage: function() {
		return this._source.application.getByGuid(Ea.Package._Base, this.getGuid());
	}
},
{
	eaType: "Package", // see t_objecttypes table
	
	/**
	 * Element corresponding package
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Package._Base}
	 */
	_package: property()
});

Ea.Element.Type = extend(Ea.Element.PackageableElement);

Ea.Element.Classifier = extend(Ea.Element.Type, {

	isAbstract: function() {
		return this._getAbstract() == 1;
	},
	
	setAbstract: function(_abstract) {
		this._setAbstract(_abstract ? 1 : 0);
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
	 * Classifier abstract switch number value
	 * 
	 * @private
	 */
	__abstract: property({api: "Abstract"}),
	
	/**
	 * Classifier abstract switch value
	 * 
	 * @derived
	 * @type {Boolean}
	 */
	_abstract: property(),
	
	/**
	 * Classifier attributes collection
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.Attribute.Attribute>}
	 */
	__attribute: property({api: "Attributes"}),
	
	/**
	 * Classifier attributes collection.
	 * Collection is filtered by removing enumeration literals.
	 * 
	 * @derived
	 * @type {Core.Types.Collection<Ea.Attribute.Attribute>}
	 * @aggregation composite
	 */
	_attribute: property(),
	
	/**
	 * Classifier methods collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Method._Base>}
	 * @aggregation composite
	 */
	_method: property({api: "Methods"})
});

Ea.Element.DataType = extend(Ea.Element.Classifier);

Ea.Element.Enumeration = extend(Ea.Element.DataType, {
	
	getLiterals: function(filter) {
		var literals = this._getAttributes().filter("this.getStereotype() == 'enum'");
		return literals.filter(filter);
	},
	
	createLiteral: function(name, type) {
		var literal = this._createAttribute(name, type);
		literal.setStereotype("enum");
		return literal;
	},
	
	deleteLiteral: function(literal) {
		this._deleteAttribute(literal);
	}
	
},
{
	eaType: "Enumeration",

	/**
	 * Enumeration literals collection.
	 * Collection is derived from element attributes collection.
	 * 
	 * @derived
	 * @type {Core.Types.Collection<Ea.Attribute.EnumerationLiteral>}
	 * @aggregation composite
	 */
	_literal: property()
});

Ea.Element.PrimitiveType = extend(Ea.Element.DataType);

Ea.Element.Class = extend(Ea.Element.Classifier, {}, {

	eaType: "Class"
	
});

Ea.Element.Metaclass = extend(Ea.Element.Class);

Ea.Element.AssociationClass = extend(Ea.Element.Class, {},
{
	/**
	 * Corresponding association of association class
	 * 
	 * @readOnly
	 * @type {Ea.Connector._Base}
	 */
	_association: property({api: "MiscData", index: 3, referenceBy: "id"})
});

Ea.Element.Interface = extend(Ea.Element.Classifier, {}, {
	eaType: "Interface"	
});

Ea.Element.Constraint = extend(Ea.Element.PackageableElement, {
	getConstrainedElements: function() {
		var map = this._getConstrained().getMap();
		var constrained = new Core.Types.Collection();
		for (var key in map) {
			constrained.add(this._source.application.getById(map[key]));
		}
		return constrained;
		// TODO: parse 'idref1=264627;idref2=264626;'
	}
},
{
	eaType: "Constraint",
	
	/**
	 * Constraint constrained elements map with ids as values
	 * 
	 * @readOnly
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	__constrained: property({api: "MiscData", index: 0}),
	
	/**
	 * Constraint constrained elements collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea.Element._Base>}
	 */
	_constrainedElement: property()
});

Ea.Element.TypedElement = extend(Ea.Types.Any, {
	
	/**
	 * Returns type of typed element
	 * 
	 * @type {Core.Types.Object}
	 */
	getType: function() {
		throw new Error("Abstract method");
	}
});

Ea.Element.InstanceSpecification = extend([Ea.Element.PackageableElement, Ea.Element.TypedElement], {

	_toString: function() {
		var type = this.getType();
		return this.getName() + " :" + (type ? type.getName() : "<<anonymous class>>") + " [" + this._class  + "]";
	}
},
{
	eaType: "Object",
	
	/**
	 * Instance specification type
	 * 
	 * @type {Ea.Element.Type}
	 */
	_type: property({api: "ClassifierID", referenceBy: "id"}),
	
	/**
	 * Instance specification run state
	 * 
	 * @type {Ea._Base.DataTypes.ObjectMap}
	 * @key Variable
	 */
	_runState: property({api: "RunState"})
});


/*
 * Use cases
 */

/*
 * Scenarios are custom EA behavior specification.
 * Place where scenarios are specified in Element specialization hierarchy is dictated by pragmatic usage not by any formal specification
 */
Ea.Element._ScenarioBehavior = extend(Ea.Types.Any, {

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
	}	
},
{
	/**
	 * Element scenarios collection.
	 * Don't use it directly - it returns faked scenarios (not used in scenario extensions)!
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.Scenario._Base>}
	 */
	__scenario: property({api: "Scenarios"}),
	
	/**
	 * Element basic scenario
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Scenario.BasicPath}
	 * @aggregation composite
	 */
	_basicScenario: property(),
	
	/**
	 * Element scenario extensions collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea.ScenarioExtension._Base>}
	 * @aggregation composite
	 */
	_scenarioExtension: property()
});

Ea.Element.BehavioredClassifier = extend([Ea.Element.Classifier, Ea.Element._ScenarioBehavior]);

Ea.Element.Actor = extend(Ea.Element.BehavioredClassifier, {}, {
	eaType: "Actor"
});

Ea.Element.UseCase = extend(Ea.Element.BehavioredClassifier, {},
{
	eaType: "UseCase",
	
	/**
	 * Use case extension points
	 * 
	 * @type {Ea._Base.DataTypes.List}
	 */
	_extensionPoints: property({api: "ExtensionPoints"})
});


/*
 * State machines
 */

Ea.Element.State = extend(Ea.Element._Base, {}, {
	eaType: "State"
});

Ea.Element.FinalState = extend(Ea.Element.State);

Ea.Element.Pseudostate = extend(Ea.Element._Base, {
	
	getKind: function() {
		return Ea.Element.Pseudostate.Kind[this._getSubtype()];
	},
	
	setKind: function(kind) {
		for (var i in Ea.Element.Pseudostate.Kind) {
			if (Ea.Element.Pseudostate.Kind[i] == kind)
				return this._setSubtype(i);
		}
		throw new Error("Unknown kind: " + kind + " for Pseudostate: " + this);
	}
	
},
{
	
	Kind: {
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
	 * Pseudostate kind
	 * 
	 * @derived
	 */
	_kind: property()
	
});


/*
 * Activities
 */

Ea.Element.Behavior = extend([Ea.Element.Class, Ea.Element._ScenarioBehavior]);

Ea.Element.Activity = extend(Ea.Element.Behavior, {}, {
	eaType: "Activity"
});


/*
 * Actions
 */

Ea.Element.ActivityNode = extend(Ea.Element._Base);

Ea.Element.Action = extend(Ea.Element.ActivityNode, {}, {
	eaType: "Action"
});

Ea.Element.AcceptEventAction = extend(Ea.Element.Action);

Ea.Element.InvocationAction = extend(Ea.Element.Action);

Ea.Element.SendSignalAction = extend(Ea.Element.InvocationAction);

Ea.Element.CallAction = extend(Ea.Element.Action);

Ea.Element.CallBehaviorAction = extend(Ea.Element.CallAction, {
	_toString: function() {
		var behavior = this.getBehavior();
		return this.getName() + " :" + (behavior ? behavior.getName() : "<<undefined behavior>>") + " [" + this._class  + "]";
	}
},
{

	/**
	 * Call behavior action called behavior
	 * 
	 * @type {Ea.Element.Behavior}
	 */
	_behavior: property({api: "ClassifierID", referenceBy: "id"})
});

Ea.Element.CallOperationAction = extend(Ea.Element.CallAction, {

	getOperation: function() {
		return this._source.application.getRepository().getElementRelatedClassifier(this, Ea.Method._Base);
	},
	
	_toString: function() {
		var operation = this.getOperation();
		return this.getName() + " :" + (operation ? operation.getName() : "<<undefined operation>>") + " [" + this._class  + "]";
	}
},
{

	/**
	 * Call operation action called operation
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Method._Base}
	 */
	_operation: property()
});

Ea.Element.ActionPin = extend([Ea.Element._Base, Ea.Element.TypedElement], {

	_getClassifierByGuid: function() {
		return this._source.application.getRepository().getTypedElementType(this);
	},
	
	getType: function() {
		var type = this._getClassifier() || this.getClassifier() || this._getClassifierByGuid();
		return type;
	}
	
},
{
	/**
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Object}
	 */
	_type: property(),
	
	/**
	 * @private
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Object}
	 */
	__classifierByGuid: property(),
	
	/**
	 * @private
	 * @readOnly
	 * @type {Ea.Element._Base}
	 */
	__classifier: property({api: "MiscData", index: 0, referenceBy: "guid"})
	
});



Ea.Element.ControlNode = extend(Ea.Element.ActivityNode);

Ea.Element.InitialNode = extend(Ea.Element.ControlNode);

Ea.Element.FinalNode = extend(Ea.Element.ControlNode);

Ea.Element.ActivityFinalNode = extend(Ea.Element.FinalNode);

Ea.Element.FlowFinalNode = extend(Ea.Element.FinalNode);


/*
 * Deployments
 */

Ea.Element.Artifact = extend(Ea.Element._Base, {}, {
	eaType: "Artifact"
});


/*
 * Custom Enterprise Architect types
 */

Ea.Element.Meaning = extend(Ea.Element.Class);

Ea.Element.Requirement = extend(Ea.Element._Base, {}, {
	eaType: "Requirement"
});

Ea.Element.Process = extend(Ea.Element.BehavioredClassifier); // TODO verify with BPMN specification

Ea.Element.Note = extend(Ea.Element._Base, {
	getNotedElements: function() {
		var map = this._getNoted().getMap();
		var noted = new Core.Types.Collection();
		for (var key in map) {
			noted.add(this._source.application.getById(map[key]));
		}
		return noted;
	}
},
{
	eaType: "Note",
	
	/**
	 * Note noted elements map with ids as values
	 * 
	 * @readOnly
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	__noted: property({api: "MiscData", index: 0}),
	
	/**
	 * Note noted elements collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea.Element._Base>}
	 */
	_notedElement: property()
});

Ea.Element.ConnectorNote = extend(Ea.Element.Note);

Ea.Element.ConnectorConstraint = extend(Ea.Element.Note);

Ea.Element.Object = extend(Ea.Element.InstanceSpecification);

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
