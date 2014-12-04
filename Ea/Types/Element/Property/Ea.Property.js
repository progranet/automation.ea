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

Ea.Property = {
	meta: {
		objectType: 49
	},

	PropertyType: {
		0: "String",
		1: "Integer",
		2: "FloatingPoint",
		3: "Boolean",
		4: "Enum",
		5: "Array"
	}
};

Ea.Property._Base = extend(Ea.Types.NamedElement, {},
{
	_deriveTypeName: function(source) {
		var typeName = Ea.Property.PropertyType[this.getProperty("_type").getApiValue(source.api)];
		return typeName;
	}
},
{
	/**
	 * Property type
	 * 
	 * @readOnly
	 * @private
	 */
	_type: {api: "Type"},
	
	/**
	 * Property validation specification
	 * 
	 * @readOnly
	 */
	validation: {api: "Validation"},
	
	/**
	 * Property value
	 */
	value: {api: "Value"}

});

Ea.Property.Enum = extend(Ea.Property._Base, {}, {},
{
	/**
	 * Property valid literal values list
	 * 
	 * @readOnly
	 * @type {Ea._Base.DataTypes.List}
	 * @separator ;
	 */
	literals: {api: "Validation"}
});
