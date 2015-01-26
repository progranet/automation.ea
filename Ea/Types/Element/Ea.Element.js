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

Ea.Element._Base = extend(Ea.Types.Namespace, {

	getNamespace: function() {
		return this.getParent() || this.getPackage();
	},
	
	setNamespace: function(namespace) {
		if (namespace.instanceOf(Ea.Package._Base)) {
			this.setPackage(namespace);
			this.setParent(null);
		}
		else if (namespace.instanceOf(Ea.Element._Base)) {
			this.setPackage(namespace.getPackage());
			this.setParent(namespace);
		}
		else {
			throw new Error("Illegal namespace type for Element: " + namespace);
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
			if (!relation || (typeof relation == "string" && relation == relationship.getRelation()) || (Core.Lang.isClass(relation) && relation.conformsTo(Ea.Connector._Base) && relationship.getConnector().instanceOf(relation))) {
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
	},
	
	hasStereotype: function(stereotype) {
		var stereotypes = this.getStereotypes();
		if (typeof stereotype == "string") {
			var has = false;
			stereotypes.forEach(function(s) {
				if (s.getName() == stereotype) {
					has = true;
					return true;
				}
			});
			return has;
		}
		return stereotypes.contains(stereotype);
	},
	
	getLinkedDocument: function() {
		return this._source.api.GetLinkedDocument();
	},
	
	saveLinkedDocument: function(path) {
		return this._source.api.SaveLinkedDocument(path);
	},
	
	loadLinkedDocument: function(path) {
		return this._source.api.LoadLinkedDocument(path);
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
	
	_deriveTypeName: function(source) {
		
		var api = source.api;
		var typeName = this.getProperty("_type").getApiValue(api).replace(/\s/g,"");
		var metaType = this.getProperty("_metatype").getApiValue(api);
		
		if (metaType)
			typeName = metaType;
		
		if (typeName == "Event") {
			
		}
		var subTypes = this._subTypes[typeName];
		if (subTypes)
			typeName = subTypes[this.getProperty("_subtype").getApiValue(api)] || typeName;
		
		// don't trust subtype == 17 - EA loses this information sometimes (when element becomes "composite" with subtype == 8)
		if (typeName == "Class") {
			var association = this.getProperty("_miscData3").getApiValue(api);
			if (association && association != 0)
				typeName = "AssociationClass";
		}
		
		return typeName;
	},
	
	/**
	 * Determines EA API Element type name on creating API object
	 * 
	 * @type {String}
	 */
	determineEaType: function() {
		return this.eaType;
	}
},
{

	/**
	 * Element id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	id: {api: "ElementID"},

	/**
	 * Element guid
	 * 
	 * @readOnly
	 */
	guid: {api: "ElementGUID"},
	
	/**
	 * Element alias
	 */
	alias: {api: "Alias"},
	
	/**
	 * Element notes
	 */
	notes: {api: "Notes"},
	
	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},

	/**
	 * Element parent element
	 * 
	 * @type {Ea.Element._Base}
	 */
	parent: {api: "ParentID", referenceBy: "id"},
	
	/**
	 * Element package
	 * 
	 * @type {Ea.Package._Base}
	 */
	package: {api: "PackageID", referenceBy: "id"},
	
	/**
	 * Element stereotype
	 */
	stereotype: {api: "Stereotype"},
	
	/**
	 * Element stereotype names list
	 * 
	 * @type {Ea._Base.DataTypes.List}
	 */
	stereotypesList: {api: "StereotypeEx"},

	/**
	 * Element stereotypes collection
	 * 
	 * @readOnly
	 * @derived
	 * @type {Core.Types.Collection<Ea._Base.AbstractStereotype>}
	 * @aggregation shared
	 */
	stereotypes: {},

	/**
	 * Element type
	 * 
	 * @private
	 */
	_type: {api: "Type"},
	
	/**
	 * Element subtype
	 * 
	 * @private
	 * @type {Number}
	 */
	_subtype: {api: "Subtype"},

	/**
	 * Element metatype
	 * 
	 * @private
	 * @readOnly
	 */
	_metatype: {api: "MetaType"},
	
	/**
	 * Element tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.TaggedValue._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	tags: {api: "TaggedValues"},
	
	/**
	 * Element custom properties collection
	 * 
	 * @type {Ea.Collection.Map<Ea.CustomProperty._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 * @single customProperty
	 */
	customProperties: {api: "CustomProperties"},
	
	/**
	 * Element properties collection
	 * 
	 * @type {Ea.Properties._Base<Ea.Property._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 * @single property
	 */
	properties: {api: "Properties"},
	
	/**
	 * Element constraints collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Constraint._Base>}
	 * @aggregation composite
	 */
	constraints: {api: "Constraints"},
	
	/**
	 * Element requirements collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Requirement._Base>}
	 * @aggregation composite
	 */
	requirements: {api: "Requirements"},
	
	/**
	 * Element issues collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Issue._Base>}
	 * @aggregation composite
	 */
	issues: {api: "Issues"},
	
	/**
	 * Element embedded elements collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 * @aggregation composite
	 */
	embeddedElements: {api: "EmbeddedElements"},
	
	/**
	 * Element transitions collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Transition._Base>}
	 * @aggregation composite
	 */
	transitions: {api: "StateTransitions"},
	
	/**
	 * Element status
	 */
	status: {api: "Status"},
	
	/**
	 * Element difficulty
	 */
	difficulty: {api: "Difficulty"},
	
	/**
	 * Element keywords
	 */
	keywords: {api: "Tag"},
	
	/**
	 * Element phase
	 */
	phase: {api: "Phase"},
	
	/**
	 * Element version
	 */
	version: {api: "Version"},
	
	/**
	 * Element visibility
	 */
	visibility: {api: "Visibility"},
	
	/**
	 * Element author
	 */
	author: {api: "Author"},
	
	/**
	 * Element creation date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	created: {api: "Created"},
	
	/**
	 * Element modification date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	modified: {api: "Modified"},
	
	/**
	 * Element complexity
	 * 
	 * @type {Number}
	 */
	complexity: {api: "Complexity"},
	
	/**
	 * Element multiplicity
	 */
	multiplicity: {api: "Multiplicity"},
	
	/**
	 * Element persistence
	 */
	persistence: {api: "Persistence"},
	
	/**
	 * Element priority
	 */
	priority: {api: "Priority"},
	
	/**
	 * Element relationships collection
	 * 
	 * @private
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea._Base.Relationship>}
	 */
	_relationships: {},
	
	/**
	 * Element owned elements collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 * @aggregation composite
	 */
	elements: {api: "Elements"},
	
	/**
	 * Element owned diagrams collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Diagram._Base>}
	 * @aggregation composite
	 */
	diagrams: {api: "Diagrams"},
	
	/**
	 * Element connectors collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Connector._Base>}
	 * @aggregation shared
	 */
	connectors: {api: "Connectors"},
	
	/**
	 * Element files collection
	 * 
	 * @type {Ea.Collection._Base<Ea.File._Base>}
	 * @aggregation composite
	 */
	files: {api: "Files"},
	
	/**
	 * Element classifier
	 * 
	 * @type {Ea.Element.Classifier}
	 */
	classifier: {api: "ClassifierID", referenceBy: "id"},

	/**
	 * Element extended style map
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_styleEx: {api: "StyleEx"},
	
	/**
	 * Element action flags map
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_actionFlags: {api: "ActionFlags"},
	
	/**
	 * Element event flags map
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_eventFlags: {api: "EventFlags"},

	/**
	 * Element miscellaneous data on index 0
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData0: {api: "MiscData", index: 0},
	
	/**
	 * Element miscellaneous data on index 1
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData1: {api: "MiscData", index: 1},
	
	/**
	 * Element miscellaneous data on index 2
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData2: {api: "MiscData", index: 2},
	
	/**
	 * Element miscellaneous data on index 3
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData3: {api: "MiscData", index: 3},
	
	/**
	 * Element miscellaneous data on index 4
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData4: {api: "MiscData", index: 4},

	/**
	 * Element position in tree model of project browser
	 * 
	 * @type {Number}
	 */
	position: {api: "TreePos"},

	/**
	 * Element composite diagram
	 * 
	 * @readOnly
	 * @type {Ea.Diagram._Base}
	 */
	compositeDiagram: {api: "CompositeDiagram"},
	
	/**
	 * Element linked diagram
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Diagram._Base}
	 */
	linkedDiagram: {},
	
	/**
	 * Element custom references collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea.Element._Base>}
	 */
	customReferences: {},
	
	/**
	 * Element context references collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea._Base.ContextReference>}
	 */
	contextReferences: {},
	
	/**
	 * Element appearance
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.DataTypes.Appearance}
	 */
	appearance: {}
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
	eaType: "Package" // see t_objecttypes table
},
{
	/**
	 * Element corresponding package
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Package._Base}
	 */
	package: {}
});

Ea.Element.Type = extend([Ea.Element.PackageableElement, Ea._Base.Type]);

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
}, {},
{
	/**
	 * Classifier abstract switch number value
	 * 
	 * @private
	 */
	_abstract: {api: "Abstract"},
	
	/**
	 * Classifier abstract switch value
	 * 
	 * @derived
	 * @type {Boolean}
	 */
	abstract: {},
	
	/**
	 * Classifier attributes collection
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.Attribute.Attribute>}
	 */
	_attributes: {api: "Attributes"},
	
	/**
	 * Classifier attributes collection.
	 * Collection is filtered by removing enumeration literals.
	 * 
	 * @derived
	 * @type {Core.Types.Collection<Ea.Attribute.Attribute>}
	 * @aggregation composite
	 */
	attributes: {},
	
	/**
	 * Classifier methods collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Method._Base>}
	 * @aggregation composite
	 */
	methods: {api: "Methods"}
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
	eaType: "Enumeration"
},
{
	/**
	 * Enumeration literals collection.
	 * Collection is derived from element attributes collection.
	 * 
	 * @derived
	 * @type {Core.Types.Collection<Ea.Attribute.EnumerationLiteral>}
	 * @aggregation composite
	 */
	literals: {}
});

Ea.Element.PrimitiveType = extend(Ea.Element.DataType);

Ea.Element.Class = extend(Ea.Element.Classifier, {}, {

	eaType: "Class"
	
});

Ea.Element.Metaclass = extend(Ea.Element.Class);

Ea.Element.AssociationClass = extend(Ea.Element.Class, {}, {},
{
	/**
	 * Corresponding association of association class
	 * 
	 * @readOnly
	 * @type {Ea.Connector._Base}
	 */
	association: {api: "MiscData", index: 3, referenceBy: "id"}
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
	eaType: "Constraint"
},
{	
	/**
	 * Constraint constrained elements map with ids as values
	 * 
	 * @readOnly
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_constrained: {api: "MiscData", index: 0},
	
	/**
	 * Constraint constrained elements collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea.Element._Base>}
	 */
	constrainedElements: {}
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
	eaType: "Object"
},
{	
	/**
	 * Instance specification type
	 * 
	 * @type {Ea.Element.Type}
	 */
	type: {api: "ClassifierID", referenceBy: "id"},
	
	/**
	 * Instance specification run state
	 * 
	 * @type {Ea._Base.DataTypes.ObjectMap}
	 * @key Variable
	 */
	runState: {api: "RunState"}
});


/*
 * Use cases
 */

/*
 * Scenarios are custom EA behavior specification.
 * Place where scenarios are specified in Element specialization hierarchy is dictated by pragmatic usage not by any formal specification
 */
Ea.Element._BehaviorScenario = extend(Ea.Types.Any, {

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
}, {},
{
	/**
	 * Element scenarios collection.
	 * Don't use it directly - it returns faked scenarios (not used in scenario extensions)!
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.Scenario._Base>}
	 */
	_scenarios: {api: "Scenarios"},
	
	/**
	 * Element basic scenario
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Scenario.BasicPath}
	 * @aggregation composite
	 */
	basicScenario: {},
	
	/**
	 * Element scenario extensions collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea.ScenarioExtension._Base>}
	 * @aggregation composite
	 */
	scenarioExtensions: {}
});

Ea.Element.BehavioredClassifier = extend([Ea.Element.Classifier, Ea.Element._BehaviorScenario]);

Ea.Element.Actor = extend(Ea.Element.BehavioredClassifier, {}, {
	eaType: "Actor"
});

Ea.Element.UseCase = extend(Ea.Element.BehavioredClassifier, {},
{
	eaType: "UseCase"
},
{	
	/**
	 * Use case extension points
	 * 
	 * @type {Ea._Base.DataTypes.List}
	 */
	extensionPoints: {api: "ExtensionPoints"}
});


/*
 * State machines
 */

Ea.Element.StateMachine = extend(Ea.Element._Base);

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
	}
},
{
	/**
	 * Pseudostate kind
	 * 
	 * @derived
	 */
	kind: {}
	
});


/*
 * Activities
 */

Ea.Element.Behavior = extend([Ea.Element.Class, Ea.Element._BehaviorScenario]);

Ea.Element.Activity = extend(Ea.Element.Behavior, {}, {
	eaType: "Activity"
});


/*
 * Actions
 */

Ea.Element.ActivityNode = extend(Ea.Element._Base);

Ea.Element.ActivityParameter = extend([Ea.Element._Base, Ea.Element.TypedElement], {
	
	_getClassifierByGuid: function() {
		return this._source.application.getRepository().getTypedElementType(this);
	},
	
	getType: function() {
		var type = this._getClassifier() || this.getClassifier() || this._getClassifierByGuid();
		return type;
	}
	
}, {},
{
	/**
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.Type}
	 */
	type: {},
	
	/**
	 * @private
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.Type}
	 */
	_classifierByGuid: {},
	
	/**
	 * @private
	 * @readOnly
	 * @type {Ea.Element._Base}
	 */
	_classifier: {api: "MiscData", index: 0, referenceBy: "guid"}

});

Ea.Element.ActivityPartition = extend(Ea.Element._Base);

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
}, {},
{

	/**
	 * Call behavior action called behavior
	 * 
	 * @type {Ea.Element.Behavior}
	 */
	behavior: {api: "ClassifierID", referenceBy: "id"}
});

Ea.Element.CallOperationAction = extend(Ea.Element.CallAction, {

	getOperation: function() {
		return this._source.application.getRepository().getElementRelatedClassifier(this, Ea.Method._Base);
	},
	
	_toString: function() {
		var operation = this.getOperation();
		return this.getName() + " :" + (operation ? operation.getName() : "<<undefined operation>>") + " [" + this._class  + "]";
	}
}, {},
{

	/**
	 * Call operation action called operation
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Method._Base}
	 */
	operation: {}
});

Ea.Element.ActionPin = extend([Ea.Element._Base, Ea.Element.TypedElement], {

	_getClassifierByGuid: function() {
		return this._source.application.getRepository().getTypedElementType(this);
	},
	
	getType: function() {
		var type = this._getClassifier() || this.getClassifier() || this._getClassifierByGuid();
		return type;
	}
	
}, {},
{
	/**
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.Type}
	 */
	type: {},
	
	/**
	 * @private
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.Type}
	 */
	_classifierByGuid: {},
	
	/**
	 * @private
	 * @readOnly
	 * @type {Ea.Element._Base}
	 */
	_classifier: {api: "MiscData", index: 0, referenceBy: "guid"}
	
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
	eaType: "Note"
},
{	
	/**
	 * Note noted elements map with ids as values
	 * 
	 * @private
	 * @readOnly
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_noted: {api: "MiscData", index: 0},
	
	/**
	 * Note noted elements collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea.Element._Base>}
	 */
	notedElements: {}
});

Ea.Element.ConnectorNote = extend(Ea.Element.Note);

Ea.Element.ConnectorConstraint = extend(Ea.Element.Note);

Ea.Element.Object = extend(Ea.Element.InstanceSpecification);

Ea.Element.Goal = extend(Ea.Element.Object);

Ea.Element.BusinessProcess = extend(Ea.Element.Activity);


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
