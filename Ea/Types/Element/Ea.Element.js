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

Ea.Element._Base = extend(Ea.Namespace, {
	
	_properties: null,
	getProperties: function() {
		if (!this._properties || Ea.mm) {
			this._connectorsParse();
		}
		return this._properties;
	},
	
	isAbstract: function() {
		return this._getAbstract() == 1;
	},
	
	getLinkedDiagram: function() {
		var id = this._getMiscData0();
		if (!id || !(id = (new Number(id)).valueOf())) return null;
		return Ea.getById(Ea.Diagram._Base, id);
	},
	
	getRelatedProperties: function(relation, filter) {
		var relations = new Core.Types.Collection();
		this.getProperties().forEach(function(property) {
			if (!relation || (typeof relation == "string" && relation == property.getRelation()) || (relation.isClass && relation.isSubclassOf(Ea.Connector._Base) && property.getConnector().instanceOf(relation))) {
				var related = property.getType();
				if (related.match(filter))
					relations.add(property);
			}
		});
		return relations;
	},
	
	getRelated: function(relation, filter) {
		var relations = new Core.Types.Collection();
		this.getRelatedProperties(relation, filter).forEach(function(property) {
			relations.add(property.getType());
		});
		return relations;
	},
	
	_connectorsParsed: false,
	_connectorsParse: function() {
		if (!this._connectorsParsed || Ea.mm) {
			this._properties = new Core.Types.Collection();
			var thisEnd = this;
			this.getConnectors().forEach(function(connector) {
				var client = (connector.getClient() == thisEnd);
				var thisConnectorEnd = !client ? connector.getSupplierEnd() : connector.getClientEnd();
				var secondEnd = client ? connector.getSupplier() : connector.getClient();
				var secondConnectorEnd = client ? connector.getSupplierEnd() : connector.getClientEnd();
				if (secondEnd) {
					// EA integrity problem (Connector.Supplier == null) workaround
					thisEnd._properties.add(new Ea.Element.Property({
						parent: thisEnd,
						parentEnd: thisConnectorEnd,
						connector: connector,
						client: client,
						type: secondEnd,
						typeEnd: secondConnectorEnd
					}));		
				}
			});
		}
		this._connectorsParsed = true;
	},
	
	getParent: function() {
		return this._getParent() || this._getPackage();
	},
	
	_customReferences: null,
	getCustomReferences: function() {
		if (!this._customReferences || Ea.mm) {
			this._customReferences = Ea.Application.getRepository().getCustomReferences(this);
		}
		return this._customReferences;
	},
	
	findDiagrams: function() {
		return Ea.Application.getRepository().getByQuery(Ea.Diagram._Base, "t_diagramobjects", "Object_ID", this.getId(), "Diagram_ID");
	}
},
{
	api: "Element",
	
	_subTypes: {
		Class: {
			17: "AssociationClass"
		},
		Event: {
			0: "Reciever",
			1: "Sender"
		},
		Note: {
			1: "ConnectorNote",
			2: "ConnectorConstraint"
		},
		Pseudostate: {
			100: "ActivityInitial",
			101: "ActivityFinal"
		}		
	},
	
	getType: function(source) {
		var typeName = this._metatype.get(source) || this._type.get(source).replace(/\s/g,"");
		if (this._subTypes[typeName]) {
			typeName = this._subTypes[typeName][this._subtype.get(source)] || typeName;
		}
		var type = this.namespace[typeName];
		if (!type) {
			throw new Error("Not implemented Ea.Element." + typeName + " type");
		}
		return type;
	},
	
	_id: new Ea.Helper.Property({api: "ElementID", type: Number}),
	_guid: new Ea.Helper.Property({api: "ElementGUID"}),
	
	__abstract: new Ea.Helper.Property({api: "Abstract", private: true}),
	_taggedValues: new Ea.Helper.CollectionMap({api: "TaggedValues", elementType: "Ea.TaggedValue._Base", key: "this.getName()", value: "this.getValue()"}),
	_customProperties: new Ea.Helper.CollectionMap({api: "CustomProperties", elementType: "Ea.CustomProperty._Base", key: "this.getName()", value: "this.getValue()"}),
	_specializedProperties: new Ea.Helper.Collection({type: "Ea.Properties._Base", api: "Properties", elementType: "Ea.Property._Base"}),
	_constraints: new Ea.Helper.Collection({api: "Constraints", elementType: "Ea.Constraint._Base"}),
	
	_type: new Ea.Helper.Property({api: "Type", private: true}),
	_subtype: new Ea.Helper.Property({api: "Subtype", type: Number}),
	_metatype: new Ea.Helper.Property({api: "MetaType"}),
	
	_status: new Ea.Helper.Property({api: "Status"}),
	_keywords: new Ea.Helper.Property({api: "Tag"}),
	_phase: new Ea.Helper.Property({api: "Phase"}),
	_version: new Ea.Helper.Property({api: "Version"}),
	_author: new Ea.Helper.Property({api: "Author"}),
	_created: new Ea.Helper.Property({api: "Created", type: Core.Types.Date}),
	_modified: new Ea.Helper.Property({api: "Modified", type: Core.Types.Date}),
	
	_elements: new Ea.Helper.Collection({api: "Elements"}),
	_diagrams: new Ea.Helper.Collection({api: "Diagrams", elementType: "Ea.Diagram._Base"}),
	_stereotypes: new Ea.Helper.List({api: "StereotypeEx"}), // TODO
	_connectors: new Ea.Helper.Collection({api: "Connectors", elementType: "Ea.Connector._Base"}),
	_files: new Ea.Helper.Collection({api: "Files", elementType: "Ea.File._Base"}),
	_parent: new Ea.Helper.ReferenceById({api: "ParentID", type: "Ea.Element._Base", private: true}),
	_package: new Ea.Helper.ReferenceById({api: "PackageID", type: "Ea.Package._Base", private: true}),
	_miscData0: new Ea.Helper.Property({api: "MiscData", private: true, index: 0}),
	_miscData1: new Ea.Helper.Property({api: "MiscData", private: true, index: 1}),
	_miscData2: new Ea.Helper.Property({api: "MiscData", private: true, index: 2}),
	_miscData3: new Ea.Helper.Property({api: "MiscData", private: true, index: 3}),
	
	_abstract: new Ea.Helper.CustomProperty({get: "isAbstract", type: Boolean}),
	_inDiagrams: new Ea.Helper.CustomProperty({get: "findDiagrams", type: "Core.Types.Collection", elementType: "Ea.Diagram._Base"}),
	_linkedDiagram: new Ea.Helper.CustomProperty({get: "getLinkedDiagram", type: "Ea.Diagram._Base"}),
	_customReferences: new Ea.Helper.CustomProperty({get: "getCustomReferences", type: "Core.Types.Collection", elementType: "Ea.Element._Base"})
});

Ea.Element.CustomReference = define({
	_notes: null,
	_supplier: null,
	
	create: function(notes, supplier) {
		_super.create(params);
		this._notes = notes;
		this._supplier = supplier;
	},
	
	getNotes: function() {
		return this._notes;
	},
	
	getSupplier: function() {
		return this._supplier;
	}
});

Ea.Element.Property = define({
	
	_connector: null,
	_client: null,
	_targetEnd: null,
	_thisEnd: null,
	_role: null,
	_type: null,
	_typeEnd: null,
	_typeAttribute: null,
	_typeMethod: null,
	_relation: null,
	_parent: null,
	_parentEnd: null,
	_parentAttribute: null,
	_parentMethod: null,
	_opposite: null,
	_guard: null,
	
	create: function(params) {
		_super.create(params);
		this._connector = params.connector;
		this._guard = params.connector.getGuard();
		this._client = params.client;
		var targetEnd = this._targetEnd = params.client ? params.connector.getSupplierEnd() : params.connector.getClientEnd();
		//var thisEnd = this._thisEnd = !params.client ? params.connector.getSupplierEnd() : params.connector.getClientEnd();
		//info("$,$", [params.client, params.connector.getClientEnd()]);
		this._role = targetEnd.Role;
		this._type = params.type;
		this._typeAttribute = !params.client ? params.connector.getSupplierAttribute() : params.connector.getClientAttribute();
		this._typeMethod = !params.client ? params.connector.getSupplierMethod() : params.connector.getClientMethod();
		this._typeEnd = params.typeEnd;
		this._relation = params.connector.getRelation(!params.client);
		this._parent = params.parent;
		this._parentEnd = params.parentEnd;
		this._parentAttribute = params.client ? params.connector.getSupplierAttribute() : params.connector.getClientAttribute();
		this._parentMethod = params.client ? params.connector.getSupplierMethod() : params.connector.getClientMethod();
		this._opposite = params.opposite || new Ea.Element.Property({
			parent: params.type, 
			parentEnd: params.typeEnd,
			connector: params.connector, 
			client: !params.client, 
			type: params.parent, 
			typeEnd: params.parentEnd,
			opposite: this
		});
	},
	
	getParent: function() {
		return this._parent;
	},
	
	getParentEnd: function() {
		return this._parentEnd;
	},
	
	getParentAttribute: function() {
		return this._parentAttribute;
	},
	
	getParentMethod: function() {
		return this._parentMethod;
	},
	
	getName: function() {
		return this._role || this._type.getName().toLowerCase();
	},
	
	getType: function() {
		return this._type;
	},
	
	getTypeEnd: function() {
		return this._typeEnd;
	},
	
	getTypeAttribute: function() {
		return this._typeAttribute;
	},
	
	getTypeMethod: function() {
		return this._typeMethod;
	},
	
	getRelation: function() {
		return this._relation;
	},
	
	getConnector: function() {
		return this._connector;
	},
	
	isAggregation: function() {
		return this._thisEnd.Aggregation != 0;
	},
	
	getAggregation: function() {
		return this._thisEnd.Aggregation;
	},
	
	getMultiplicity: function() {
		return this._targetEnd.Cardinality;
	},
	
	setMultiplicity: function(multiplicity) {
		this._targetEnd.Cardinality = multiplicity;
		this._targetEnd.Update();
	},
	
	isNavigable: function() {
		return this._targetEnd.Navigable != "Non-Navigable";
	},
	
	getNavigability: function() {
		return this._targetEnd.Navigable;
	},
	
	setNavigable: function() {
		this._targetEnd.Navigable = "Navigable";
		this._targetEnd.Update();
	},
	
	setNonNavigable: function() {
		this._targetEnd.Navigable = "Non-Navigable";
		this._targetEnd.Update();
	},
	
	getOpposite: function() {
		return this._opposite;
	},
	
	isClient: function() {
		return this._client;
	},
	
	getGuard: function() {
		return this._guard;
	},
	
	_toString: function() {
		return this.getName() + " :" + this.getType() + " [" + this._class + "]";
	}
});

Ea.Element.Property.Aggregation = {
	shared: 1,
	composite: 2
};

Ea.Element.Object = extend(Ea.Element._Base, {

	_runState: null,
	getRunState: function() {
		if (!this._runState || Ea.mm) {
			var rss = this._getRunState();
			var rst = rss.split("@ENDVAR;");
			this._runState = {};
			for (var rsi = 0; rsi < rst.length; rsi++) {
				var rs = rst[rsi];
				if (rs.length > 0) {
					rs = rs.substring(4).replace(/"/g, "'");
					rs = rs.substring(0, rs.length - 1) + "\"";
					rs = rs.replace(/;([^=]+)=/g, function($0, $1) {
						return "\", " + $1.substring(0, 1).toLowerCase() + $1.substring(1) + ": \"";
					});
					rs = rs.substring(3).replace(/\n/g, "\\n").replace(/\r/g, "\\r");
					eval("var rsot = {" + rs + "}");
					this._runState[rsot.variable] = rsot;
				}
			}
		}
		return this._runState;
	},
	
	_toString: function() {
		return this.getName() + " :" + this.getMetaClass().getName() + " [" + this._class  + "]";
	}
},
{
	_metaClass: new Ea.Helper.ReferenceById({api: "ClassifierID", type: "Ea.Element.Classifier"}),
	_runState: new Ea.Helper.Property({api: "RunState", private: true}),
	
	runState: new Ea.Helper.CustomProperty({get: "getRunState", type: Object})
});

Ea.Element.Package = extend(Ea.Element._Base, {
	getPackage: function() {
		return Ea.getByGuid(Ea.Package._Base, this.getGuid());
	}
},
{
	_package: new Ea.Helper.CustomProperty({get: "getPackage", type: "Ea.Package._Base"})
});

Ea.Element.Screen = extend(Ea.Element._Base);

Ea.Element.GUIElement = extend(Ea.Element._Base);

Ea.Element.Component = extend(Ea.Element._Base);

Ea.Element.Type = extend(Ea.Element._Base);
	
Ea.Element.Classifier = extend(Ea.Element.Type, {},
{
	_attributes: new Ea.Helper.Collection({api: "Attributes", elementType: "Ea.Attribute.Attribute"}),
	_operations: new Ea.Helper.Collection({api: "Methods", elementType: "Ea.Method._Base"})
});

Ea.Element.Class = extend(Ea.Element.Classifier);

Ea.Element.Metaclass = extend(Ea.Element.Class);

Ea.Element.AssociationClass = extend(Ea.Element.Class, {
	getAssociation: function() {
		return Ea.getById(Ea.Connector._Base, Number(this._getMiscData3()).valueOf());
	}
},
{
	association: new Ea.Helper.CustomProperty({get: "getAssociation", type: "Ea.Connector._Base"})
});

Ea.Element.Interface = extend(Ea.Element.Classifier);

Ea.Element.DataType = extend(Ea.Element.Type);

Ea.Element.Enumeration = extend(Ea.Element.DataType, {},
{
	_literals: new Ea.Helper.Collection({api: "Attributes", elementType: "Ea.Attribute.EnumerationLiteral"})
});

Ea.Element.PrimitiveType = extend(Ea.Element.DataType);

Ea.Element.Requirement = extend(Ea.Element._Base);

Ea.Element.Pseudostate = extend(Ea.Element._Base);

Ea.Element.Activity = extend(Ea.Element._Base);

Ea.Element.ActivityInitial = extend(Ea.Element.Pseudostate);

Ea.Element.ActivityFinal = extend(Ea.Element.Pseudostate);

Ea.Element.ActivityPartition = extend(Ea.Element._Base);

Ea.Element.Action = extend(Ea.Element._Base);

Ea.Element.StateMachine = extend(Ea.Element._Base);

Ea.Element.Actor = extend(Ea.Element._Base);

Ea.Element.Boundary = extend(Ea.Element._Base);

Ea.Element.DecisionNode = extend(Ea.Element._Base);

Ea.Element.MergeNode = extend(Ea.Element._Base);

Ea.Element.LoopNode = extend(Ea.Element._Base);

Ea.Element.Note = extend(Ea.Element._Base, {
	getNoted: function() {
		var string = this._getMiscData0();
		if (string == null) return null;
		// TODO: parse 'idref1=241181;idref2=241185;idref3=243101;'
	}
});

Ea.Element.ConnectorNote = extend(Ea.Element.Note);

Ea.Element.ExpansionRegion = extend(Ea.Element._Base);

Ea.Element.Synchronization = extend(Ea.Element._Base);

Ea.Element.UMLDiagram = extend(Ea.Element._Base);

Ea.Element.ActionPin = extend(Ea.Element._Base);

Ea.Element.Text = extend(Ea.Element._Base, {
	getDiagram: function() {
		var link = this._getMiscData0();
		if (link == null) return null;
		return Ea.getById(Ea.Diagram._Base, link);
	}
});

Ea.Element.Rule = extend(Ea.Element._Base);

Ea.Element.Event = extend(Ea.Element._Base);

Ea.Element.Reciever = extend(Ea.Element.Event);

Ea.Element.Sender = extend(Ea.Element.Event);

Ea.Element.InterruptibleActivityRegion = extend(Ea.Element._Base);

Ea.Element.DataStore = extend(Ea.Element._Base);

Ea.Element.Message = extend(Ea.Element._Base);

Ea.Element.Constraint = extend(Ea.Element._Base, {
	getConstrainted: function() {
		var string = this.getMiscData0();
		if (string == null) return null;
		// TODO: parse 'idref1=264627;idref2=264626;'
	}
});

Ea.Element.State = extend(Ea.Element._Base);

Ea.Element.InitialState = extend(Ea.Element.State);

Ea.Element.FinalState = extend(Ea.Element.State);

Ea.Element.Process = extend(Ea.Element._Base);

Ea.Element.Goal = extend(Ea.Element.Object);

Ea.Element.ActivityParameter = extend(Ea.Element._Base);

Ea.Element.InformationItem = extend(Ea.Element._Base);

Ea.Element.Device = extend(Ea.Element._Base);

Ea.Element.Server = extend(Ea.Element.Device);

Ea.Element.Meaning = extend(Ea.Element.Class);

Ea.Element.Node = extend(Ea.Element._Base); // deployment

Ea.Element.Artifact = extend(Ea.Element._Base);

Ea.Element.DeploymentSpecification = extend(Ea.Element._Base);

Ea.Element.InteractionFragment = extend(Ea.Element._Base);

Ea.Element.InteractionOccurrence = extend(Ea.Element._Base);

Ea.Element.MessageEndpoint = extend(Ea.Element._Base);

Ea.Element.MessageEnd = extend(Ea.Element.MessageEndpoint);

Ea.Element.Gate = extend(Ea.Element.MessageEndpoint);

Ea.Element.Sequence = extend(Ea.Element._Base);

Ea.Element.ProvidedInterface = extend(Ea.Element._Base);

Ea.Element.CallBehaviorAction = extend(Ea.Element.Action, {
	_toString: function() {
		var classifier = this.getClassifier();
		return this.getName() + " :" + (classifier ? classifier.getName() : "<<undefined reference>>") + " [" + this._class  + "]";
	}
}, {
	_classifier: new Ea.Helper.ReferenceById({api: "ClassifierID", type: "Ea.Element.Classifier"})
});

Ea.Element.CallOperationAction = extend(Ea.Element.Action, {
	_toString: function() {
		var classifier = this.getClassifier();
		return this.getName() + " :" + (classifier ? classifier.getName() : "<<undefined reference>>") + " [" + this._class  + "]";
	}
},
{
	_classifier: new Ea.Helper.ReferenceById({api: "ClassifierID", type: "Ea.Element.Classifier"})
});

Ea.Element.UseCase = extend(Ea.Element._Base, {
	
	_contextReferences: null,
	getContextReferences: function() {
		if (!this._contextReferences || Ea.mm) {
			this._contextReferences = new Core.Types.Collection();
			this.getCustomReferences().forEach(function(reference) {
				this._contextReferences.add(new Ea.Element.ContextReference(reference.getNotes() || "", reference.getSupplier(), ""));
			});
			this.getProperties().forEach(function(property) {
				var connection = property.getConnector()._class.getName();
				var supplier = property.getType();
				var notes = property.getConnector().getName();
				this._contextReferences.add(new Ea.Element.ContextReference(notes, supplier, connection));
			});
		}
		return this._contextReferences;
	},

	getExtensionPoints: function() {
		var string = this._getMiscData0();
		if (string == null) return null;
		// TODO: parse '#EXP#=Po zakoñczeniu opracowywania publikacji;#EXP#=Przy wyborze publikacji do opracowywania;'
	},
	
	getBasicScenario: function() {
		var basic = this.getScenarios(Ea.Scenario.BasicPath);
		if (basic.isEmpty())
			return null;
		if (basic.size == 1)
			return basic.first();
		throw new Error("More than 1 basic scenarios");
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
	_scenarios: new Ea.Helper.Collection({api: "Scenarios", elementType: "Ea.Scenario._Base"}),
	_basicScenario: new Ea.Helper.CustomProperty({type: "Ea.Scenario.BasicPath", get: "getBasicScenario"}),
	_scenarioExtensions: new Ea.Helper.CustomProperty({type: "Core.Types.Collection", elementType: "Ea.ScenarioExtension._Base", get: "getScenarioExtensions"}),
	_complexity: new Ea.Helper.Property({api: "Complexity", type: Number})
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

Ea.Element.TestSet = extend(Ea.Element.UseCase); 

Ea.Element.ExecutionEnvironment = extend(Ea.Element._Base); 

Ea.Element.RequiredInterface = extend(Ea.Element._Base); 

Ea.Element.Port = extend(Ea.Element._Base); 

Ea.Element.WebPage = extend(Ea.Element._Base); 

Ea.Element.ESB_Service = extend(Ea.Element._Base); 

Ea.Element.Abstract = extend(Ea.Element._Base); 

Ea.Element.Operation = extend(Ea.Element._Base); 

Ea.Element.Feature = extend(Ea.Element._Base); 

Ea.Element.DataObject = extend(Ea.Element._Base); 

Ea.Element.CentralBufferNode = extend(Ea.Element._Base);	

Ea.Element.BusinessProcess = extend(Ea.Element._Base); 
Ea.Element.Gateway = extend(Ea.Element._Base); 
Ea.Element.EndEvent = extend(Ea.Element._Base); 
Ea.Element.StartEvent = extend(Ea.Element._Base); 
Ea.Element.Group = extend(Ea.Element._Base); 
Ea.Element.Pool = extend(Ea.Element._Base); 
Ea.Element.Interaction = extend(Ea.Element._Base);
Ea.Element.ExpansionNode = extend(Ea.Element._Base);	

Ea.Feature = extend(Ea.Named, {
	getParent: function() {
		return this._getParent();
	}
},
{
	_parent: new Ea.Helper.ReferenceById({api: "ParentID", type: "Ea.Element.Type", private: true})
});
Ea.PrimitiveType = extend(Core.Types.Named, {});

Ea.register("Ea.Attribute@Ea.Types.Element.Feature", 23);
Ea.register("Ea.Method@Ea.Types.Element.Feature", 24);

Ea.register("Ea.File@Ea.Types.Element", 13);

Ea.register("Ea.TaggedValue@Ea.Types.Element", 12);
Ea.register("Ea.Properties@Ea.Types.Element.Property", 48);
Ea.register("Ea.CustomProperty@Ea.Types.Element", 42);

Ea.register("Ea.Constraint@Ea.Types.Element", 11);

Ea.register("Ea.Scenario@Ea.Types.Element.Scenario", 10);
