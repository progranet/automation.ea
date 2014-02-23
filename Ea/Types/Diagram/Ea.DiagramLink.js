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

Ea.DiagramLink = {
	meta: {
		//id: "InstanceID",
		objectType: 20
	}
};

Ea.DiagramLink._Base = extend(Ea.Diagram.View, {

	getDimension: function() {
		var coords = this._getPath();
		if (!coords)
			return null;
		dimension = {
			right: 0,
			bottom: 0,
			left: null,
			top: null
		};
		var coordst = coords.split(";");
		for (var c = 0; c < coordst.length; c++) {
			if (coordst[c]) {
				var coord = coordst[c].split(":");
				dimension.left = dimension.left !== null ? Math.min(dimension.left, coord[0]) : coord[0];
				dimension.top = dimension.top !== null ? Math.min(dimension.top, -coord[1]) : -coord[1];
				dimension.right = Math.max(dimension.right, coord[0]);
				dimension.bottom = Math.max(dimension.bottom, -coord[1]);
			}
		}
		return new Ea._Base.DataTypes.Dimension({
			right: dimension.right,
			bottom: dimension.bottom,
			left: dimension.left,
			top: dimension.top
		});
	},
	
	getObject: function() {
		return this.getConnector();
	}
},
{},
{
	/**
	 * Connector view id.
	 * In some cases EA sets id to 0 (for example for messages in sequence diagrams) and not stores it in database.
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	id: {api: "InstanceID"},
	
	/**
	 * Connector view connector
	 * 
	 * @type {Ea.Connector._Base}
	 */
	connector: {api: "ConnectorID", referenceBy: "id"},
	
	/**
	 * View object
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea.Types.Any}
	 */
	object: {},
	
	/**
	 * Connector view path in diagram
	 * 
	 * @private
	 */
	_path: {api: "Path"},
	
	/**
	 * Connector view hidden switch value
	 * 
	 * @type {Boolean}
	 */
	hidden: {api: "IsHidden"},
	
	/**
	 * Connector view geometry
	 * 
	 * @type {Ea._Base.DataTypes.Map}
	 */
	geometry: {api: "Geometry"},
	
	/**
	 * Connector view style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_style: {api: "Style"},

	/**
	 * Connector view dimension
	 * 
	 * @derived
	 * @readOnly
	 * @type {Ea._Base.DataTypes.Dimension}
	 */
	dimension: {}
});
