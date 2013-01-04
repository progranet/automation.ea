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

Ea.Scenario._Base = extend(Ea.Types.Namespace, {
	
	getContext: function() {
		
		var rows = this._source.application.getRepository().findByQuery("t_objectscenarios", "ea_guid", "\"" + this.getGuid() + "\"");
		var row = rows[0];
		
		var dom = new ActiveXObject("MSXML2.DOMDocument");
		dom.validateOnParse = false;
		dom.async = false;
		
		var xml = row["XMLContent"];
		var parsed = dom.loadXML(xml);

		var context = {};

		if (!parsed) {
			warn("Error while XML parsing scenario content: " + xml + " " + this.getGuid());
		}
		else {
			var nodes = dom.selectNodes("//path/context/item");
			for (var ni = 0; ni < nodes.length; ni++) {
				var node = nodes[ni];
				context[node.getAttribute("oldname")] = this._source.application.getRepository().getByGuid(Ea.Element._Base, node.getAttribute("guid"));
			}
		}
		return context;
	}
},
{
	meta: {
		guid: "ScenarioGUID",
		api: "Scenario",
		objectType: 10
	},

	determineType: function(source) {
		return this._deriveType(source, this._type);
	},

	_type: property({api: "Type"}),
	
	_notes: property({api: "Notes"}),

	_guid: property({api: "ScenarioGUID"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.ScenarioStep._Base>}
	 * @qualifier this.getPos()
	 * @aggregation composite
	 */
	_steps: property({api: "Steps"}),
	
	/**
	 * @type {Object}
	 * @derived
	 */
	_context: property()
});

Ea.Scenario.BasicPath = extend(Ea.Scenario._Base, {});

include("Ea.ScenarioExtension@Ea.Types.Element.Scenario");
include("Ea.ScenarioStep@Ea.Types.Element.Scenario");
