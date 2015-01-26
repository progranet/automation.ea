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

Bpmn.Connector._Base = extend([Ea.Connector._Base, Bpmn.BaseElement], {}, {
	
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
		
		return typeName;
	}
});

Bpmn.Connector.MessageFlow = extend(Bpmn.Connector._Base, {}, {}, {
	
	/**
	 * Message reference
	 * 
	 * @type {Bpmn.Element.Message}
	 */
	messageRef: {api: "tag:messageRef", referenceBy: "guid"}
});

Bpmn.Connector.SequenceFlow = extend(Bpmn.Connector._Base, {
	
	getConditionExpression: function() {
		return this.getTags().get("conditionExpression").getNotes();
	},
	
	setConditionExpression: function(expression) {
		this.getTags().get("conditionExpression").setNotes(expression);
	}
	
},
{}, {
	
	/**
	 * @derived
	 * @type {String}
	 */
	conditionExpression: {},
	
	/**
	 * @type {String}
	 */
	conditionType: {api: "tag:conditionType"},

	/**
	 * Data Object reference
	 * 
	 * @type {Bpmn.Element.DataObject}
	 */
	dataObjectRef: {api: "tag:dataObjectRef", referenceBy: "guid"}
});

Bpmn.Connector.Association = extend(Bpmn.Connector._Base);

Bpmn.Connector.DataAssociation = extend(Bpmn.Connector._Base);

Bpmn.Connector.DataInputAssociation = extend(Bpmn.Connector.DataAssociation);
Bpmn.Connector.DataOutputAssociation = extend(Bpmn.Connector.DataAssociation);
