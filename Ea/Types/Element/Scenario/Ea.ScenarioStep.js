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

Ea.ScenarioStep._Base = extend(Ea.Types.Named, {
	
	getLink: function() {
		
		return this._getLink();
	}
	
},
{
	determineType: function(source) {
		var typeName = Ea.ScenarioStep.StepType[this.__type.get(source)];
		var type = this.namespace[typeName] || this._createType(typeName);
		return type;
	},

	/**
	 * Scenario step guid
	 */
	_guid: property({api: "StepGUID"}), // GUID is not unique for ScenarioStep!
	
	/**
	 * Scenario step position in scenario steps
	 */
	_pos: property({api: "Pos"}),
	
	/**
	 * Scenario step level
	 * 
	 * @readOnly
	 */
	_level: property({api: "Level"}),
	
	/**
	 * Scenario extensions collection beginning at scenario step 
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.ScenarioExtension._Base>}
	 * @qualifier {String} level
	 */
	_extension: property({api: "Extensions"}),
	
	/**
	 * Scenario step type
	 * 
	 * @private
	 */
	__type: property({api: "StepType"}),
	
	/**
	 * Scenario step linked element
	 * 
	 * @private
	 * @type {Ea.Element.UseCase}
	 */
	_link: property({api: "Link", referenceBy: "guid"}),
	
	/**
	 * Scenario step uses specification
	 */
	_uses: property({api: "Uses"}),
	
	/**
	 * Scenario step results specification
	 */
	_results: property({api: "Results"})
});

Ea.ScenarioStep.Actor = extend(Ea.ScenarioStep._Base);
Ea.ScenarioStep.System = extend(Ea.ScenarioStep._Base);
