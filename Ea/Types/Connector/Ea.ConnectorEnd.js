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
	api: "ConnectorEnd",

	_role: attribute({api: "Role"}),
	_roleNote: attribute({api: "RoleNote"}),
	_roleType: attribute({api: "RoleType"}),
	_stereotype: attribute({api: "Stereotype"}),
	_alias: attribute({api: "Alias"}),

	_derived: attribute({api: "Derived", type: Boolean}),
	_derivedUnion: attribute({api: "DerivedUnion", type: Boolean}),
	_allowDuplicates: attribute({api: "AllowDuplicates", type: Boolean}),
	_ownedByClassifier: attribute({api: "OwnedByClassifier", type: Boolean}),
	__aggregation: attribute({api: "Aggregation", type: Number, private: true}),
	_aggregation: derived({getter: "getAggregation"}),
	_ordering: attribute({api: "Ordering", type: Number}),
	_constraint: attribute({api: "Constraint"}),
	_qualifier: attribute({api: "Qualifier"}),
	_multiplicity: attribute({api: "Cardinality"}),
	_visibility: attribute({api: "Visibility"}),
	_changeability: attribute({api: "IsChangeable"}),
	_navigability: attribute({api: "Navigable"}),
	
	_tags: attribute({api: "TaggedValues", type: "Ea.Collection.Map", elementType: "Ea.ConnectorEndTag._Base", key: "this.getName()", value: "this", aggregation: "composite"})
});

Ea.register("Ea.ConnectorEndTag@Ea.Types.Connector", 41);
