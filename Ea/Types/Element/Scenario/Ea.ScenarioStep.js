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

Ea.ScenarioStep = {
	StepType: {
		0: "System",
		1: "Actor"
	}
};

Ea.ScenarioStep._Base = extend(Ea.Named, {

	getStepType: function() {
		return Ea.ScenarioStep.StepType[this._getStepType()];
	}
	
},
{
	api: "ScenarioStep",
	
	__guid: new Ea.Helper.Property({api: "StepGUID"}),
	_pos: new Ea.Helper.Property({api: "Pos"}),
	_level: new Ea.Helper.Property({api: "Level"}),
	_extensions: new Ea.Helper.Collection({api: "Extensions", elementType: "Ea.ScenarioExtension._Base", key: "this.getLevel()", private: true}),
	_stepType: new Ea.Helper.Property({api: "StepType", private: true}),
	_link: new Ea.Helper.ReferenceByGuid({api: "Link", type: "Ea.Element.UseCase"}),
	_uses: new Ea.Helper.Property({api: "Uses"}),
	_results: new Ea.Helper.Property({api: "Results"})
});
