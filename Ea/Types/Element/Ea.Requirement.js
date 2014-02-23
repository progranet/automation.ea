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

Ea.Requirement._Base = extend(Ea.Types.NamedElement, {},
{
	determineType: function(api) {
		return this._deriveType(api, this.getProperty("_type"));
	}
},
{
	/**
	 * Requirement id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	id: {api: "RequirementID"},
	
	/**
	 * Requirement modification date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	modified: {api: "LastUpdate"},
	
	/**
	 * Requirement notes
	 */
	notes: {api: "Notes"},
	
	/**
	 * Requirement priority
	 */
	priority: {api: "Priority"},
	
	/**
	 * Requirement stability
	 */
	stability: {api: "Stability"},
	
	/**
	 * Requirement status
	 */
	status: {api: "Status"},
	
	/**
	 * Requirement difficulty
	 */
	difficulty: {api: "Difficulty"},
	
	/**
	 * Requirement type
	 * 
	 * @private
	 */
	_type: {api: "Type"},
	
	/**
	 * Requirement parent element
	 * 
	 * @readOnly
	 * @type {Ea.Element._Base}
	 */
	parent: {api: "ParentID", referenceBy: "id"}
});
