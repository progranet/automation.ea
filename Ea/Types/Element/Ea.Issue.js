/*
   Copyright 2013 300 D&C

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

Ea.Issue = {
		meta: {
			objectType: 16
		}
};

Ea.Issue._Base = extend(Ea.Types.Named, {
	
	getParent: function() {
		return this._getParent();
	}
	
},
{
	determineType: function(source) {
		return this._deriveType(source, this._type);
	},

	/**
	 * Issue report date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_reported: property({api: "DateReported"}),

	/**
	 * Issue reporter
	 */
	_reporter: property({api: "Reporter"}),
	
	/**
	 * Issue notes
	 */
	_notes: property({api: "Notes"}),
	
	/**
	 * Issue resolve date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_resolved: property({api: "DateResolved"}),
	
	/**
	 * Issue resolver
	 */
	_resolver: property({api: "Resolver"}),
	
	/**
	 * Issue resolve notes
	 */
	_resolverNotes: property({api: "ResolverNotes"}),
	
	/**
	 * Issue parent element
	 * 
	 * @type {Ea.Element._Base}
	 * @private
	 */
	__parent: property({api: "ElementID", referenceBy: "id"}),

	/**
	 * Issue priority
	 */
	_priority: property({api: "Priority"}),

	/**
	 * Issue status
	 */
	_status: property({api: "Status"}),

	/**
	 * Issue severity
	 */
	_severity: property({api: "Severity"}),
	
	/**
	 * Issue difficulty
	 */
	_difficulty: property({api: "Difficulty"}),
	
	/**
	 * Issue version
	 */
	_version: property({api: "Version"}),
	
	/**
	 * Issue type
	 */
	_type: property({api: "Type"})
});
