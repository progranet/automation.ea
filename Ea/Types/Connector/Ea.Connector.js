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

include("Ea.ConnectorEnd@Ea.Types.Connector");

Ea.Connector = {
	meta: {
		id: "ConnectorID",
		guid: "ConnectorGUID",
		objectType: 7
	}	
};

Ea.Connector._Base = extend(Ea.Types.Namespace, {
	
	_getFeatures: function() {
		var direction = {};
		var _features = this._getStyleEx();
		_features = _features.replace(/LF([SE])P\=(\{[^\}]+\})([LR]);/gi, function(match, z1, guid, z2) {
			var _direction = (z1 == "E" ? "supplier" : (z1 == "S" ? "client" : "unknown"));
			direction[_direction] = guid;
			return "";
		});
		var features = {
			clientAttribute: direction.client ? this._source.application.getByGuid(Ea.Attribute._Base, direction.client) : null,
			clientMethod: direction.client ? this._source.application.getByGuid(Ea.Method._Base, direction.client) : null,
			supplierAttribute: direction.supplier ? this._source.application.getByGuid(Ea.Attribute._Base, direction.supplier) : null,
			supplierMethod: direction.supplier ? this._source.application.getByGuid(Ea.Method._Base, direction.supplier) : null
		};
		return features;
	},
	
	/**
	 * Returns attribute linked to client end 
	 * 
	 * @type {Ea.Attribute._Base}
	 */
	getClientAttribute: function() {
		return this._getFeatures().clientAttribute;
	},
	
	/**
	 * Returns method linked to client end 
	 * 
	 * @type {Ea.Method._Base}
	 */
	getClientMethod: function() {
		return this._getFeatures().clientMethod;
	},
	
	/**
	 * Returns attribute linked to supplier end 
	 * 
	 * @type {Ea.Attribute._Base}
	 */
	getSupplierAttribute: function() {
		return this._getFeatures().supplierAttribute;
	},
	
	/**
	 * Returns method linked to supplier end 
	 * 
	 * @type {Ea.Method._Base}
	 */
	getSupplierMethod: function() {
		return this._getFeatures().supplierMethod;
	},
	
	/**
	 * Determines relation name for this relation type according to relation direction
	 * 
	 * @param {Boolean} client Specifies whether this end is client end
	 * @type {String}
	 */
	getRelation: function(client) {
		return client ? "links from" : "links to";
	},
	
	/**
	 * Returns connector stereotypes
	 * 
	 * @type {Core.Types.Collection<Ea._Base.AbstractStereotype>}
	 */
	getStereotypes: function() {
		return this._source.application.getRepository().getStereotypes(this);
	},
	
	_toString: function() {
		var client = this.getClientEnd().getRole();
		client = client ? " (" + client + ")" : "";
		client = this.getClient()._toString() + client;
		
		var supplier = this.getSupplierEnd().getRole();
		supplier = supplier ? " (" + supplier + ")" : "";
		supplier = this.getSupplier()._toString() + supplier;
		
		var connection = "--" + this.getName() + "-->";
		return client + " " + connection + " " + supplier + " [" + this._class + "]";
	}
},
{
	/**
	 * Connector id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	_id: property({api: "ConnectorID"}),
	
	/**
	 * Connector guid
	 * 
	 * @readOnly
	 */
	_guid: property({api: "ConnectorGUID"}),
	
	/**
	 * Connector  type
	 */
	_type: property({api: "Type"}),
	
	/**
	 * Connector alias
	 */
	_alias: property({api: "Alias"}),
	
	/**
	 * Connector notes
	 */
	_notes: property({api: "Notes"}),
	
	/**
	 * Connector stereotype
	 */
	_stereotype: property({api: "Stereotype"}),
	
	/**
	 * Connector stereotype names list
	 * 
	 * @type {Ea._Base.DataTypes.List}
	 */
	_stereotypesList: property({api: "StereotypeEx"}),

	/**
	 * Connector stereotypes collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea._Base.AbstractStereotype>}
	 */
	__stereotype: property(),

	/**
	 * Connector direction
	 */
	_direction: property({api: "Direction"}),

	/**
	 * Connector event flags
	 * 
	 * @type {Ea._Base.DataTypes.Map}
	 * @private
	 */
	_eventFlags: property({api: "EventFlags"}),

	/**
	 * Connector state flags
	 * 
	 * @type {Ea._Base.DataTypes.Map}
	 * @private
	 */
	_stateFlags: property({api: "StateFlags"}),

	/**
	 * Connector meta type
	 * 
	 * @private
	 * @readOnly
	 */
	_metaType: property({api: "MetaType"}),

	/**
	 * Connector miscellaneous data on index 0
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData0: property({api: "MiscData", index: 0}),

	/**
	 * Connector miscellaneous data on index 1
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData1: property({api: "MiscData", index: 1}),

	/**
	 * Connector miscellaneous data on index 2
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData2: property({api: "MiscData", index: 2}),

	/**
	 * Connector miscellaneous data on index 3
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData3: property({api: "MiscData", index: 3}),

	/**
	 * Connector miscellaneous data on index 4
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData4: property({api: "MiscData", index: 4}),

	/**
	 * Connector client element
	 * 
	 * @type {Ea.Element._Base}
	 */
	_client: property({api: "ClientID", referenceBy: "id"}),

	/**
	 * Connector supplier element
	 * 
	 * @type {Ea.Element._Base}
	 */
	_supplier: property({api: "SupplierID", referenceBy: "id"}),
	
	/**
	 * Connector extended style
	 * 
	 * @private
	 */
	_styleEx: property({api: "StyleEx"}),

	/**
	 * Connector to feature links
	 * 
	 * @private
	 * @derived
	 * @readOnly
	 * @type {Object}
	 */
	_features: property(),

	/**
	 * Connector link to client attribute
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Attribute._Base}
	 */
	_clientAttribute: property(),

	/**
	 * Connector link to client method
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Method._Base}
	 */
	_clientMethod: property(),

	/**
	 * Connector link to supplier attribute
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Attribute._Base}
	 */
	_supplierAttribute: property(),

	/**
	 * Connector link to supplier method
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Method._Base}
	 */
	_supplierMethod: property(),

	/**
	 * Connector client end
	 * 
	 * @readOnly
	 * @type {Ea.ConnectorEnd._Base}
	 * @aggregation composite
	 */
	_clientEnd: property({api: "ClientEnd"}),

	/**
	 * Connector supplier end
	 * 
	 * @readOnly
	 * @type {Ea.ConnectorEnd._Base}
	 * @aggregation composite
	 */
	_supplierEnd: property({api: "SupplierEnd"}),
	
	/**
	 * Connector guard expression
	 */
	_guard: property({api: "TransitionGuard"}),
	
	/**
	 * Connector transition action
	 */
	_transitionAction: property({api: "TransitionAction"}),
	
	/**
	 * Connector transition event
	 */
	_transitionEvent: property({api: "TransitionEvent"}),
	
	/**
	 * Connector virtual inheritance
	 */
	_virtualInheritance: property({api: "VirtualInheritance"}),

	/**
	 * Connector tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.ConnectorTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_tag: property({api: "TaggedValues"}),

	/**
	 * Connector constraints collection
	 * 
	 * @type {Ea.Collection._Base<Ea.ConnectorConstraint._Base>}
	 * @aggregation composite
	 */
	_constraint: property({api: "Constraints"}),

	/**
	 * Connector custom properties collection
	 * 
	 * @type {Ea.Collection.Map<Ea.CustomProperty._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_customProperty: property({api: "CustomProperties"}),

	/**
	 * Connector properties collection
	 * 
	 * @type {Ea.Properties._Base<Ea.Property._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_property: property({api: "Properties"}),

	/**
	 * Determines EA API Connector type name on creating API object
	 * 
	 * @type {String}
	 */
	determineEaType: function() {
		return this.name;
	},

	/**
	 * Recognizes class of EA Connector from source
	 * 
	 * @param {Object} source
	 * @type {Class}
	 */
	determineType: function(source) {
		return this._deriveType(source, this._type);
	}
});

Ea.Connector.Association = extend(Ea.Connector._Base, {});

Ea.Connector.Aggregation = extend(Ea.Connector._Base, {
	/**
	 * Determines relation name for this relation type according to relation direction
	 * 
	 * @param {Boolean} client Specifies whether this end is client end
	 * @type {String}
	 */
	getRelation: function(client) {
		return client ? "composed of" : "part of";
	}
});

Ea.Connector.ControlFlow = extend(Ea.Connector._Base, {
	/**
	 * Determines relation name for this relation type according to relation direction
	 * 
	 * @param {Boolean} client Specifies whether this end is client end
	 * @type {String}
	 */
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	}
});

Ea.Connector.ObjectFlow = extend(Ea.Connector._Base, {
	/**
	 * Determines relation name for this relation type according to relation direction
	 * 
	 * @param {Boolean} client Specifies whether this end is client end
	 * @type {String}
	 */
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	}
});

Ea.Connector.StateFlow = extend(Ea.Connector._Base, {
	/**
	 * Determines relation name for this relation type according to relation direction
	 * 
	 * @param {Boolean} client Specifies whether this end is client end
	 * @type {String}
	 */
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	}
});

Ea.Connector.Dependency = extend(Ea.Connector._Base, {
	/**
	 * Determines relation name for this relation type according to relation direction
	 * 
	 * @param {Boolean} client Specifies whether this end is client end
	 * @type {String}
	 */
	getRelation: function(client) {
		return client ? "needed by" : "depends on";
	}
});

Ea.Connector.Generalization = extend(Ea.Connector._Base, {
	/**
	 * Determines relation name for this relation type according to relation direction
	 * 
	 * @param {Boolean} client Specifies whether this end is client end
	 * @type {String}
	 */
	getRelation: function(client) {
		return client ? "supertype of" : "subtype of";
	}
});

Ea.Connector.Nesting = extend(Ea.Connector._Base, {
	/**
	 * Determines relation name for this relation type according to relation direction
	 * 
	 * @param {Boolean} client Specifies whether this end is client end
	 * @type {String}
	 */
	getRelation: function(client) {
		return client ? "owns" : "owned by";
	}
});

Ea.Connector.Realisation = extend(Ea.Connector._Base, {
	/**
	 * Determines relation name for this relation type according to relation direction
	 * 
	 * @param {Boolean} client Specifies whether this end is client end
	 * @type {String}
	 */
	getRelation: function(client) {
		return client ? "realized by" : "implements";
	}
});

Ea.Connector.Sequence = extend(Ea.Connector._Base, {},
{
	/**
	 * Sequence number
	 * 
	 * @type {Number}
	 */
	_sequenceNo: property({api: "SequenceNo"})
});

include("Ea.ConnectorTag@Ea.Types.Connector");
include("Ea.ConnectorConstraint@Ea.Types.Connector");
