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
		return new Ea._Base.DataTypes.Dimension({
			left: this._getLeft(),
			top: -this._getTop(),
			right: this._getRight(),
			bottom: -this._getBottom()
		});
	},
	
	getCorrected: function(scale) {
		var dimension = this.getDimension().valueOf();
		var diagram = this.getDiagram();
		var diagramDimension = diagram.getDimension();
		calculated = new Ea._Base.DataTypes.Dimension({
			left: Math.round((dimension.left + diagramDimension.correctionX) * scale),
			top: Math.round((dimension.top + diagramDimension.correctionY) * scale),
			right: Math.round((dimension.right + diagramDimension.correctionX) * scale),
			bottom: Math.round((dimension.bottom + diagramDimension.correctionY) * scale)
		});
		return calculated;
	},
	
	/**
	 * @deprecated
	 */
	getCalculated: function() {
		var dimension = this.getDimension().valueOf();
		var diagram = this.getDiagram();
		var diagramDimension = diagram.getDimension();
		var diagramCalculated = diagram.getCalculated();
		calculated = new Ea._Base.DataTypes.Dimension({
			left: Math.round((dimension.left + diagramDimension.correctionX) * diagramCalculated.scale),
			top: Math.round((dimension.top + diagramDimension.correctionY) * diagramCalculated.scale),
			right: Math.round((dimension.right + diagramDimension.correctionX) * diagramCalculated.scale),
			bottom: Math.round((dimension.bottom + diagramDimension.correctionY) * diagramCalculated.scale)
		});
		return calculated;
	},
	
	getWidth: function() {
		return this._getRight() - this._getLeft();
	},
	
	setWidth: function(width) {
		this._setRight(this._getRight() + (width - this.getWidth()));
	},
	
	getHeight: function() {
		return - (this._getBottom() - this._getTop());
	},
	
	setHeight: function(height) {
		this._setBottom(this._getBottom() - (height - this.getHeight()));
	},
	
	getObject: function() {
		return this.getElement();
	}
},
{},
{
	/**
	 * Element view id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	id: {api: "InstanceID"},
	
	/**
	 * Element view element
	 * 
	 * @type {Ea.Element._Base}
	 */
	element: {api: "ElementID", referenceBy: "id"},
	
	/**
	 * View object
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Types.Any}
	 */
	object: {},
	
	/**
	 * Element view left coordinate
	 * 
	 * @private
	 * @type {Number}
	 */
	_left: {api: "Left"},
	
	/**
	 * Element view top coordinate
	 * 
	 * @private
	 * @type {Number}
	 */
	_top: {api: "Top"},
	
	/**
	 * Element view right coordinate
	 * 
	 * @private
	 * @type {Number}
	 */
	_right: {api: "Right"},
	
	/**
	 * Element view bottom coordinate
	 * 
	 * @private
	 * @type {Number}
	 */
	_bottom: {api: "Bottom"},
	
	/**
	 * Element view width
	 * 
	 * @derived
	 * @type {Number}
	 */
	width: {},
	
	/**
	 * Element view height
	 * 
	 * @derived
	 * @type {Number}
	 */
	height: {},
	
	/**
	 * Element view style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_style: {api: "Style"}, // TODO: http://www.sparxsystems.com/uml_tool_guide/sdk_for_enterprise_architect/diagramobjects.htm
	
	/**
	 * Element view sequence number
	 * 
	 * @type {Number}
	 */
	sequence: {api: "Sequence"},
	
	/**
	 * Element view dimension
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.DataTypes.Dimension}
	 */
	dimension: {}
});

