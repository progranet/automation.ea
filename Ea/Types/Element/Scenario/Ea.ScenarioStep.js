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

Ea.ScenarioStep._Base = extend(Ea.Types.Named, {
	
	getLink: function() {
		
		return this._getLink();
	}
	
},
{
	api: "ScenarioStep",
	
	getType: function(source) {
		var typeName = Ea.ScenarioStep.StepType[this._type.get(source)];
		var type = this.namespace[typeName] || Ea.addType(this.namespace, typeName);
		return type;
	},

	_guid: attribute({api: "StepGUID"}), // GUID is not unique for ScenarioStep!
	_pos: attribute({api: "Pos"}),
	_level: attribute({api: "Level"}),
	_extensions: attribute({api: "Extensions", type: "Ea.Collection._Base", elementType: "Ea.ScenarioExtension._Base", key: "this.getLevel()", private: true}),
	_type: attribute({api: "StepType", private: true}),
	_link: attribute({api: "Link", type: "Ea.Element.UseCase", referenceBy: "guid", private: true}),
	_uses: attribute({api: "Uses"}),
	_results: attribute({api: "Results"})
});

Ea.ScenarioStep.Actor = extend(Ea.ScenarioStep._Base);
Ea.ScenarioStep.System = extend(Ea.ScenarioStep._Base);
