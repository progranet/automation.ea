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

Ea.Method = {
		meta: {
			id: "MethodID",
			guid: "MethodGUID",
			objectType: 24		
		}
};

Ea.Method._Base = extend(Ea.TypedElement.Feature, {
	
	_getPrimitiveType: function() {
		var returnType = this._getReturnType();
		return returnType == "void" ? null : returnType;
	},
	
	_setPrimitiveType: function(typeName) {
		//typeName = typeName || "void";
		this._setReturnType(typeName);
	}
},
{
	/**
	 * Method id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	_id: property({api: "MethodID"}),
	
	/**
	 * Method guid
	 * 
	 * @readOnly
	 */
	_guid: property({api: "MethodGUID"}),
	
	/**
	 * Method abstract switch value
	 * 
	 * @type {Boolean}
	 */
	_abstract: property({api: "Abstract"}),
	
	/**
	 * Method behavior
	 */
	_behavior: property({api: "Behavior"}),
	
	/**
	 * Method code
	 */
	_code: property({api: "Code"}),
	
	/**
	 * Method concurrency
	 */
	_concurrency: property({api: "Concurrency"}),
	
	/**
	 * Method const switch value
	 * 
	 * @type {Boolean}
	 */
	_const: property({api: "IsConst"}),
	
	/**
	 * Method query switch value
	 * 
	 * @type {Boolean}
	 */
	_query: property({api: "IsQuery"}),
	
	/**
	 * Method static switch value
	 * 
	 * @type {Boolean}
	 */
	_static: property({api: "IsStatic"}),
	
	/**
	 * Method synchronized switch value
	 * 
	 * @type {Boolean}
	 */
	_synchronized: property({api: "IsSynchronized"}),
	
	/**
	 * Method array switch value
	 * 
	 * @type {Boolean}
	 */
	_array: property({api: "ReturnIsArray"}),
	
	/**
	 * Method exceptions specification
	 */
	_throws: property({api: "Throws"}),
	
	/**
	 * Method visibility
	 */
	_visibility: property({api: "Visibility"}),
	
	/**
	 * Method position in tree model of project browser
	 * 
	 * @type {Number}
	 */
	_position: property({api: "Pos"}),
	
	/**
	 * Method parameters collection
	 * 
	 * @type {Ea.Collection._Base<Ea.Parameter._Base>}
	 * @aggregation composite
	 */
	_parameter: property({api: "Parameters"}),
	
	/**
	 * Method tags collection
	 * 
	 * @type {Ea.Collection.Map<Ea.MethodTag._Base>}
	 * @qualifier {String} name
	 * @aggregation composite
	 */
	_tag: property({api: "TaggedValues"}),
	
	/**
	 * Method preconditions collection
	 * 
	 * @type {Ea.Collection._Base<Ea.MethodConstraint._Base>}
	 * @aggregation composite
	 */
	_preCondition: property({api: "PreConditions"}),
	
	/**
	 * Method postcondition collection
	 * 
	 * @type {Ea.Collection._Base<Ea.MethodConstraint._Base>}
	 * @aggregation composite
	 */
	_postCondition: property({api: "PostConditions"}),
	
	/**
	 * Method classifier
	 * 
	 * @type {Ea.Element.Type}
	 * @private
	 */
	_classifier: property({api: "ClassifierID", referenceBy: "id"}),
	
	/**
	 * Method return type
	 * 
	 * @private
	 */
	_returnType: property({api: "ReturnType"})
});

include("Ea.Parameter@Ea.Types.Element.Feature");
include("Ea.MethodTag@Ea.Types.Element.Feature");
include("Ea.MethodConstraint@Ea.Types.Element.Feature");
