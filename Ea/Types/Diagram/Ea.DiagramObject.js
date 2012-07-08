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

Ea.DiagramObject = {};

Ea.DiagramObject._Base = extend(Ea.View, {

	_dimension: null,
	getDimension: function() {
		if (!this._dimension || Ea.mm) {
			this._dimension = {
				left: this.getLeft(),
				top: -this.getTop(),
				right: this.getRight(),
				bottom: -this.getBottom()
			};
		}
		return this._dimension;
	},
	
	_calculated: null,
	getCalculated: function() {
		if (!this._calculated || Ea.mm) {
			var dimension = this.getDimension();
			var diagram = this.getDiagram();
			var dd = diagram.getDimension();
			var dc = diagram.getCalculated();
			this._calculated = {
				left: Math.round((dimension.left + dd.correctionX) * dc.scale),
				top: Math.round((dimension.top + dd.correctionY) * dc.scale),
				right: Math.round((dimension.right + dd.correctionX) * dc.scale),
				bottom: Math.round((dimension.bottom + dd.correctionY) * dc.scale)
			};
		}
		return this._calculated;
	}
},
{
	api: "DiagramObject",
	
	_id: attribute({api: "InstanceID", type: Number, id: "id"}),
	_element: attribute({api: "ElementID", type: "Ea.Element._Base", referenceBy: "id"}),
	_left: attribute({api: "Left", type: Number}),
	_top: attribute({api: "Top", type: Number}),
	_right: attribute({api: "Right", type: Number}),
	_bottom: attribute({api: "Bottom", type: Number}),
	_style: attribute({api: "Style", type: "Ea.DataTypes.Map"}),
	_sequence: attribute({api: "Sequence", type: Number}),
	
	_dimension: derived({getter: "getDimension", type: Object})
});

