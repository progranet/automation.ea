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
Ea.TypedElement = {};

Ea.TypedElement._Base = extend(Ea.Types.Namespace, {

	getType: function() {
		var type = this._getClassifier();
		if (!type) {
			var name = this._getPrimitiveType();
			type = Ea._Base.PrimitiveType.getPrimitiveType(name);
		}
		return type;
	},
	
	setType: function(type) {
		if (type && type.instanceOf(Ea.Types.Any)) {
			this._setClassifier(type);
		}
		this._setPrimitiveType(type ? type.getName() : "");
	},
	
	getStereotypes: function() {
		return this._source.application.getRepository().getStereotypes(this);
	},
	
	_toString: function() {
		return this.getName() + " :" + this.getType() + " [" + this._class  + "]";
	}
},
{},
{
	/**
	 * Typed element stereotype
	 */
	stereotype: {api: "Stereotype"},
	
	/**
	 * Typed element stereotype names list
	 * 
	 * @type {Ea._Base.DataTypes.List}
	 */
	stereotypesList: {api: "StereotypeEx"},

	/**
	 * Typed element stereotypes collection
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea._Base.AbstractStereotype>}
	 */
	stereotypes: {},

	/**
	 * Typed element type
	 * 
	 * @derived
	 * @type {Ea._Base.Type}
	 */
	type: {}
});

Ea.TypedElement.Feature = extend(Ea.TypedElement._Base, {
	
	getNamespace: function() {
		return this.getParent();
	}	
},
{},
{
	/**
	 * Feature alias
	 */
	alias: {api: "Style"}, // Not mistake, see http://www.sparxsystems.com/uml_tool_guide/sdk_for_enterprise_architect/attribute.htm
	
	/**
	 * Feature notes
	 */
	notes: {api: "Notes"},

	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},
	
	/**
	 * Feature parent
	 * 
	 * @readOnly
	 * @type {Ea.Element.Type}
	 */
	parent: {api: "ParentID", referenceBy: "id"}
});

