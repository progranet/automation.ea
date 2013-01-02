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

Ea.Connector = {};

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
			clientAttribute: direction.client ? this._source.application.getRepository().getByGuid(Ea.Attribute._Base, direction.client) : null,
			clientMethod: direction.client ? this._source.application.getRepository().getByGuid(Ea.Method._Base, direction.client) : null,
			supplierAttribute: direction.supplier ? this._source.application.getRepository().getByGuid(Ea.Attribute._Base, direction.supplier) : null,
			supplierMethod: direction.supplier ? this._source.application.getRepository().getByGuid(Ea.Method._Base, direction.supplier) : null
		};
		return features;
	},
	
	getClientAttribute: function() {
		return this._getFeatures().clientAttribute;
	},
	
	getClientMethod: function() {
		return this._getFeatures().clientMethod;
	},
	
	getSupplierAttribute: function() {
		return this._getFeatures().supplierAttribute;
	},
	
	getSupplierMethod: function() {
		return this._getFeatures().supplierMethod;
	},
	
	getRelation: function(client) {
		return client ? "links from" : "links to";
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
	meta: {
		id: "ConnectorID",
		guid: "ConnectorGUID",
		api: "Connector",
		objectType: 7
	},
	
	/**
	 * @type {Number}
	 */
	_id: property({api: "ConnectorID"}),
	
	_guid: property({api: "ConnectorGUID"}),
	
	_type: property({api: "Type"}),
	
	_alias: property({api: "Alias"}),
	
	_notes: property({api: "Notes"}),
	
	_stereotype: property({api: "Stereotype"}),
	
	_direction: property({api: "Direction"}),

	/**
	 * @type {Ea.DataTypes.Map}
	 */
	_eventFlags: property({api: "EventFlags"}),

	/**
	 * @type {Ea.DataTypes.Map}
	 * @private
	 */
	_stateFlags: property({api: "StateFlags"}),

	/**
	 * @private
	 */
	_metaType: property({api: "MetaType"}),

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
	 * @private
	 */
	_miscData4: property({api: "MiscData", index: 4}),

	/**
	 * @type {Ea.Element._Base}
	 */
	_client: property({api: "ClientID", referenceBy: "id"}),

	/**
	 * @type {Ea.Element._Base}
	 */
	_supplier: property({api: "SupplierID", referenceBy: "id"}),
	
	/**
	 * @private
	 */
	_styleEx: property({api: "StyleEx"}),

	/**
	 * @type {Object}
	 * @private
	 * @derived
	 */
	_features: property(),

	/**
	 * @type {Ea.Attribute._Base}
	 * @derived
	 */
	_clientAttribute: property(),

	/**
	 * @type {Ea.Method._Base}
	 * @derived
	 */
	_clientMethod: property(),

	/**
	 * @type {Ea.Attribute._Base}
	 * @derived
	 */
	_supplierAttribute: property(),

	/**
	 * @type {Ea.Method._Base}
	 * @derived
	 */
	_supplierMethod: property(),

	/**
	 * @type {Ea.ConnectorEnd._Base}
	 */
	_clientEnd: property({api: "ClientEnd"}),

	/**
	 * @type {Ea.ConnectorEnd._Base}
	 */
	_supplierEnd: property({api: "SupplierEnd"}),
	
	_guard: property({api: "TransitionGuard"}),
	
	_transitionAction: property({api: "TransitionAction"}),
	
	_transitionEvent: property({api: "TransitionEvent"}),
	
	_virtualInheritance: property({api: "VirtualInheritance"}),

	/**
	 * @type {Ea.Collection.Map<Ea.ConnectorTag._Base>}
	 * @qualifier this.getName()
	 * @aggregation composite
	 */
	_tags: property({api: "TaggedValues"}),

	/**
	 * @type {Ea.Collection._Base<Ea.ConnectorConstraint._Base>}
	 * @aggregation composite
	 */
	_constraints: property({api: "Constraints"}),

	/**
	 * @type {Ea.Collection.Map<Ea.CustomProperty._Base>}
	 * @qualifier this.getName()
	 * @aggregation composite
	 */
	_customProperties: property({api: "CustomProperties"}),

	/**
	 * @type {Ea.Properties._Base<Ea.Property._Base>}
	 * @qualifier this.getName()
	 * @aggregation composite
	 */
	_properties: property({api: "Properties"}),

	getType: function(source) {
		return this._deriveType(source, this._type);
	}
});

Ea.Connector.Association = extend(Ea.Connector._Base, {}, {
	elementType: "Association"
	
});

Ea.Connector.Aggregation = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "composed of" : "part of";
	}
});

Ea.Connector.ControlFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	}
});

Ea.Connector.ObjectFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	}
});

Ea.Connector.StateFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	}
});

Ea.Connector.Dependency = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "needed by" : "depends on";
	}
});

Ea.Connector.Generalization = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "supertype of" : "subtype of";
	}
}, {
	elementType: "Generalization"
	
});

Ea.Connector.Nesting = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "owns" : "owned by";
	}
});

Ea.Connector.Realisation = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "realized by" : "implements";
	}
});

Ea.Connector.Sequence = extend(Ea.Connector._Base, {},
{
	/**
	 * @type {Number}
	 */
	_sequenceNo: property({api: "SequenceNo"})
});

include("Ea.ConnectorTag@Ea.Types.Connector");
include("Ea.ConnectorConstraint@Ea.Types.Connector");
