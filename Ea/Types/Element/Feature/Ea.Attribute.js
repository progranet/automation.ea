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
	 * @type {Number}
	 */
	_id: property({api: "AttributeID"}),
	
	_guid: property({api: "AttributeGUID"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Map}
	 * @private
	 */
	_styleEx: property({api: "StyleEx"}),
	
	/**
	 * @type {Ea.Collection.Map<Ea.AttributeTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_tag: property({api: "TaggedValues"}),
	
	/**
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
},{
	/**
	 * @type {Core.Types.Object}
	 * @derived
	 */
	_type: property()
});

Ea.Attribute.Attribute = extend(Ea.Attribute._Base, {}, 
{

	/**
	 * @type {Ea.Element.Type}
	 * @private
	 */
	_classifier: property({api: "ClassifierID", referenceBy: "id"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.AttributeConstraint._Base>}
	 * @aggregation composite
	 */
	_constraint: property({api: "Constraints"}),
	
	/**
	 * @private
	 */
	_primitiveType: property({api: "Type"}),
	
	_default: property({api: "Default"}),
	
	/**
	 * @type {Boolean}
	 */
	_collection: property({api: "IsCollection"}),
	
	/**
	 * @type {Boolean}
	 */
	_const: property({api: "IsConst"}),
	
	/**
	 * @type {Boolean}
	 */
	_derived: property({api: "IsDerived"}),
	
	/**
	 * @type {Boolean}
	 */
	_ordered: property({api: "IsOrdered"}),
	
	/**
	 * @type {Boolean}
	 */
	_static: property({api: "IsStatic"}),
	
	/**
	 * @type {Boolean}
	 */
	_allowDuplicates: property({api: "AllowDuplicates"}),
	
	_length: property({api: "Length"}),
	
	_precision: property({api: "Precision"}),
	
	_scale: property({api: "Scale"}),
	
	_container: property({api: "Container"}),
	
	_containment: property({api: "Containment"}),
	
	_lower: property({api: "LowerBound"}),
	
	_upper: property({api: "UpperBound"}),
	
	_visibility: property({api: "Visibility"})
});

include("Ea.AttributeTag@Ea.Types.Element.Feature");
include("Ea.AttributeConstraint@Ea.Types.Element.Feature");
