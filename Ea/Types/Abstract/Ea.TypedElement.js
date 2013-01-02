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

/**
 * @namespace
 */
Ea.TypedElement = {
		
};

/**
 * @constructor
 * @extends Ea.Types.Namespace
 */
Ea.TypedElement._Base = extend(Ea.Types.Namespace, {

	/**
	 * @memberOf Ea.TypedElement#
	 * @type {Ea.PrimitiveType|Ea.Element._Base}
	 */
	getType: function() {
		var type = this._getClassifier();
		if (!type) {
			var name = this._getPrimitiveType();
			type = Ea.PrimitiveType.getPrimitiveType(name);
		}
		return type;
	},
	
	_toString: function() {
		return this.getName() + " :" + this.getType() + " [" + this._class  + "]";
	}
},
{
	/**
	 * @type {Core.Types.Object}
	 * @derived
	 */
	__type: property()
});

Ea.TypedElement.Feature = extend(Ea.TypedElement._Base, {
	getParent: function() {
		return this._getParent();
	}
},
{
	_alias: property({api: "Style"}), // Not mistake, see http://www.sparxsystems.com/uml_tool_guide/sdk_for_enterprise_architect/attribute.htm
	
	_notes: property({api: "Notes"}),
	
	_stereotype: property({api: "Stereotype"}),
	
	/**
	 * @type {Ea.Types.Namespace}
	 * @derived
	 */
	__parent: property(),

	/**
	 * @type {Ea.Element.Type}
	 * @private
	 */
	_parent: property({api: "ParentID", referenceBy: "id"})
});

