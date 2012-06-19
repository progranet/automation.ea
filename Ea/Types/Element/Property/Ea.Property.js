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

Ea.Property = {};

Ea.Property._Base = extend(Ea.Named, {
	_toString: function() {
		return this.getName() + " = " + this.getValue();
	}
},
{
	api: "Property",
	_type: new Ea.Helper.Property({api: "Type"}),
	_validation: new Ea.Helper.Property({api: "Validation"}),
	_value: new Ea.Helper.Property({api: "Value"})

});

