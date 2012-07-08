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

Ea.TypedElement = {
		
};

Ea.TypedElement._Base = extend(Ea.Types.Named, {

	_type: null,
	
	getType: function() {
		if (!this._type || Ea.mm) {
			this._type = this._getClassType();
			if (!this._type) {
				var name = this._getPrimitiveType();
				if (name) {
					this._type = new Ea.DataTypes.PrimitiveType(name);
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
	__type: derived({getter: "getType", type: Object})
});

Ea.TypedElement.Feature = extend(Ea.TypedElement._Base, {
	getParent: function() {
		return this._getParent();
	}
},
{
	_parent: attribute({api: "ParentID", type: "Ea.Element.Type", referenceBy: "id", private: true})
});

