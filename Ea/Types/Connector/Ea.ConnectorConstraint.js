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

Ea.ConnectorConstraint = {
	meta: {
		objectType: 37
	}
};

Ea.ConnectorConstraint._Base = extend(Ea.FeatureConstraint._Base, {
	
	getNamespace: function() {
		return this.getConnector();
	},
	
	setNamespace: function(namespace) {
		this.setConnector(namespace);
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
	 * Connector constraint connector
	 * 
	 * @type {Ea.Connector._Base}
	 */
	connector: {api: "ConnectorID", referenceBy: "id"}
});
