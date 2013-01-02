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
	Aggregation: {
		0: "none",
		1: "shared",
		2: "composite"
	}
};

Ea.ConnectorEnd._Base = extend(Ea.Types.Any, {
	getAggregation: function() {
		return Ea.ConnectorEnd.Aggregation[this._getAggregation()];
	}
},
{
	meta: {
		api: "ConnectorEnd",
		objectType: 22
	},

	_role: property({api: "Role"}),
	
	_roleNote: property({api: "RoleNote"}),
	
	_roleType: property({api: "RoleType"}),
	
	_stereotype: property({api: "Stereotype"}),
	
	_alias: property({api: "Alias"}),

	/**
	 * @type {Boolean}
	 */
	_derived: property({api: "Derived"}),

	/**
	 * @type {Boolean}
	 */
	_derivedUnion: property({api: "DerivedUnion"}),

	/**
	 * @type {Boolean}
	 */
	_allowDuplicates: property({api: "AllowDuplicates"}),

	/**
	 * @type {Boolean}
	 */
	_ownedByClassifier: property({api: "OwnedByClassifier"}),

	/**
	 * @type {Number}
	 * @private
	 */
	__aggregation: property({api: "Aggregation"}),

	/**
	 * @derived
	 */
	_aggregation: property(),

	/**
	 * @type {Number}
	 */
	_ordering: property({api: "Ordering"}),

	_constraint: property({api: "Constraint"}),
	
	_qualifier: property({api: "Qualifier"}),
	
	_multiplicity: property({api: "Cardinality"}),
	
	_visibility: property({api: "Visibility"}),
	
	_changeability: property({api: "IsChangeable"}),
	
	_navigability: property({api: "Navigable"}),
	
	/**
	 * @type {Boolean}
	 */
	_navigable: property({api: "IsNavigable"}),
	

	/**
	 * @type {Ea.Collection.Map<Ea.ConnectorEndTag._Base>}
	 * @qualifier this.getName()
	 * @aggregation composite
	 */
	_tags: property({api: "TaggedValues"})
});

include("Ea.ConnectorEndTag@Ea.Types.Connector");
