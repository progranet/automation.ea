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

Ea.ConnectorEnd = {};

Ea.ConnectorEnd._Base = extend(Ea.Types.Any, {},
{
	api: "ConnectorEnd",

	_role: attribute({api: "Role"}),
	_roleNote: attribute({api: "RoleNote"}),
	_roleType: attribute({api: "RoleType"}),
	_stereotype: attribute({api: "Stereotype"}),
	_alias: attribute({api: "Alias"}),

	_allowDuplicates: attribute({api: "AllowDuplicates", type: Boolean}),
	_ownedByClassifier: attribute({api: "OwnedByClassifier", type: Boolean}),
	_aggregation: attribute({api: "Aggregation", type: Number}),
	_constraint: attribute({api: "Constraint"}),
	_qualifier: attribute({api: "Qualifier"}),
	_multiplicity: attribute({api: "Cardinality"}),
	_visibility: attribute({api: "Visibility"}),
	_navigability: attribute({api: "Navigable"}),
	
	_tags: attribute({api: "TaggedValues", type: "Ea.Collection.Map", elementType: "Ea.ConnectorEndTag._Base", key: "this.getName()", value: "this", aggregation: "composite"})
});

Ea.register("Ea.ConnectorEndTag@Ea.Types.Connector", 41);
