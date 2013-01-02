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
		var dimension = new Ea.DataTypes.Dimension({
			left: this._getLeft(),
			top: -this._getTop(),
			right: this._getRight(),
			bottom: -this._getBottom()
		});
		return dimension;
	},
	
	getCalculated: function() {

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
		return calculated;
	}
},
{
	meta: {
		//id: "InstanceID",
		api: "DiagramObject",
		objectType: 19
	},
	
	/**
	 * @type {Number}
	 */
	_id: property({api: "InstanceID"}),
	
	/**
	 * @type {Ea.Element._Base}
	 */
	_element: property({api: "ElementID", referenceBy: "id"}),
	
	/**
	 * @type {Number}
	 * @private
	 */
	_left: property({api: "Left"}),
	
	/**
	 * @type {Number}
	 * @private
	 */
	_top: property({api: "Top"}),
	
	/**
	 * @type {Number}
	 * @private
	 */
	_right: property({api: "Right"}),
	
	/**
	 * @type {Number}
	 * @private
	 */
	_bottom: property({api: "Bottom"}),
	
	/**
	 * @type {Ea.DataTypes.Map}
	 */
	_style: property({api: "Style"}),
	
	/**
	 * @type {Number}
	 */
	_sequence: property({api: "Sequence"}),
	
	/**
	 * @type {Ea.DataTypes.Dimension}
	 * @derived
	 */
	_dimension: property()
});

