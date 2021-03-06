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

Ea.Constraint = {
		meta: {
			objectType: 11
		}
};

Ea.Constraint._Base = extend(Ea.Types.NamedElement, {
	
	getNamespace: function() {
		return this.getParent();
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
	 * Constraint notes
	 */
	notes: {api: "Notes"},
	
	/**
	 * Constraint status
	 */
	status: {api: "Status"},
	
	/**
	 * Constraint weight
	 * 
	 * @type {Number}
	 */
	weight: {api: "Weight"},
	
	/**
	 * Constraint type
	 * 
	 * @private
	 */
	_type: {api: "Type"},
	
	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},

	/**
	 * Constraint parent element
	 * 
	 * @readOnly
	 * @type {Ea.Element._Base}
	 */
	parent: {api: "ParentID", referenceBy: "id"}
});
