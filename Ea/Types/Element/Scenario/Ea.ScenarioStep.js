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
	meta: {
		objectType: 54
	},
	
	StepType: {
		0: "System",
		1: "Actor"
	}
};

Ea.ScenarioStep._Base = extend(Ea.Types.NamedElement, {
	
	getLink: function() {
		
		return this._getLink();
	}
	
},
{
	determineType: function(api) {
		var typeName = Ea.ScenarioStep.StepType[this.getProperty("_type").getApiValue(api)];
		var type = this.namespace[typeName] || this._createType(typeName);
		return type;
	}
},
{

	/**
	 * Scenario step guid
	 */
	guid: {api: "StepGUID"}, // GUID is not unique for ScenarioStep!
	
	/**
	 * Scenario step position in scenario steps
	 */
	pos: {api: "Pos"},
	
	/**
	 * Scenario step level
	 * 
	 * @readOnly
	 */
	level: {api: "Level"},
	
	/**
	 * Scenario extensions collection beginning at scenario step 
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.ScenarioExtension._Base>}
	 * @qualifier {String} level
	 */
	_extensions: {api: "Extensions"},
	
	/**
	 * Scenario step type
	 * 
	 * @private
	 */
	_type: {api: "StepType"},
	
	/**
	 * Scenario step linked element
	 * 
	 * @private
	 * @type {Ea.Element.UseCase}
	 */
	link: {api: "Link", referenceBy: "guid"},
	
	/**
	 * Scenario step uses specification
	 */
	uses: {api: "Uses"},
	
	/**
	 * Scenario step results specification
	 */
	results: {api: "Results"}
});

Ea.ScenarioStep.Actor = extend(Ea.ScenarioStep._Base);
Ea.ScenarioStep.System = extend(Ea.ScenarioStep._Base);
