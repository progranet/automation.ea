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

Ea.Method._Base = extend(Ea.Feature, {

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
	}
},
{
	api: "Method",
	_id: new Ea.Helper.Property({api: "MethodID", type: Number}),
	_guid: new Ea.Helper.Property({api: "AttributeGUID"}),
	//_parent: new Ea.Helper.ReferenceById({api: "ParentID"}),
	_parameters: new Ea.Helper.Collection({api: "Parameters", elementType: "Ea.Parameter._Base"}),
	_classType: new Ea.Helper.ReferenceById({api: "ClassifierID", type: "Ea.Element.Type", private: true}),
	_primitiveType: new Ea.Helper.Property({api: "ReturnType", private: true})
});

Ea.register("Ea.Parameter@Ea.Types.Element.Feature", 25);
