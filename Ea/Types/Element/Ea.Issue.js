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

Ea.Issue._Base = extend(Ea.Types.NamedElement, {
	
	getNamespace: function() {
		return this.getElement();
	},
	
	setNamespace: function(namespace) {
		this.setElement(namespace);
	}
	
},
{
	_deriveTypeName: function(source) {
		var name = this.getProperty("_type").getApiValue(source.api).replace(/[-\s]/g,"");
		return name;
	}
},
{
	/**
	 * Issue report date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	reported: {api: "DateReported"},

	/**
	 * Issue reporter
	 */
	reporter: {api: "Reporter"},
	
	/**
	 * Issue notes
	 */
	notes: {api: "Notes"},
	
	/**
	 * Issue resolve date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	resolved: {api: "DateResolved"},
	
	/**
	 * Issue resolver
	 */
	resolver: {api: "Resolver"},
	
	/**
	 * Issue resolve notes
	 */
	resolverNotes: {api: "ResolverNotes"},
	
	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},

	/**
	 * Issue element
	 * 
	 * @type {Ea.Element._Base}
	 */
	element: {api: "ElementID", referenceBy: "id"},

	/**
	 * Issue priority
	 */
	priority: {api: "Priority"},

	/**
	 * Issue status
	 */
	status: {api: "Status"},

	/**
	 * Issue severity
	 */
	severity: {api: "Severity"},
	
	/**
	 * Issue difficulty
	 */
	difficulty: {api: "Difficulty"},
	
	/**
	 * Issue version
	 */
	version: {api: "Version"},
	
	/**
	 * Issue type
	 * 
	 * @private
	 */
	_type: {api: "Type"}
});
