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

Ea.SwimlaneDef = {
	SwimlaneOrientation: {
		0: "Vertical",
		1: "Horizontal"
	}
};

Ea.SwimlaneDef._Base = extend(Ea.Types.Any, {
	
	getOrientation: function() {
		return Ea.SwimlaneDef.SwimlaneOrientation[this._getOrientation()];
	}
	
},
{
	meta: {
		api: "SwimlaneDef",
		objectType: 50
	},

	/**
	 * @type {Boolean}
	 */
	_bold: property({api: "Bold"}),
	
	/**
	 * @type {Boolean}
	 */
	_hideClassifier: property({api: "HideClassifier"}),
	
	/**
	 * @type {Boolean}
	 */
	_hideNames: property({api: "HideNames"}),
	
	/**
	 * @type {Boolean}
	 */
	_locked: property({api: "Locked"}),
	
	/**
	 * @type {Number}
	 */
	_fontColor: property({api: "FontColor"}),
	
	/**
	 * @type {Number}
	 */
	_lineColor: property({api: "LineColor"}),
	
	/**
	 * @type {Number}
	 */
	_lineWidth: property({api: "LineWidth"}),
	
	/**
	 * @private
	 */
	__orientation: property({api: "Orientation"}),
	
	/**
	 * @derived
	 */
	_orientation: property(),
	
	/**
	 * @type {Boolean}
	 */
	_showInTitleBar: property({api: "ShowInTitleBar"}),
	
	/**
	 * @type {Ea.Swimlanes._Base<Ea.Swimlane._Base>}
	 * @qualifier this.getTitle()
	 * @aggregation composite
	 */
	_swimlanes: property({api: "Swimlanes"})
});

include("Ea.Swimlanes@Ea.Types.Diagram");
