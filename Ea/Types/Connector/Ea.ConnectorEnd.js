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

Ea.ConnectorEnd = {
	meta: {
		objectType: 22
	},

	/**
	 * Enumeration specifying aggregation kinds
	 * 
	 * @enum {String}
	 */
	Aggregation: {
		0: "none",
		1: "shared",
		2: "composite"
	}
};

Ea.ConnectorEnd._Base = extend(Ea.Types.Any, {
	
	getAggregation: function() {
		return Ea.ConnectorEnd.Aggregation[this._getAggregation()];
	},
	
	setAggregation: function(aggregation) {
		for (var i in Ea.ConnectorEnd.Aggregation) {
			if (Ea.ConnectorEnd.Aggregation[i] == aggregation)
				return this._setAggregation(i);
		}
		throw new Error("Unknown aggregation kind: " + aggregation + " for ConnectorEnd: " + this);
	}
	
},
{
	/**
	 * Connector end role name
	 */
	_role: property({api: "Role"}),
	
	/**
	 * Connector end notes
	 */
	_notes: property({api: "RoleNote"}),
	
	/**
	 * Connector end type
	 */
	_type: property({api: "RoleType"}),
	
	/**
	 * Connector end stereotype
	 */
	_stereotype: property({api: "Stereotype"}),
	
	/**
	 * Connector end alias
	 */
	_alias: property({api: "Alias"}),

	/**
	 * Connector end derived switch value
	 * 
	 * @type {Boolean}
	 */
	_derived: property({api: "Derived"}),

	/**
	 * Connector end derived union switch value
	 * 
	 * @type {Boolean}
	 */
	_derivedUnion: property({api: "DerivedUnion"}),

	/**
	 * Connector end allow duplicates switch value
	 * 
	 * @type {Boolean}
	 */
	_allowDuplicates: property({api: "AllowDuplicates"}),

	/**
	 * Connector end owned by classifier swich value
	 * 
	 * @type {Boolean}
	 */
	_ownedByClassifier: property({api: "OwnedByClassifier"}),

	/**
	 * Connector end aggregation value
	 * 
	 * @private
	 * @type {Number}
	 */
	__aggregation: property({api: "Aggregation"}),

	/**
	 * Connector end aggregation literal
	 * 
	 * @derived
	 */
	_aggregation: property(),

	/**
	 * Connector end ordered switch value
	 * 
	 * @type {Boolean}
	 */
	_ordered: property({api: "Ordering"}),

	/**
	 * Connector end constraint
	 */
	_constraint: property({api: "Constraint"}),
	
	/**
	 * Connector end qualifier
	 */
	_qualifier: property({api: "Qualifier"}),
	
	/**
	 * Connector end multiplicity
	 */
	_multiplicity: property({api: "Cardinality"}),
	
	/**
	 * Connector end visibility
	 */
	_visibility: property({api: "Visibility"}),
	
	/**
	 * Connector end changeability
	 */
	_changeability: property({api: "IsChangeable"}),
	
	/**
	 * Connector end navigability
	 */
	_navigability: property({api: "Navigable"}),
	
	/**
	 * Connector end navigable switch value
	 * 
	 * @type {Boolean}
	 */
	_navigable: property({api: "IsNavigable"}),
	
	/**
	 * Connector end tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.ConnectorEndTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_tag: property({api: "TaggedValues"})

});

include("Ea.ConnectorEndTag@Ea.Types.Connector");
