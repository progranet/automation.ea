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

	_guid: property({api: "StepGUID"}), // GUID is not unique for ScenarioStep!
	
	_pos: property({api: "Pos"}),
	
	_level: property({api: "Level"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.ScenarioExtension._Base>}
	 * @qualifier {String} level
	 * @private
	 */
	_extension: property({api: "Extensions"}),
	
	/**
	 * @private
	 */
	__type: property({api: "StepType"}),
	
	/**
	 * @type {Ea.Element.UseCase}
	 * @private
	 */
	_link: property({api: "Link", referenceBy: "guid"}),
	
	_uses: property({api: "Uses"}),
	
	_results: property({api: "Results"})
});

Ea.ScenarioStep.Actor = extend(Ea.ScenarioStep._Base);
Ea.ScenarioStep.System = extend(Ea.ScenarioStep._Base);
