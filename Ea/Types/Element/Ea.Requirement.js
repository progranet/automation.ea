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

Ea.Requirement = {
		meta: {
			//id: "RequirementID",
			objectType: 9
		}
};

Ea.Requirement._Base = extend(Ea.Types.Named, {},
{
	determineType: function(source) {
		return this._deriveType(source, this._type);
	},

	/**
	 * Requirement id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	_id: property({api: "RequirementID"}),
	
	/**
	 * Requirement modification date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_modified: property({api: "LastUpdate"}),
	
	/**
	 * Requirement notes
	 */
	_notes: property({api: "Notes"}),
	
	/**
	 * Requirement priority
	 */
	_priority: property({api: "Priority"}),
	
	/**
	 * Requirement stability
	 */
	_stability: property({api: "Stability"}),
	
	/**
	 * Requirement status
	 */
	_status: property({api: "Status"}),
	
	/**
	 * Requirement difficulty
	 */
	_difficulty: property({api: "Difficulty"}),
	
	/**
	 * Requirement type
	 */
	_type: property({api: "Type"}),
	
	/**
	 * Requirement parent element
	 * 
	 * @private
	 * @readOnly
	 * @type {Ea.Element._Base}
	 */
	__parent: property({api: "ParentID", referenceBy: "id"})
});
