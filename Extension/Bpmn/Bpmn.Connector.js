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
Bpmn.Connector = {
	
	meta: {
		id: "ConnectorID",
		guid: "ConnectorGUID",
		objectType: 7
	},

	initialize: function() {
		Ea.Connector.extension(this);
	}
};

Bpmn.Connector._Base = extend(Ea.Connector._Base, {}, {
	
	_deriveTypeName: function(source) {
		
		var typeName;
		
		typeName = null;
		var guid = this.getProperty("guid").getApiValue(source.api);
		var stereotypes = source.application.getRepository().getStereotypes(guid);
		stereotypes.forEach(function(stereotype) {
			if (stereotype.getQualifiedName) {
				var qualifiedName = stereotype.getQualifiedName();
				var path = qualifiedName.split("::");
				if (path.length != 2 || path[0] != "BPMN2.0")
					return false;
				typeName = path[1];
				return true;
			}
		});
		
		if (!typeName)
			return null;
		
		/*if (typeName == "Activity") {
			var tags = this.getProperty("tags").getApiValue(source.api);
			typeName = tags.getByName("activityType").Value;
		}*/
		
		return typeName;
	}
});

Bpmn.Connector.MessageFlow = extend(Bpmn.Connector._Base, {
	
	getMessageRef: function() {
		return this.getTags().get("messageRef").getValue();
	},
	
	setMessageRef: function(messageRef) {
		this.getTags().get("messageRef").setValue(messageRef);
	}
	
}, {}, {
	
	/**
	 * Message reference
	 * 
	 * @derived
	 * @type {String}
	 */
	messageRef: {}
});

Bpmn.Connector.SequenceFlow = extend(Bpmn.Connector._Base, {
	
	getConditionExpression: function() {
		return this.getTags().get("conditionExpression").getValue();
	},
	
	setConditionExpression: function(conditionExpression) {
		this.getTags().get("conditionExpression").setValue(conditionExpression);
	},
		
	getDataObjectRef: function() {
		return this.getTags().get("dataObjectRef").getValue();
	},
	
	setDataObjectRef: function(dataObjectRef) {
		this.getTags().get("dataObjectRef").setValue(dataObjectRef);
	}

}, {}, {
	
	/**
	 * Condition Expression
	 * 
	 * @derived
	 * @type {String}
	 */
	conditionExpression: {},
	
	/**
	 * Data Object reference
	 * 
	 * @derived
	 * @type {String}
	 */
	dataObjectRef: {}
});
