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
	api: "SwimlaneDef",

	_bold: attribute({api: "Bold", type: Boolean}),
	_hideClassifier: attribute({api: "HideClassifier", type: Boolean}),
	_hideNames: attribute({api: "HideNames", type: Boolean}),
	_locked: attribute({api: "Locked", type: Boolean}),
	_fontColor: attribute({api: "FontColor", type: Number}),
	_lineColor: attribute({api: "LineColor", type: Number}),
	_lineWidth: attribute({api: "LineWidth", type: Number}),
	__orientation: attribute({api: "Orientation", private: true}),
	_orientation: derived({getter: "getOrientation"}),
	_showInTitleBar: attribute({api: "ShowInTitleBar", type: Boolean}),
	
	_swimlanes: attribute({api: "Swimlanes", type: "Ea.Swimlanes._Base", elementType: "Ea.Swimlane._Base", key: "this.getTitle()", value: "this", aggregation: "composite"})
});

Ea.register("Ea.Swimlanes@Ea.Types.Diagram", 51);
