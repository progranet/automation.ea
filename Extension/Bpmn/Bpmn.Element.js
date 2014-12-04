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

Bpmn.Element._Base = extend(Ea.Element._Base, {

	_getClassifierByGuid: function() {
		return this._source.application.getRepository().getTypedElementType(this);
	},
	
	getRef: function() {
		var type = null;
		try {
			type = this._getClassifier();
		}
		catch (error) {}
		if (!type)
			type = this.getClassifier() || this._getClassifierByGuid();
		return type;
	}
	
},
{
	
	_deriveTypeName: function(source) {
		
		var typeName;
		
		typeName = null;
		var guid = this.getProperty("guid").getApiValue(source.api);
		var stereotypes = source.application.getRepository().getStereotypes(guid);
		
		if (!stereotypes)
			return null;
		
		stereotypes.forEach(function(stereotype) {
			if (stereotype.getQualifiedName) {
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
		
		if (typeName == "Activity") {
			var tags = this.getProperty("tags").getApiValue(source.api);
			typeName = tags.getByName("activityType").Value;
		}
		
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
	 * @readOnly
	 * @type {Ea.Element._Base}
	 */
	_classifier: {api: "MiscData", index: 0, referenceBy: "guid"}
	
});

Bpmn.Element.Activity = extend(Bpmn.Element._Base, {
	
	getTaskType: function() {
		return this.getTags().get("taskType").getValue();
	},
	
	setTaskType: function(taskType) {
		this.getTags().get("taskType").setValue(taskType);
	},
	
	isSequential: function() {
		return this.getTags().get("isSequential").getValue();
	},
	
	setSequential: function(isSequential) {
		this.getTags().get("isSequential").setValue(isSequential);
	},
	
	getSubprocessRef: function() {
		return this.getTags().get("sub-ProcessRef").getValue();
	},
	
	setSubprocessRef: function(subProcessRef) {
		this.getTags().get("sub-ProcessRef").setValue(subProcessRef);
	},
	
	isTriggeredByEvent: function() {
		return this.getTags().get("triggeredByEvent").getValue();
	},
	
	setTriggeredByEvent: function(triggeredByEvent) {
		this.getTags().get("triggeredByEvent").setValue(triggeredByEvent);
	},
	
	isForCompensation: function() {
		return this.getTags().get("isForCompensation").getValue();
	},
	
	setForCompensation: function(isForCompensation) {
		this.getTags().get("isForCompensation").setValue(isForCompensation);
	},
	
	isATransaction: function() {
		return this.getTags().get("isATransaction").getValue();
	},
	
	setATransaction: function(isATransaction) {
		this.getTags().get("isATransaction").setValue(isATransaction);
	},
	
	isACalledActivity: function() {
		return this.getTags().get("isACalledActivity").getValue();
	},
	
	setACalledActivity: function(isACalledActivity) {
		this.getTags().get("isACalledActivity").setValue(isACalledActivity);
	},
	
	getCalledActivityRef: function() {
		return this.getTags().get("calledActivityRef").getValue();
	},
	
	setCalledActivityRef: function(calledActivityRef) {
		this.getTags().get("calledActivityRef").setValue(calledActivityRef);
	},

	isAdHoc: function() {
		return this.getTags().get("adHoc").getValue();
	},
	
	setAdHoc: function(adHoc) {
		this.getTags().get("adHoc").setValue(adHoc);
	},

	getAdHocOrdering: function() {
		return this.getTags().get("adHocOrdering").getValue();
	},
	
	setAdHocOrdering: function(adHoc) {
		this.getTags().get("adHocOrdering").setValue(adHocOrdering);
	},
	
	getMessageRef: function() {
		return this.getTags().get("messageRef").getValue();
	},
	
	setMessageRef: function(messageRef) {
		this.getTags().get("messageRef").setValue(messageRef);
	}

} ,{}, {
	
	/**
	 * @derived
	 * @type {String}
	 */
	taskType: {},
	
	/**
	 * @derived
	 * @type {String}
	 */
	subprocessRef: {},
	
	/**
	 * @derived
	 * @type {Boolean}
	 */
	triggeredByEvent: {},

	/**
	 * @derived
	 * @type {Boolean}
	 */
	sequential: {},
	
	/**
	 * @derived
	 * @type {Boolean}
	 */
	forCompensation: {},
	
	/**
	 * @derived
	 * @type {Boolean}
	 */
	aTransaction: {},
	
	/**
	 * @derived
	 * @type {Boolean}
	 */
	aCalledActivity: {},
	
	/**
	 * @derived
	 * @type {String}
	 */
	calledActivityRef: {},
	
	/**
	 * @derived
	 * @type {Boolean}
	 */
	adHoc: {},
	
	/**
	 * @derived
	 * @type {String}
	 */
	adHocOrdering: {},
	
	/**
	 * Message reference
	 * 
	 * @derived
	 * @type {String}
	 */
	messageRef: {}
	
});

Bpmn.Element.BusinessProcess = extend(Bpmn.Element.Activity);

Bpmn.Element.Task = extend(Bpmn.Element.Activity);

Bpmn.Element.DataObject = extend(Bpmn.Element._Base, {
	
	getDataInOut: function() {
		return this.getTags().get("dataInOut").getValue();
	},
	
	setDataInOut: function(dataInOut) {
		this.getTags().get("dataInOut").setValue(dataInOut);
	},
	
	getDataObjectRef: function() {
		return this.getTags().get("dataObjectRef").getValue();
	},
	
	setDataObjectRef: function(dataObjectRef) {
		this.getTags().get("dataObjectRef").setValue(dataObjectRef);
	},
	
	getDataState: function() {
		return this.getTags().get("dataState").getValue();
	},
	
	setDataState: function(dataState) {
		this.getTags().get("dataState").setValue(dataState);
	}

}, {}, {
	
	/**
	 * Data In Out
	 * 
	 * @derived
	 * @type {String}
	 */
	dataInOut: {},
	
	/**
	 * Data Object reference
	 * 
	 * @derived
	 * @type {String}
	 */
	dataObjectRef: {},
	
	/**
	 * Data State
	 * 
	 * @derived
	 * @type {String}
	 */
	dataState: {}

});

Bpmn.Element.Pool = extend(Bpmn.Element._Base, {
	
	isBlackBoxPool: function() {
		return this.getTags().get("blackBoxPool").getValue();
	},
	
	setBlackBoxPool: function(blackBoxPool) {
		this.getTags().get("blackBoxPool").setValue(blackBoxPool);
	},
	
	getParticipantRef: function() {
		return this.getTags().get("participantRef").getValue();
	},
	
	setParticipantRef: function(participantRef) {
		this.getTags().get("participantRef").setValue(participantRef);
	}
	
}, {}, {
	
	/**
	 * @derived
	 * @type {Boolean}
	 */
	blackBoxPool: {},
	
	/**
	 * @derived
	 * @type {String}
	 */
	participantRef: {}
});

Bpmn.Element.Lane = extend(Bpmn.Element._Base, {
	
	getPartitionElementRef: function() {
		return this.getTags().get("partitionElementRef").getValue();
	},
	
	setPartitionElementRef: function(partitionElementRef) {
		this.getTags().get("partitionElementRef").setValue(partitionElementRef);
	}
	
}, {}, {
	
	/**
	 * @derived
	 * @type {String}
	 */
	partitionElementRef: {}
});

Bpmn.Element.Event = extend(Bpmn.Element._Base, {
	
	getCatchOrThrow: function() {
		return this.getTags().get("catchOrThrow").getValue();
	},
	
	setCatchOrThrow: function(catchOrThrow) {
		this.getTags().get("catchOrThrow").setValue(catchOrThrow);
	},
	
	getEventDefinition: function() {
		return this.getTags().get("eventDefinition").getValue();
	},
	
	setEventDefinition: function(eventDefinition) {
		this.getTags().get("eventDefinition").setValue(eventDefinition);
	}
	
}, {}, {
	
	/**
	 * @derived
	 * @type {String}
	 */
	catchOrThrow: {},
	
	/**
	 * @derived
	 * @type {String}
	 */
	eventDefinition: {}
	
});

Bpmn.Element.StartEvent = extend(Bpmn.Element.Event);

Bpmn.Element.EndEvent = extend(Bpmn.Element.Event);

Bpmn.Element.IntermediateEvent = extend(Bpmn.Element.Event);
