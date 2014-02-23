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
	
	getNamespace: function() {
		return this.getMethod();
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
}, {},
{
	/**
	 * Parameter guid
	 */
	guid: {api: "ParameterGUID"},
	
	/**
	 * Parameter alias
	 */
	alias: {api: "Alias"},
	
	/**
	 * Parameter notes
	 */
	notes: {api: "Notes"},

	/**
	 * Parameter classifier
	 * 
	 * @private
	 * @type {Ea.Element.Type}
	 */
	_classifier: {api: "ClassifierID", referenceBy: "id"},
	
	/**
	 * Parameter data type
	 * 
	 * @private
	 */
	_primitiveType: {api: "Type"},
	
	/**
	 * Parameter default value
	 */
	_default: {api: "Default"},
	
	/**
	 * Parameter const switch value
	 * 
	 * @type {Boolean}
	 */
	_const: {api: "IsConst"},
	
	/**
	 * Parameter kind
	 */
	kind: {api: "Kind"},
	
	/**
	 * Parameter position in list of method parameters
	 * 
	 * @type {Number}
	 */
	position: {api: "Position"},
	
	/**
	 * Parameter style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_style: {api: "Style"},
	
	/**
	 * Parameter extended style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_styleEx: {api: "StyleEx"},

	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},

	/**
	 * Parameter parent method
	 * 
	 * @readOnly
	 * @type {Ea.Method._Base}
	 */
	method: {api: "OperationID", referenceBy: "id"},

	/**
	 * Parameter tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.ParameterTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	tags: {api: "TaggedValues"},
	
	/**
	 * Parameter custom properties collection
	 * 
	 * @readOnly
	 * @derived
	 * @type {Ea._Base.DataTypes.Properties}
	 */
	customProperties: {},
	
	/**
	 * Parameter multiplicity lower
	 * 
	 * @readOnly
	 * @derived
	 */
	lower: {},
	
	/**
	 * Parameter multiplicity upper
	 * 
	 * @readOnly
	 * @derived
	 */
	upper: {},
	
	/**
	 * Parameter ordered switch value
	 * 
	 * @readOnly
	 * @derived
	 * @type {Boolean}
	 */
	ordered: {},
	
	/**
	 * Parameter unique switch value
	 * 
	 * @readOnly
	 * @derived
	 * @type {Boolean}
	 */
	unique: {}
});

include("Ea.ParameterTag@Ea.Types.Element.Feature");
