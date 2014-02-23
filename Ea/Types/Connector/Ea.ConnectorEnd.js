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
	
}, {},
{
	/**
	 * Connector end role name
	 */
	role: {api: "Role"},
	
	/**
	 * Connector end notes
	 */
	notes: {api: "RoleNote"},
	
	/**
	 * Connector end type
	 */
	type: {api: "RoleType"},
	
	/**
	 * Connector end stereotype
	 */
	stereotype: {api: "Stereotype"},
	
	/**
	 * Connector end alias
	 */
	alias: {api: "Alias"},

	/**
	 * Connector end derived switch value
	 * 
	 * @type {Boolean}
	 */
	derived: {api: "Derived"},

	/**
	 * Connector end derived union switch value
	 * 
	 * @type {Boolean}
	 */
	derivedUnion: {api: "DerivedUnion"},

	/**
	 * Connector end allow duplicates switch value
	 * 
	 * @type {Boolean}
	 */
	allowDuplicates: {api: "AllowDuplicates"},

	/**
	 * Connector end owned by classifier swich value
	 * 
	 * @type {Boolean}
	 */
	ownedByClassifier: {api: "OwnedByClassifier"},

	/**
	 * Connector end aggregation value
	 * 
	 * @private
	 * @type {Number}
	 */
	_aggregation: {api: "Aggregation"},

	/**
	 * Connector end aggregation literal
	 * 
	 * @derived
	 */
	aggregation: {},

	/**
	 * Connector end ordered switch value
	 * 
	 * @type {Boolean}
	 */
	ordered: {api: "Ordering"},

	/**
	 * Connector end constraint
	 */
	constraint: {api: "Constraint"},
	
	/**
	 * Connector end qualifier
	 */
	qualifier: {api: "Qualifier"},
	
	/**
	 * Connector end multiplicity
	 */
	multiplicity: {api: "Cardinality"},
	
	/**
	 * Connector end visibility
	 */
	visibility: {api: "Visibility"},
	
	/**
	 * Connector end changeability
	 */
	changeability: {api: "IsChangeable"},
	
	/**
	 * Connector end navigability
	 */
	navigability: {api: "Navigable"},
	
	/**
	 * Connector end navigable switch value
	 * 
	 * @type {Boolean}
	 */
	navigable: {api: "IsNavigable"},
	
	/**
	 * Connector end tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.ConnectorEndTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	tags: {api: "TaggedValues"}

});

include("Ea.ConnectorEndTag@Ea.Types.Connector");
