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

	getDimension: function() {
		var dimension = this.fromCache("dimension");
		if (dimension === undefined) {
			dimension = new Ea.DataTypes.Dimension({
				left: this._getLeft(),
				top: -this._getTop(),
				right: this._getRight(),
				bottom: -this._getBottom()
			});
			this.toCache("dimension", dimension);
		}
		return dimension;
	},
	
	getCalculated: function() {

		var calculated = this.fromCache("calculated");
		if (calculated === undefined) {
			var dimension = this.getDimension();
			var diagram = this.getParent();
			var diagramDimension = diagram.getDimension();
			var diagramCalculated = diagram.getCalculated();
			calculated = new Ea.DataTypes.Dimension({
				left: Math.round((dimension.left + diagramDimension.correctionX) * diagramCalculated.scale),
				top: Math.round((dimension.top + diagramDimension.correctionY) * diagramCalculated.scale),
				right: Math.round((dimension.right + diagramDimension.correctionX) * diagramCalculated.scale),
				bottom: Math.round((dimension.bottom + diagramDimension.correctionY) * diagramCalculated.scale)
			});
			this.toCache("calculated", calculated);
		}
		return calculated;
	}
},
{
	api: "DiagramObject",
	
	_id: attribute({api: "InstanceID", type: Number, id: "id"}),
	_element: attribute({api: "ElementID", type: "Ea.Element._Base", referenceBy: "id"}),
	_left: attribute({api: "Left", type: Number, private: true}),
	_top: attribute({api: "Top", type: Number, private: true}),
	_right: attribute({api: "Right", type: Number, private: true}),
	_bottom: attribute({api: "Bottom", type: Number, private: true}),
	_style: attribute({api: "Style", type: Ea.DataTypes.Map}),
	_sequence: attribute({api: "Sequence", type: Number}),
	
	_dimension: derived({getter: "getDimension", type: Ea.DataTypes.Dimension})
});

