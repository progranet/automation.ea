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

Ea.ScenarioExtension = {};

Ea.ScenarioExtension._Base = extend(Ea.Named, {
	
	_joiningStep: undefined,
	getJoiningStep: function() {
		if (this._joiningStep === undefined || Ea.mm) {
			try {
				this._joiningStep = this._getJoiningStep();
			}
			catch (exception) {
				this._joiningStep = null;
			}
		}
		return this._joiningStep;
	}
},
{
	api: "ScenarioExtension",
	
	_pos: new Ea.Helper.Property({api: "Pos"}),
	_level: new Ea.Helper.Property({api: "Level"}),
	_joiningStep: new Ea.Helper.Reference({api: "JoiningStep", private: true, type: "Ea.ScenarioStep._Base"}),
	_scenario: new Ea.Helper.Reference({api: "Scenario", type: "Ea.Scenario._Base"})
});
