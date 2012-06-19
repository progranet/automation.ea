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

Ea.Attribute._Base = extend(Ea.Feature, {},
{
	api: "Attribute",
	
	_id: new Ea.Helper.Property({api: "AttributeID", type: Number}),
	_guid: new Ea.Helper.Property({api: "AttributeGUID"}),
	//_parent: new Ea.Helper.ReferenceById({api: "ParentID"}),
	_alias: new Ea.Helper.Property({api: "Style"}),
	_styleEx: new Ea.Helper.Property({api: "StyleEx", private: true}),
	
	getType: function(source) {
		var owner = this._parent.get(source);
		if (owner.instanceOf(Ea.Element.Enumeration))
			return Ea.Attribute.EnumerationLiteral;
		return Ea.Attribute.Attribute;
	}
});

Ea.Attribute.EnumerationLiteral = extend(Ea.Attribute._Base);

Ea.Attribute.Attribute = extend(Ea.Attribute._Base, {

	_type: null,
	getType: function() {
		if (!this._type || Ea.mm) {
			this._type = this._getClassType();
			if (!this._type) {
				var name = this._getPrimitiveType();
				if (name) {
					this._type = new Ea.PrimitiveType(name);
				}
			}
		}
		return this._type;
	},

	_toString: function() {
		return this.getName() + " :" + this.getType() + " [" + this._class  + "]";
	}
}, 
{
	_classType: new Ea.Helper.ReferenceById({api: "ClassifierID", type: "Ea.Element.Type", private: true}),
	_primitiveType: new Ea.Helper.Property({api: "Type", private: true}),
	_default: new Ea.Helper.Property({api: "Default"}),
	_collection: new Ea.Helper.Property({api: "IsCollection", type: Boolean}),
	_const: new Ea.Helper.Property({api: "IsConst", type: Boolean}),
	_derived: new Ea.Helper.Property({api: "IsDerived", type: Boolean}),
	_ordered: new Ea.Helper.Property({api: "IsOrdered", type: Boolean}),
	_static: new Ea.Helper.Property({api: "IsStatic", type: Boolean}),
	_lower: new Ea.Helper.Property({api: "LowerBound"}),
	_upper: new Ea.Helper.Property({api: "UpperBound"}),
	_visibility: new Ea.Helper.Property({api: "Visibility"})
});
