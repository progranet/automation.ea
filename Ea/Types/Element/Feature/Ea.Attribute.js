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

Ea.Attribute = {};

Ea.Attribute._Base = extend(Ea.TypedElement.Feature, {},
{
	api: "Attribute",
	
	_id: attribute({api: "AttributeID", type: Number, id: "id"}),
	_guid: attribute({api: "AttributeGUID", id: "guid"}),
	_styleEx: attribute({api: "StyleEx", type: Ea.DataTypes.Map, private: true}),
	_tags: attribute({api: "TaggedValues", type: "Ea.Collection.Map", elementType: "Ea.AttributeTag._Base", key: "this.getName()", value: "this", aggregation: "composite"}),
	_constraints: attribute({api: "Constraints", type: "Ea.Collection._Base", elementType: "Ea.AttributeConstraint._Base", aggregation: "composite"}),
	_position: attribute({api: "Pos", type: Number}),
	
	getType: function(source) {
		var stereotype = this._stereotype.get(source);
		if (stereotype == "enum")
			return Ea.Attribute.EnumerationLiteral;
		return Ea.Attribute.Attribute;
	}
});

Ea.Attribute.EnumerationLiteral = extend(Ea.Attribute._Base);

Ea.Attribute.Attribute = extend(Ea.Attribute._Base, {}, 
{
	_classifier: attribute({api: "ClassifierID", type: "Ea.Element.Type", referenceBy: "id", private: true}),
	_primitiveType: attribute({api: "Type", private: true}),
	_default: attribute({api: "Default"}),
	_collection: attribute({api: "IsCollection", type: Boolean}),
	_const: attribute({api: "IsConst", type: Boolean}),
	_derived: attribute({api: "IsDerived", type: Boolean}),
	_ordered: attribute({api: "IsOrdered", type: Boolean}),
	_static: attribute({api: "IsStatic", type: Boolean}),
	_lower: attribute({api: "LowerBound"}),
	_upper: attribute({api: "UpperBound"}),
	_visibility: attribute({api: "Visibility"})
});

Ea.register("Ea.AttributeTag@Ea.Types.Element.Feature", 34);
Ea.register("Ea.AttributeConstraint@Ea.Types.Element.Feature", 33);
