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

Ea.Requirement = {};

Ea.Requirement._Base = extend(Ea.Types.Named, {},
{
	api: "Requirement",

	getType: function(source) {
		return this._deriveType(source, this._type);
	},

	_id: attribute({api: "RequirementID", type: Number, id: "id"}),
	_modified: attribute({api: "LastUpdate", type: Ea.DataTypes.Date}),
	_notes: attribute({api: "Notes"}),
	_priority: attribute({api: "Priority"}),
	_stability: attribute({api: "Stability"}),
	_status: attribute({api: "Status"}),
	_difficulty: attribute({api: "Difficulty"}),
	_type: attribute({api: "Type"})
});