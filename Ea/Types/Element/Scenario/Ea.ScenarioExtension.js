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

Ea.ScenarioExtension = {
		meta: {
			guid: "ExtensionGUID",
			api: "ScenarioExtension",
			objectType: 55
		}
};

Ea.ScenarioExtension._Base = extend(Ea.Types.Any, {
	
	_toString: function() {
		return this.getLevel() + " [" + this._class + "]";
	}
},
{
	_guid: property({api: "ExtensionGUID"}),
	
	_pos: property({api: "Pos"}),
	
	_level: property({api: "Level"}),
	
	/**
	 * @type {Ea.ScenarioStep._Base}
	 */
	_joiningStep: property({api: "JoiningStep"}),
	
	/**
	 * @type {Ea.Scenario._Base}
	 */
	_scenario: property({api: "Scenario"})
});
