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

Ea.Constraint = {};

Ea.Constraint._Base = extend(Ea.Named, {},
{
	api: "Constraint",
	
	getType: function(source) {
		var typeName = this._type.get(source).replace(/-/g,"");
		var type = this.namespace[typeName];
		if (!type) {
			type = this.namespace._Base;
		}
		return type;
	},
	_type: new Ea.Helper.Property({api: "Type"})
});

// TODO remove following backward compatibility
Ea.Constraint.Precondition = extend(Ea.Constraint._Base, {});
Ea.Constraint.Postcondition = extend(Ea.Constraint._Base, {});
Ea.Constraint.Invariant = extend(Ea.Constraint._Base, {});