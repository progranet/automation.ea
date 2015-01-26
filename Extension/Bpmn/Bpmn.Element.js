/*
   Copyright 2014 300 D&C

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
Bpmn.Element = {
	
	meta: {
		id: "ElementID",
		guid: "ElementGUID",
		objectType: 4
	},

	initialize: function() {
		Ea.Element.extension(this);
	}
};

Bpmn.Element._Base = extend([Ea.Element._Base, Bpmn.BaseElement], {

	_getClassifierByGuid: function() {
		return this._source.application.getRepository().getTypedElementType(this);
	},
	
	_getClassifier: function() {
		var guid = this._getMiscData0();
		if (!guid)
			return null;
		return this._source.application.getByGuid(guid);
	},
	
	getRef: function() {
		var type = null;
		try {
			type = this._getClassifier3();
		}
		catch (error) {}
		if (!type)
			type = this.getClassifier() || this._getClassifierByGuid();
		return type;
	}
	
},
{
	
	_deriveTypeName: function(source) {
		
		var typeName = null;
		var guid = this.getProperty("guid").getApiValue(source.api);
		var stereotypes = source.application.getRepository().getStereotypes(guid);
		
		if (!stereotypes)
			return null;
		
		stereotypes.forEach(function(stereotype) {
			if (stereotype.getVisualType) {
				var techId = stereotype.getVisualType().get("TechID");
				if (techId != "BPMN2.0")
					return false;
				typeName = stereotype.getName();
				return true;
			}
			else if (stereotype.getQualifiedName) {
				var qualifiedName = stereotype.getQualifiedName() || "";
				var path = qualifiedName.split("::");
				if (path.length != 2 || path[0] != "BPMN2.0")
					return false;
				typeName = path[1];
				return true;
			}
		});
		
		if (!typeName)
			return null;
		
		var tags = this.getProperty("tags").getApiValue(source.api);
		if (typeName == "Activity") {
			typeName = tags.getByName("activityType").Value;
			if (typeName == "Task") {
				var taskType = tags.getByName("taskType").Value;
				switch (taskType) {
				case "Abstract":
					typeName = "Task";
					break;
				default:
					typeName = taskType + "Task";
				}
			}

			if (tags.getByName("adHoc").Value == "true")
				typeName = "AdHocSubProcess";
			if (tags.getByName("isATransaction").Value == "true")
				typeName = "Transaction";
			if (tags.getByName("isACalledActivity").Value == "true")
				typeName = "CallActivity";
			
		}
		else if (typeName == "IntermediateEvent") {
			
			/*var parentId = this.getProperty("parent").getApiValue(source.api);
			var parent = null;
			var bound = false;
			if (parentId) {
				parent = source.application.getRepository()._source.api.GetElementByID(parentId);
				if (parent) {
					var embedded = parent.EmbeddedElements;
					for (var i = 0; i < embedded.Count; i++) {
						if (embedded.GetAt(i).ElementID == source.api.ElementID) {
							bound = true;
							break;
						}
					}
					if (bound)
						typeName = "BoundaryEvent";
				}
			}
			if (!parent || !bound) {
				typeName = "Intermediate" + tags.getByName("catchOrThrow").Value + "Event";
			}*/
			
			var type = source.api.Type;
			if (type == "ObjectNode") {
				typeName = "BoundaryEvent";
			}
			else {
				typeName = "Intermediate" + tags.getByName("catchOrThrow").Value + "Event";
			}
		}
		else if (typeName == "BusinessProcess") {
			typeName = "Process";
		}
		else if (typeName == "Gateway") {
			var gatewayType = tags.getByName("gatewayType").Value;
			typeName = gatewayType + (gatewayType == "Event" ? "Based" : "") + "Gateway";
		}
		
		typeName = typeName.replace(/[\-\s]/g, "");
		return typeName;
	}
},
{
	/**
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.Type}
	 */
	ref: {},
	
	/**
	 * @private
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.Type}
	 */
	_classifierByGuid: {},
	
	/**
	 * @private
	 * @derived
	 * @readOnly
	 * @type {Ea.Element._Base}
	 */
	_classifier: {}
	
});

Bpmn.Element.FlowElement = extend(Bpmn.Element._Base);

Bpmn.Element.FlowElementsContainer = extend(Bpmn.Element._Base);
		
Bpmn.Element.FlowNode = extend(Bpmn.Element.FlowElement);

Bpmn.Element.ItemDefinition = extend(Bpmn.Element._Base, {}, {}, {

	/**
	 * @type {String}
	 */
	itemKind: {api: "tag:itemKind"},

	/**
	 * @type {Boolean}
	 */
	isCollection: {api: "tag:isCollection"},

	/**
	 * @type {Ea.Element._Base}
	 */
	structureRef: {api: "tag:structureRef", referenceBy: "guid"}
});

Bpmn.Element.Message = extend(Bpmn.Element._Base, {}, {}, {

	/**
	 * @type {Bpmn.Element.ItemDefinition}
	 */
	itemRef: {api: "tag:itemRef", referenceBy: "guid"}
});

Bpmn.Element.Operation = extend(Bpmn.Element._Base);
Bpmn.Element.Error = extend(Bpmn.Element._Base, {}, {}, {

	/**
	 * @type {String}
	 */
	errorCode: {api: "tag:errorCode"},

	/**
	 * @type {Bpmn.Element.ItemDefinition}
	 */
	structureRef: {api: "tag:errorStructureRef", referenceBy: "guid"}
});

Bpmn.Element.Escalation = extend(Bpmn.Element._Base, {}, {}, {

	/**
	 * @type {String}
	 */
	escalationCode: {api: "tag:escalationCode"},

	/**
	 * @type {Bpmn.Element.ItemDefinition}
	 */
	structureRef: {api: "tag:escalationStructureRef", referenceBy: "guid"}
});

Bpmn.Element.Activity = extend(Bpmn.Element.FlowNode, {},
{},
{
	/**
	 * @type {String}
	 */
	taskType: {api: "tag:taskType"},
	
	/**
	 * @type {String}
	 */
	subprocessRef: {api: "tag:sub-ProcessRef"},
	
	/**
	 * @type {Boolean}
	 */
	triggeredByEvent: {api: "tag:triggeredByEvent"},

	/**
	 * @type {Boolean}
	 */
	sequential: {api: "tag:isSequential"},
	
	/**
	 * @type {Boolean}
	 */
	forCompensation: {api: "tag:isForCompensation"},
	
	/**
	 * @type {Boolean}
	 */
	aTransaction: {api: "tag:isATransaction"},
	
	/**
	 * @type {Boolean}
	 */
	aCalledActivity: {api: "tag:isACalledActivity"},
	
	/**
	 * @type {Bpmn.Element.Activity}
	 */
	calledActivityRef: {api: "tag:calledActivityRef", referenceBy: "guid"},
	
	/**
	 * @type {Boolean}
	 */
	adHoc: {api: "tag:adHoc"},
	
	/**
	 * @type {String}
	 */
	adHocOrdering: {api: "tag:adHocOrdering"},
	
	/**
	 * Message reference
	 * 
	 * @type {Bpmn.Element.Message}
	 */
	messageRef: {api: "tag:messageRef", referenceBy: "guid"},
	
	/**
	 * Operation reference
	 * 
	 * @type {Bpmn.Element.Operation}
	 */
	operationRef: {api: "tag:operationRef", referenceBy: "guid"}
});

Bpmn.Element.Process = extend(Bpmn.Element.FlowElementsContainer);
Bpmn.Element.SubProcess = extend([Bpmn.Element.FlowElementsContainer, Bpmn.Element.Activity]);
Bpmn.Element.AdHocSubProcess = extend(Bpmn.Element.SubProcess);
Bpmn.Element.Transaction = extend(Bpmn.Element.SubProcess);

Bpmn.Element.CallActivity = extend(Bpmn.Element.Activity);

Bpmn.Element.Task = extend(Bpmn.Element.Activity);
Bpmn.Element.ManualTask = extend(Bpmn.Element.Task);
Bpmn.Element.ServiceTask = extend(Bpmn.Element.Task);
Bpmn.Element.ReceiveTask = extend(Bpmn.Element.Task);
Bpmn.Element.SendTask = extend(Bpmn.Element.Task);
Bpmn.Element.BusinessRule = extend(Bpmn.Element.Task);
Bpmn.Element.ScriptTask = extend(Bpmn.Element.Task);
Bpmn.Element.UserTask = extend(Bpmn.Element.Task);


Bpmn.Element.Gateway = extend(Bpmn.Element.FlowNode, {}, {}, {
	
	/**
	 * @type {String}
	 */
	gatewayDirection: {api: "tag:gatewayDirection"}

});

Bpmn.Element.ExclusiveGateway = extend(Bpmn.Element.Gateway);
Bpmn.Element.InclusiveGateway = extend(Bpmn.Element.Gateway);
Bpmn.Element.ParallelGateway = extend(Bpmn.Element.Gateway);
Bpmn.Element.ComplexGateway = extend(Bpmn.Element.Gateway);
Bpmn.Element.EventBasedGateway = extend(Bpmn.Element.Gateway, {}, {}, {
	
	/**
	 * @type {String}
	 */
	eventGatewayType: {api: "tag:eventGatewayType"}

});

Bpmn.Element.DataObject = extend(Bpmn.Element.FlowElement, {}, {}, {
	
	/**
	 * Data In Out
	 * 
	 * @type {String}
	 */
	dataInOut: {api: "tag:dataInOut"},
	
	/**
	 * Data Object reference
	 * 
	 * @type {Ea.Element._Base}
	 */
	dataObjectRef: {api: "tag:dataObjectRef", referenceBy: "guid"},
	
	/**
	 * Data State
	 * 
	 * @type {String}
	 */
	dataState: {api: "tag:dataState"}

});

Bpmn.Element.DataStore = extend(Bpmn.Element.FlowElement);

Bpmn.Element.Participant = extend(Bpmn.Element._Base);

Bpmn.Element.Pool = extend(Bpmn.Element._Base, {}, {}, {
	
	/**
	 * @type {Boolean}
	 */
	blackBoxPool: {api: "tag:blackBoxPool"},
	
	/**
	 * @type {Bpmn.Element.Participant}
	 */
	participantRef: {api: "tag:participantRef", referenceBy: "guid"}
});

Bpmn.Element.Lane = extend(Bpmn.Element._Base, {}, {}, {
	
	/**
	 * @type {Ea.Element._Base}
	 */
	partitionElementRef: {api: "tag:partitionElementRef", referenceBy: "guid"}
});

Bpmn.Element.Event = extend(Bpmn.Element.FlowNode, {}, {}, {
	
	/**
	 * @type {String}
	 */
	catchOrThrow: {api: "tag:catchOrThrow"},
	
	/**
	 * @type {String}
	 */
	eventDefinition: {api: "tag:eventDefinition"}
	
});

Bpmn.Element.ThrowEvent = extend(Bpmn.Element.Event);
Bpmn.Element.CatchEvent = extend(Bpmn.Element.Event);

Bpmn.Element.IntermediateEvent = extend(Bpmn.Element.Event);

Bpmn.Element.EndEvent = extend(Bpmn.Element.ThrowEvent);
Bpmn.Element.IntermediateThrowEvent = extend([Bpmn.Element.IntermediateEvent, Bpmn.Element.ThrowEvent]);

Bpmn.Element.StartEvent = extend(Bpmn.Element.CatchEvent);
Bpmn.Element.IntermediateCatchEvent = extend([Bpmn.Element.IntermediateEvent, Bpmn.Element.CatchEvent]);
Bpmn.Element.BoundaryEvent = extend(Bpmn.Element.CatchEvent);

Bpmn.Element.Artifact = extend(Bpmn.Element._Base);
Bpmn.Element.Group = extend(Bpmn.Element.Artifact);
Bpmn.Element.TextAnnotation = extend(Bpmn.Element.Artifact, {}, {}, {
	
	/**
	 * Annotation text
	 */
	text: {api: "Notes"}

});
