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
	meta: {
		objectType: 50
	},

	Orientation: {
		0: "Vertical",
		1: "Horizontal"
	}
};

Ea.SwimlaneDef._Base = extend(Ea.Types.Any, {
	
	getOrientation: function() {
		return Ea.SwimlaneDef.Orientation[this._getOrientation()];
	},
	
	setOrientation: function(orientation) {
		for (var i in Ea.SwimlaneDef.Orientation) {
			if (Ea.SwimlaneDef.Orientation[i] == orientation)
				return this._setOrientation(i);
		}
		throw new Error("Unknown orientation: " + orientation + " for swimlane definition: " + this);
	}
}, {},
{
	/**
	 * Swimlane definition bold switch value
	 * 
	 * @type {Boolean}
	 */
	bold: {api: "Bold"},
	
	/**
	 * Swimlane definition hide classifier switch value
	 * 
	 * @type {Boolean}
	 */
	hideClassifier: {api: "HideClassifier"},
	
	/**
	 * Swimlane definition hide names switch value
	 * 
	 * @type {Boolean}
	 */
	hideNames: {api: "HideNames"},
	
	/**
	 * Swimlane definition locked switch value
	 * 
	 * @type {Boolean}
	 */
	locked: {api: "Locked"},
	
	/**
	 * Swimlane definition font color
	 * 
	 * @type {Number}
	 */
	fontColor: {api: "FontColor"},
	
	/**
	 * Swimlane definition line color
	 * 
	 * @type {Number}
	 */
	lineColor: {api: "LineColor"},
	
	/**
	 * Swimlane definition line width
	 * 
	 * @type {Number}
	 */
	lineWidth: {api: "LineWidth"},
	
	/**
	 * Swimlane definition orientation
	 * 
	 * @private
	 */
	_orientation: {api: "Orientation"},
	
	/**
	 * Swimlane definition orientation
	 * 
	 * @derived
	 */
	orientation: {},
	
	/**
	 * Swimlane definition show in title bar switch value
	 * 
	 * @type {Boolean}
	 */
	showInTitleBar: {api: "ShowInTitleBar"},
	
	/**
	 * Swimlane definition swimlanes collection
	 * 
	 * @type {Ea.Swimlanes._Base<Ea.Swimlane._Base>}
	 * @qualifier {String} title
	 * @aggregation composite
	 */
	swimlanes: {api: "Swimlanes"}
});

include("Ea.Swimlanes@Ea.Types.Diagram");
