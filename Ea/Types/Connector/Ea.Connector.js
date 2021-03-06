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

	getNamespace: function() {
		return this.getClient().getPackage();
	},
	
	_toString: function() {
		var client = this.getClientEnd().getRole();
		client = this.getClient()._toString() + (client ? " (" + client + ")" : "");
		
		var supplier = this.getSupplierEnd().getRole();
		supplier = this.getSupplier()._toString() + (supplier ? " (" + supplier + ")" : "");
		
		var connection = "--" + this.getName() + "-->";
		return "(" + client + ")" + connection + "(" + supplier + ") [" + this._class + "]";
	}
},
{
	_deriveTypeName: function(source) {
		var name = this.getProperty("_type").getApiValue(source.api).replace(/[-\s]/g,"");
		if (this.getProperty("_metaType").getApiValue(source.api) == "PackageImport")
			name = "PackageImport";
		return name;
	}
},
{
	/**
	 * Connector id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	id: {api: "ConnectorID"},
	
	/**
	 * Connector guid
	 * 
	 * @readOnly
	 */
	guid: {api: "ConnectorGUID"},
	
	/**
	 * Connector  type
	 * 
	 * @private
	 */
	_type: {api: "Type"},

	/**
	 * Connector meta type
	 * 
	 * @private
	 * @readOnly
	 */
	_metaType: {api: "MetaType"},
	
	/**
	 * Connector alias
	 */
	alias: {api: "Alias"},
	
	/**
	 * Connector notes
	 */
	notes: {api: "Notes"},
	
	/**
	 * Connector stereotype
	 */
	stereotype: {api: "Stereotype"},
	
	/**
	 * Connector stereotype names list
	 * 
	 * @type {Ea._Base.DataTypes.List}
	 */
	stereotypesList: {api: "StereotypeEx"},

	/**
	 * Connector stereotypes collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea._Base.AbstractStereotype>}
	 */
	stereotypes: {},

	/**
	 * Connector direction
	 */
	direction: {api: "Direction"},

	/**
	 * Connector event flags
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_eventFlags: {api: "EventFlags"},

	/**
	 * Connector state flags
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_stateFlags: {api: "StateFlags"},

	/**
	 * Connector miscellaneous data on index 0
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData0: {api: "MiscData", index: 0},

	/**
	 * Connector miscellaneous data on index 1
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData1: {api: "MiscData", index: 1},

	/**
	 * Connector miscellaneous data on index 2
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData2: {api: "MiscData", index: 2},

	/**
	 * Connector miscellaneous data on index 3
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData3: {api: "MiscData", index: 3},

	/**
	 * Connector miscellaneous data on index 4
	 * 
	 * @private
	 * @readOnly
	 */
	_miscData4: {api: "MiscData", index: 4},

	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},

	/**
	 * Connector client element
	 * 
	 * @type {Ea.Element._Base}
	 */
	client: {api: "ClientID", referenceBy: "id"},

	/**
	 * Connector supplier element
	 * 
	 * @type {Ea.Element._Base}
	 */
	supplier: {api: "SupplierID", referenceBy: "id"},
	
	/**
	 * Connector extended style
	 * 
	 * @private
	 */
	_styleEx: {api: "StyleEx"},

	/**
	 * Connector to feature links
	 * 
	 * @private
	 * @derived
	 * @readOnly
	 * @type {Object}
	 */
	features: {},

	/**
	 * Connector link to client attribute
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Attribute._Base}
	 */
	clientAttribute: {},

	/**
	 * Connector link to client method
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Method._Base}
	 */
	clientMethod: {},

	/**
	 * Connector link to supplier attribute
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Attribute._Base}
	 */
	supplierAttribute: {},

	/**
	 * Connector link to supplier method
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Method._Base}
	 */
	supplierMethod: {},

	/**
	 * Connector client end
	 * 
	 * @readOnly
	 * @type {Ea.ConnectorEnd._Base}
	 * @aggregation composite
	 */
	clientEnd: {api: "ClientEnd"},

	/**
	 * Connector supplier end
	 * 
	 * @readOnly
	 * @type {Ea.ConnectorEnd._Base}
	 * @aggregation composite
	 */
	supplierEnd: {api: "SupplierEnd"},
	
	/**
	 * Connector guard expression
	 */
	guard: {api: "TransitionGuard"},
	
	/**
	 * Connector transition action
	 */
	transitionAction: {api: "TransitionAction"},
	
	/**
	 * Connector transition event
	 */
	transitionEvent: {api: "TransitionEvent"},
	
	/**
	 * Connector virtual inheritance
	 */
	virtualInheritance: {api: "VirtualInheritance"},

	/**
	 * Connector tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.ConnectorTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	tags: {api: "TaggedValues"},

	/**
	 * Connector constraints collection
	 * 
	 * @type {Ea.Collection._Base<Ea.ConnectorConstraint._Base>}
	 * @aggregation composite
	 */
	constraints: {api: "Constraints"},

	/**
	 * Connector custom properties collection
	 * 
	 * @type {Ea.Collection.Map<Ea.CustomProperty._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 * @single customProperty
	 */
	customProperties: {api: "CustomProperties"},

	/**
	 * Connector properties collection
	 * 
	 * @type {Ea.Properties._Base<Ea.Property._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 * @single property
	 */
	properties: {api: "Properties"}
});

Ea.Connector.Association = extend(Ea.Connector._Base, {});

Ea.Connector.Deployment = extend(Ea.Connector._Base, {});

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

Ea.Connector.PackageImport = extend(Ea.Connector.Dependency, {

	getRelation: function(client) {
		return client ? "imported by" : "import";
	}
	
});

Ea.Connector.Abstraction = extend(Ea.Connector._Base, {
	
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

Ea.Connector.Sequence = extend(Ea.Connector._Base, {}, {},
{
	/**
	 * Sequence number
	 * 
	 * @type {Number}
	 */
	sequenceNo: {api: "SequenceNo"}
});

Ea.Connector.NoteLink = extend(Ea.Connector._Base, {
	
	/**
	 * Determines relation name for this relation type according to relation direction
	 * 
	 * @param {Boolean} client Specifies whether this end is client end
	 * @type {String}
	 */
	getRelation: function(client) {
		return client ? "links" : "links";
	}
});

include("Ea.ConnectorTag@Ea.Types.Connector");
include("Ea.ConnectorConstraint@Ea.Types.Connector");
