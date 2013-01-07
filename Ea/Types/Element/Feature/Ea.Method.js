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
			api: "Method",
			objectType: 24		
		}
};

Ea.Method._Base = extend(Ea.TypedElement.Feature, {
	_getPrimitiveType: function() {
		var returnType = this._getReturnType();
		return returnType == "void" ? null : returnType;
	}
},
{
	/**
	 * @type {Number}
	 */
	_id: property({api: "MethodID"}),
	
	_guid: property({api: "MethodGUID"}),
	
	/**
	 * @type {Boolean}
	 */
	_abstract: property({api: "Abstract"}),
	
	_behavior: property({api: "Behavior"}),
	
	_code: property({api: "Code"}),
	
	_concurrency: property({api: "Concurrency"}),
	
	/**
	 * @type {Boolean}
	 */
	_const: property({api: "IsConst"}),
	
	/**
	 * @type {Boolean}
	 */
	_query: property({api: "IsQuery"}),
	
	/**
	 * @type {Boolean}
	 */
	_static: property({api: "IsStatic"}),
	
	/**
	 * @type {Boolean}
	 */
	_synchronized: property({api: "IsSynchronized"}),
	
	/**
	 * @type {Boolean}
	 */
	_array: property({api: "ReturnIsArray"}),
	
	_throws: property({api: "Throws"}),
	
	_visibility: property({api: "Visibility"}),
	
	/**
	 * @type {Number}
	 */
	_position: property({api: "Pos"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Parameter._Base>}
	 * @aggregation composite
	 */
	_parameters: property({api: "Parameters"}),
	
	/**
	 * @type {Ea.Collection.Map<Ea.MethodTag._Base>}
	 * @qualifier this.getName()
	 * @aggregation composite
	 */
	_tags: property({api: "TaggedValues"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.MethodConstraint._Base>}
	 * @aggregation composite
	 */
	_preConditions: property({api: "PreConditions"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.MethodConstraint._Base>}
	 * @aggregation composite
	 */
	_postConditions: property({api: "PostConditions"}),
	
	/**
	 * @type {Ea.Element.Type}
	 * @private
	 */
	_classifier: property({api: "ClassifierID", referenceBy: "id"}),
	
	/**
	 * @private
	 */
	_returnType: property({api: "ReturnType"})
});

include("Ea.Parameter@Ea.Types.Element.Feature");
include("Ea.MethodTag@Ea.Types.Element.Feature");
include("Ea.MethodConstraint@Ea.Types.Element.Feature");
