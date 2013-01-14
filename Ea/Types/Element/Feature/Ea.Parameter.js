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

Ea.Parameter = {
		meta: {
			//guid: "ParameterGUID",
			objectType: 25
		}
};

Ea.Parameter._Base = extend(Ea.TypedElement._Base, {
	getParent: function() {
		return this._getParent();
	}
},
{
	_guid: property({api: "ParameterGUID"}),
	
	_alias: property({api: "Alias"}),
	
	_notes: property({api: "Notes"}),
	
	_stereotype: property({api: "Stereotype"}),

	/**
	 * @type {Ea.Element.Type}
	 * @private
	 */
	_classifier: property({api: "ClassifierID", referenceBy: "id"}),
	
	/**
	 * @private
	 */
	_primitiveType: property({api: "Type"}),
	
	_default: property({api: "Default"}),
	
	/**
	 * @type {Boolean}
	 */
	_const: property({api: "IsConst"}),
	
	_kind: property({api: "Kind"}),
	
	/**
	 * @type {Number}
	 */
	_position: property({api: "Position"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Map}
	 * @private
	 */
	_style: property({api: "Style"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Map}
	 * @private
	 */
	_styleEx: property({api: "StyleEx"}),

	/**
	 * @type {Ea.Types.Namespace}
	 * @derived
	 */
	_parent: property(),

	/**
	 * @type {Ea.Method._Base}
	 * @private
	 */
	__parent: property({api: "OperationID", referenceBy: "id"}),

	/**
	 * @type {Ea.Collection.Map<Ea.ParameterTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_tags: property({api: "TaggedValues"})

});

include("Ea.ParameterTag@Ea.Types.Element.Feature");
