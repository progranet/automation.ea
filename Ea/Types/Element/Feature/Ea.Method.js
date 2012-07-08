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

Ea.Method = {};

Ea.Method._Base = extend(Ea.TypedElement.Feature, {},
{
	api: "Method",
	_id: attribute({api: "MethodID", type: Number, id: "id"}),
	_guid: attribute({api: "MethodGUID", id: "guid"}),
	_position: attribute({api: "Pos", type: Number}),
	_parameters: attribute({api: "Parameters", type: "Ea.Collection._Base", elementType: "Ea.Parameter._Base", aggregation: "composite"}),
	_taggedValues: attribute({api: "TaggedValues", type: "Ea.Collection.Map", elementType: "Ea.MethodTag._Base", key: "this.getName()", value: "this", aggregation: "composite"}),
	_classType: attribute({api: "ClassifierID", type: "Ea.Element.Type", referenceBy: "id", private: true}),
	_primitiveType: attribute({api: "ReturnType", private: true})
});

Ea.register("Ea.Parameter@Ea.Types.Element.Feature", 25);
Ea.register("Ea.MethodTag@Ea.Types.Element.Feature", 36);
