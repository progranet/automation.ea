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

Ea.TaggedValue = {
		meta: {
			//id: "PropertyID",
			//guid: "PropertyGUID",
			objectType: 12
		}
};

Ea.TaggedValue._Base = extend(Ea.Tag._Base, {

	getNamespace: function() {
		return this.getElement();
	},
	
	setNamespace: function(namespace) {
		this.setElement(namespace);
	}

},
{},
{
	/**
	 * Tag id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	id: {api: "PropertyID"},
	
	/**
	 * Tag guid
	 */
	guid: {api: "PropertyGUID"},
	
	/**
	 * Tag notes
	 */
	notes: {api: "Notes"},
	
	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},

	/**
	 * Tag element
	 * 
	 * @type {Ea.Element._Base}
	 */
	element: {api: "ElementID", referenceBy: "id"}
});
