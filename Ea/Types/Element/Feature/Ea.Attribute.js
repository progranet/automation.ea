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
	/**
	 * Attribute id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	_id: property({api: "AttributeID"}),
	
	/**
	 * Attribute guid
	 * 
	 * @readOnly
	 */
	_guid: property({api: "AttributeGUID"}),
	
	/**
	 * Attribute extended style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_styleEx: property({api: "StyleEx"}),
	
	/**
	 * Attribute tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.AttributeTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_tag: property({api: "TaggedValues"}),
	
	/**
	 * Attribute position in tree model of project browser. 
	 * 
	 * @type {Number}
	 */
	_position: property({api: "Pos"}),
	
	determineType: function(source) {
		var stereotype = this._stereotype.get(source);
		if (stereotype == "enum")
			return Ea.Attribute.EnumerationLiteral;
		return Ea.Attribute.Attribute;
	}
});

Ea.Attribute.EnumerationLiteral = extend(Ea.Attribute._Base, {

	/**
	 * Returns null
	 * 
	 * @type {Object}
	 */
	getType: function() {
		return null;
	},
	
	/**
	 * Throws exception
	 * 
	 * @param {Class} type
	 */
	setType: function(type) {
		throw new Error("Cannot set type od enumeration literal");
	},
	
	_toString: function() {
		return this.getName() + " [" + this._class  + "]";
	}
},
{
	/**
	 * Enumeration literal type.
	 * Contains null.
	 * 
	 * @derived
	 * @type {Core.Types.Object}
	 */
	_type: property()
});

Ea.Attribute.Attribute = extend(Ea.Attribute._Base, {}, 
{

	/**
	 * Attribute classifier
	 * 
	 * @private
	 * @type {Ea.Element.Type}
	 */
	_classifier: property({api: "ClassifierID", referenceBy: "id"}),
	
	/**
	 * Attribute constraints collection
	 * 
	 * @type {Ea.Collection._Base<Ea.AttributeConstraint._Base>}
	 * @aggregation composite
	 */
	_constraint: property({api: "Constraints"}),
	
	/**
	 * Attribute data type
	 * 
	 * @private
	 */
	_primitiveType: property({api: "Type"}),
	
	
	/**
	 * Attribute default value
	 */
	_default: property({api: "Default"}),
	
	/**
	 * Attribute collection switch value
	 * 
	 * @type {Boolean}
	 */
	_collection: property({api: "IsCollection"}),
	
	/**
	 * Attribute read only switch value
	 * 
	 * @type {Boolean}
	 */
	_readOnly: property({api: "IsConst"}),
	
	/**
	 * Attribute derived switch value
	 * 
	 * @type {Boolean}
	 */
	_derived: property({api: "IsDerived"}),
	
	/**
	 * Attribute ordered switch value
	 * 
	 * @type {Boolean}
	 */
	_ordered: property({api: "IsOrdered"}),
	
	/**
	 * Attribute static switch value
	 * 
	 * @type {Boolean}
	 */
	_static: property({api: "IsStatic"}),
	
	/**
	 * Attribute allow duplicates switch value
	 * 
	 * @type {Boolean}
	 */
	_allowDuplicates: property({api: "AllowDuplicates"}),
	
	/**
	 * Attribute length
	 */
	_length: property({api: "Length"}),
	
	/**
	 * Attribute precision
	 */
	_precision: property({api: "Precision"}),
	
	/**
	 * Attribute scale
	 */
	_scale: property({api: "Scale"}),
	
	/**
	 * Attribute container
	 */
	_container: property({api: "Container"}),
	
	/**
	 * Attribute containment
	 */
	_containment: property({api: "Containment"}),
	
	/**
	 * Attribute multiplicity lower
	 */
	_lower: property({api: "LowerBound"}),
	
	/**
	 * Attribute multiplicity upper
	 */
	_upper: property({api: "UpperBound"}),
	
	/**
	 * Attribute visibility
	 */
	_visibility: property({api: "Visibility"})
});

include("Ea.AttributeTag@Ea.Types.Element.Feature");
include("Ea.AttributeConstraint@Ea.Types.Element.Feature");
