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

Ea.Scenario._Base = extend(Ea.Types.Named, {},
{
	api: "Scenario",

	getType: function(source) {
		var typeName = this._type.get(source).replace(/\s/g,"");
		var type = this.namespace[typeName];
		if (!type) {
			type = this.namespace._Base;
		}
		return type;
	},

	_type: attribute({api: "Type"}),

	_guid: attribute({api: "ScenarioGUID"}),
	_steps: attribute({api: "Steps", type: "Ea.Collection._Base", elementType: "Ea.ScenarioStep._Base", key: "this.getPos()"})
	
});

//TODO remove following backward compatibility
Ea.Scenario.BasicPath = extend(Ea.Scenario._Base, {});
Ea.Scenario.Alternate = extend(Ea.Scenario._Base, {});
Ea.Scenario.Exception = extend(Ea.Scenario._Base, {});

Ea.register("Ea.ScenarioExtension@Ea.Types.Element.Scenario", 55);
Ea.register("Ea.ScenarioStep@Ea.Types.Element.Scenario", 54);
