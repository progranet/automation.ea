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
			api: "Issue",
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
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_reported: property({api: "DateReported"}),

	_reporter: property({api: "Reporter"}),
	
	_notes: property({api: "Notes"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_resolved: property({api: "DateResolved"}),
	
	_resolver: property({api: "Resolver"}),
	
	_resolverNotes: property({api: "ResolverNotes"}),
	
	/**
	 * @type {Ea.Element._Base}
	 * @private
	 */
	__parent: property({api: "ElementID", referenceBy: "id"}),

	_priority: property({api: "Priority"}),

	_status: property({api: "Status"}),

	_severity: property({api: "Severity"}),
	
	_difficulty: property({api: "Difficulty"}),
	
	_version: property({api: "Version"}),
	
	_type: property({api: "Type"})
});
