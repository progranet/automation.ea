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

Ea.Scenario = {};

Ea.Scenario._Base = extend(Ea.Types.Namespace, {},
{
	api: "Scenario",

	getType: function(source) {
		return this._deriveType(source, this._type);
	},

	_type: attribute({api: "Type"}),
	_notes: attribute({api: "Notes"}),

	_guid: attribute({api: "ScenarioGUID", id: "guid"}),
	_steps: attribute({api: "Steps", type: "Ea.Collection._Base", elementType: "Ea.ScenarioStep._Base", key: "this.getPos()", aggregation: "composite"})
	
});

Ea.Scenario.BasicPath = extend(Ea.Scenario._Base, {});

Ea.register("Ea.ScenarioExtension@Ea.Types.Element.Scenario", 55);
Ea.register("Ea.ScenarioStep@Ea.Types.Element.Scenario", 54);
