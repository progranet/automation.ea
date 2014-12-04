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
Ea.Attribute = {
	meta: {
		id: "AttributeID",
		guid: "AttributeGUID",
		objectType: 23
	}
};

Ea.Attribute._Base = extend(Ea.TypedElement.Feature, {},
{
	_deriveTypeName: function(source) {
		var stereotype = this.getProperty("stereotype").getApiValue(source.api); 
		if (stereotype == "enum")
			return "EnumerationLiteral";
		return "Attribute";
	}
},
{
	/**
	 * Attribute id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	id: {api: "AttributeID"},
	
	/**
	 * Attribute guid
	 * 
	 * @readOnly
	 */
	guid: {api: "AttributeGUID"},
	
	/**
	 * Attribute extended style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_styleEx: {api: "StyleEx"},
	
	/**
	 * Attribute tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.AttributeTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	tags: {api: "TaggedValues"},
	
	/**
	 * Attribute position in tree model of project browser. 
	 * 
	 * @type {Number}
	 */
	position: {api: "Pos"}
	
});

Ea.Attribute.EnumerationLiteral = extend(Ea.Attribute._Base, {

	/**
	 * Returns null
	 * 
	 * @type {Core.Types.Object}
	 */
	getType: function() {
		return null;
	},
	
	/**
	 * Throws exception
	 * 
	 * @param {Core.Types.Object} type
	 */
	setType: function(type) {
		throw new Error("Cannot set type od enumeration literal");
	},
	
	_toString: function() {
		return this.getName() + " [" + this._class  + "]";
	}
});

Ea.Attribute.Attribute = extend(Ea.Attribute._Base, {}, {},
{

	/**
	 * Attribute classifier
	 * 
	 * @private
	 * @type {Ea.Element.Type}
	 */
	_classifier: {api: "ClassifierID", referenceBy: "id"},
	
	/**
	 * Attribute constraints collection
	 * 
	 * @type {Ea.Collection._Base<Ea.AttributeConstraint._Base>}
	 * @aggregation composite
	 */
	constraints: {api: "Constraints"},
	
	/**
	 * Attribute data type
	 * 
	 * @private
	 */
	_primitiveType: {api: "Type"},
	
	
	/**
	 * Attribute default value
	 */
	_default: {api: "Default"},
	
	/**
	 * Attribute collection switch value
	 * 
	 * @type {Boolean}
	 */
	collection: {api: "IsCollection"},
	
	/**
	 * Attribute read only switch value
	 * 
	 * @type {Boolean}
	 */
	readOnly: {api: "IsConst"},
	
	/**
	 * Attribute derived switch value
	 * 
	 * @type {Boolean}
	 */
	derived: {api: "IsDerived"},
	
	/**
	 * Attribute ordered switch value
	 * 
	 * @type {Boolean}
	 */
	ordered: {api: "IsOrdered"},
	
	/**
	 * Attribute static switch value
	 * 
	 * @type {Boolean}
	 */
	static: {api: "IsStatic"},
	
	/**
	 * Attribute allow duplicates switch value
	 * 
	 * @type {Boolean}
	 */
	allowDuplicates: {api: "AllowDuplicates"},
	
	/**
	 * Attribute length
	 */
	length: {api: "Length"},
	
	/**
	 * Attribute precision
	 */
	precision: {api: "Precision"},
	
	/**
	 * Attribute scale
	 */
	scale: {api: "Scale"},
	
	/**
	 * Attribute container
	 */
	container: {api: "Container"},
	
	/**
	 * Attribute containment
	 */
	containment: {api: "Containment"},
	
	/**
	 * Attribute multiplicity lower
	 */
	lower: {api: "LowerBound"},
	
	/**
	 * Attribute multiplicity upper
	 */
	upper: {api: "UpperBound"},
	
	/**
	 * Attribute visibility
	 */
	visibility: {api: "Visibility"}
});

include("Ea.AttributeTag@Ea.Types.Element.Feature");
include("Ea.AttributeConstraint@Ea.Types.Element.Feature");
