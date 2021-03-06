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

Ea.MethodTag = {
		meta: {
			//id: "TagID",
			//guid: "TagGUID",
			objectType: 36
		}
};

Ea.MethodTag._Base = extend(Ea.Tag._Feature, {
	
	getNamespace: function() {
		return this.getMethod();
	},
	
	setNamespace: function(namespace) {
		this.setMethod(namespace);
	}
}, 
{},
{
	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},

	/**
	 * Method tag parent method
	 * 
	 * @type {Ea.Method._Base}
	 */
	method: {api: "MethodID", referenceBy: "id"}
});
