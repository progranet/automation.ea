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

Ea.DiagramObject = {
		meta: {
			//id: "InstanceID",
			objectType: 19
		}
};

Ea.DiagramObject._Base = extend(Ea.Diagram.View, {

	getDimension: function() {
		var dimension = new Ea._Base.DataTypes.Dimension({
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
		calculated = new Ea._Base.DataTypes.Dimension({
			left: Math.round((dimension.left + diagramDimension.correctionX) * diagramCalculated.scale),
			top: Math.round((dimension.top + diagramDimension.correctionY) * diagramCalculated.scale),
			right: Math.round((dimension.right + diagramDimension.correctionX) * diagramCalculated.scale),
			bottom: Math.round((dimension.bottom + diagramDimension.correctionY) * diagramCalculated.scale)
		});
		return calculated;
	}
},
{
	/**
	 * Element view id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	_id: property({api: "InstanceID"}),
	
	/**
	 * Element view element
	 * 
	 * @type {Ea.Element._Base}
	 */
	_element: property({api: "ElementID", referenceBy: "id"}),
	
	/**
	 * Element view left coordinate
	 * 
	 * @private
	 * @type {Number}
	 */
	_left: property({api: "Left"}),
	
	/**
	 * Element view top coordinate
	 * 
	 * @private
	 * @type {Number}
	 */
	_top: property({api: "Top"}),
	
	/**
	 * Element view right coordinate
	 * 
	 * @private
	 * @type {Number}
	 */
	_right: property({api: "Right"}),
	
	/**
	 * Element view bottom coordinate
	 * 
	 * @private
	 * @type {Number}
	 */
	_bottom: property({api: "Bottom"}),
	
	/**
	 * Element view style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_style: property({api: "Style"}), // TODO: http://www.sparxsystems.com/uml_tool_guide/sdk_for_enterprise_architect/diagramobjects.htm
	
	/**
	 * Element view sequence number
	 * 
	 * @type {Number}
	 */
	_sequence: property({api: "Sequence"}),
	
	/**
	 * Element view dimension
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.DataTypes.Dimension}
	 */
	_dimension: property()
});

