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
	},
	
	setParent: function(parent) {
		return this._setParent(parent);
	},
	
	getCustomProperties: function() {
		return this._source.application.getRepository().getProperties(this);
	},
	
	getLower: function() {
		var properties = this.getCustomProperties();
		return properties ? properties.valueOf().lower.value : 1;
	},

	getUpper: function() {
		var properties = this.getCustomProperties();
		return properties ? properties.valueOf().upper.value : 1;
	},

	isOrdered: function() {
		var properties = this.getCustomProperties();
		return properties ? properties.valueOf().isOrdered.value != 0 : false;
	},

	isUnique: function() {
		var properties = this.getCustomProperties();
		return properties ? properties.valueOf().isUnique.value != 0 : false;
	}
},
{
	/**
	 * Parameter guid
	 */
	_guid: property({api: "ParameterGUID"}),
	
	/**
	 * Parameter alias
	 */
	_alias: property({api: "Alias"}),
	
	/**
	 * Parameter notes
	 */
	_notes: property({api: "Notes"}),

	/**
	 * Parameter classifier
	 * 
	 * @private
	 * @type {Ea.Element.Type}
	 */
	_classifier: property({api: "ClassifierID", referenceBy: "id"}),
	
	/**
	 * Parameter data type
	 * 
	 * @private
	 */
	_primitiveType: property({api: "Type"}),
	
	/**
	 * Parameter default value
	 */
	_default: property({api: "Default"}),
	
	/**
	 * Parameter const switch value
	 * 
	 * @type {Boolean}
	 */
	_const: property({api: "IsConst"}),
	
	/**
	 * Parameter kind
	 */
	_kind: property({api: "Kind"}),
	
	/**
	 * Parameter position in list of method parameters
	 * 
	 * @type {Number}
	 */
	_position: property({api: "Position"}),
	
	/**
	 * Parameter style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_style: property({api: "Style"}),
	
	/**
	 * Parameter extended style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_styleEx: property({api: "StyleEx"}),

	/**
	 * Parameter parent
	 * 
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	_parent: property(),

	/**
	 * Parameter parent method
	 * 
	 * @private
	 * @readOnly
	 * @type {Ea.Method._Base}
	 */
	__parent: property({api: "OperationID", referenceBy: "id"}),

	/**
	 * Parameter tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.ParameterTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_tag: property({api: "TaggedValues"}),
	
	/**
	 * Parameter custom properties collection
	 * 
	 * @readOnly
	 * @derived
	 * @type {Ea._Base.DataTypes.Properties}
	 */
	_customProperties: property(),
	
	/**
	 * Parameter multiplicity lower
	 * 
	 * @readOnly
	 * @derived
	 */
	_lower: property(),
	
	/**
	 * Parameter multiplicity upper
	 * 
	 * @readOnly
	 * @derived
	 */
	_upper: property(),
	
	/**
	 * Parameter ordered switch value
	 * 
	 * @readOnly
	 * @derived
	 * @type {Boolean}
	 */
	_ordered: property(),
	
	/**
	 * Parameter unique switch value
	 * 
	 * @readOnly
	 * @derived
	 * @type {Boolean}
	 */
	_unique: property()
});

include("Ea.ParameterTag@Ea.Types.Element.Feature");
