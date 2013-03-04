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

Ea.Diagram = {
	meta: {
		id: "DiagramID",
		guid: "DiagramGUID",
		objectType: 8
	},

	Margin: {
		LEFT: 25,
		TOP: 35,
		RIGHT: 35,
		BOTTOM: 25
	},
	MarginLanes: {
		LEFT: 20,
		TOP: 30,
		RIGHT: 20,
		BOTTOM: 10
	}
};

Ea.Diagram._Base = extend(Ea.Types.Namespace, {

	getParent: function() {
		return this._getParent() || this._getPackage();
	},
	
	save: function(path, reuse) {
		/*
		var fileDate = new Sys.IO.File(path).getCreated();
		if (!reuse || (!fileDate || fileDate.valueOf() <= this.getModified())) {

		}
		*/
		this._source.application.getProject().saveDiagram(this, path);
		this._source.application.getRepository().closeDiagram(this);
		return true;
	},
	
	getSwimlanes: function(filter) {
		return this.getSwimlaneDef().getSwimlanes().filter(filter);
	},
	
	getDimension: function() {
		
		var dimension = {
			right: 0,
			bottom: 0,
			width: 240,
			height: 150
		};
		var views = new Core.Types.Collection();
		
		views.addAll(this.getElementViews());
		views.addAll(this.getConnectorViews());

		views.forEach(function(view) {
			var viewDimension = view.getDimension();
			if (viewDimension) {
				dimension.left = dimension.left !== undefined ? Math.min(dimension.left, viewDimension.left) : viewDimension.left;
				dimension.top = dimension.top !== undefined ? Math.min(dimension.top, viewDimension.top) : viewDimension.top;
				dimension.right = Math.max(dimension.right, viewDimension.right);
				dimension.bottom = Math.max(dimension.bottom, viewDimension.bottom);
			}
		});
		var margin;
		var swimlanes = this.getSwimlanes();
		if (swimlanes.notEmpty()) {
			dimension.left = 0;
			dimension.top = 0;
			var left = 0;
			swimlanes.forEach(function(swimlane) {
				var right = left + swimlane.getWidth();
				dimension.right = Math.max(dimension.right, right);
				left = right;
			});
			dimension.bottom = dimension.bottom + 40;
			margin = Ea.Diagram.MarginLanes;
		}
		else {
			margin = Ea.Diagram.Margin;
		}
		dimension.width = dimension.right - dimension.left + margin.LEFT + margin.RIGHT;
		dimension.height = dimension.bottom - dimension.top + margin.TOP + margin.BOTTOM;
		dimension.correctionX = -dimension.left + margin.LEFT;
		dimension.correctionY = -dimension.top + margin.TOP;

		return dimension;
	},
	
	getCalculated: function(maxWidth, maxHeight) {
		var dimension = this.getDimension();
		var scale;
		var calculated = {
			scale: scale = Math.min((maxWidth && dimension.width > maxWidth) ? maxWidth / dimension.width : 1, (maxHeight && dimension.height > maxHeight) ? maxHeight / dimension.height : 1),
			width: Math.round(dimension.width * scale),
			height: Math.round(dimension.height * scale)
		};
		// TODO: get rid of this:
		this.scaled = scale < 1;
		return calculated;
	},
	
	getElements: function(filter) {
		var elements = this._elements = new Core.Types.Collection();
		this.getElementViews().forEach(function(view) {
			elements.add(view.getElement());
		});			
		return this._elements.filter(filter);
	},
	
	getConnectorViews: function(filter) {
		var connectorViews = this._getConnectorViews().filter("this.getId() != 0");
		return connectorViews.filter(filter);
	}
},
{
	determineType: function(source) {
		return this._deriveType(source, this._type);
	},
	
	/**
	 * @type {Number}
	 */
	_id: property({api: "DiagramID"}),
	
	_guid: property({api: "DiagramGUID"}),
	
	_type: property({api: "Type"}),
	
	/**
	 * @private
	 */
	_metaType: property({api: "MetaType"}),
	
	_notes: property({api: "Notes"}),
	
	_stereotype: property({api: "Stereotype"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_style: property({api: "ExtendedStyle"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_styleEx: property({api: "StyleEx"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.DiagramObject._Base>}
	 * @aggregation composite
	 */
	_elementView: property({api: "DiagramObjects"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.DiagramLink._Base>}
	 * @private
	 */
	__connectorView: property({api: "DiagramLinks"}),
	
	/**
	 * @type {Core.Types.Collection<Ea.DiagramLink._Base>}
	 * @aggregation composite
	 * @derived
	 */
	_connectorView: property(),
		// collection filtered because of EA returns virtual connector views for Ea.Connector.Sequence with [id = 0]
	
	/**
	 * @type {Ea.Types.Namespace}
	 * @derived
	 */
	_parent: property(),

	/**
	 * @type {Ea.Element._Base}
	 * @private
	 */
	__parent: property({api: "ParentID", referenceBy: "id"}),
	
	/**
	 * @type {Ea.Package._Base}
	 * @private
	 */
	_package: property({api: "PackageID", referenceBy: "id"}),
	
	/**
	 * @type {Ea.SwimlaneDef._Base}
	 * @aggregation composite
	 */
	_swimlaneDef: property({api: "SwimlaneDef"}),
	
	/**
	 * @type {Core.Types.Collection<Ea.Swimlane._Base>}
	 * @derived
	 */
	_swimlane: property(),

	/**
	 * @type {Boolean}
	 */
	_highlightImports: property({api: "HighlightImports"}),
	
	/**
	 * @type {Boolean}
	 */
	_showDetails: property({api: "ShowDetails"}),
	
	/**
	 * @type {Boolean}
	 */
	_showPackageContents: property({api: "ShowPackageContents"}),
	
	/**
	 * @type {Boolean}
	 */
	_showPrivate: property({api: "ShowPrivate"}),
	
	/**
	 * @type {Boolean}
	 */
	_showProtected: property({api: "ShowProtected"}),
	
	/**
	 * @type {Boolean}
	 */
	_showPublic: property({api: "ShowPublic"}),

	/**
	 * @type {Ea.Connector._Base}
	 */
	_selectedConnector: property({api: "SelectedConnector"}),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 */
	_selectedElement: property({api: "SelectedObjects"}),
	
	_author: property({api: "Author"}),
	
	_version: property({api: "Version"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_created: property({api: "CreatedDate"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_modified: property({api: "ModifiedDate"}),
	
	/**
	 * @type {Object}
	 * @derived
	 */
	_dimension: property()
});

include("Ea.SwimlaneDef@Ea.Types.Diagram");

Ea.Diagram.View = extend(Ea.Types.Any, {
	
	_dimension: null,

	left: null,
	top: null,
	right: null,
	bottom: null,

	getParent: function() {
		return this._getParent();
	}
},
{
	/**
	 * @type {Ea.Types.Namespace}
	 * @derived
	 */
	_parent: property(),

	/**
	 * @type {Ea.Diagram._Base}
	 * @private
	 */
	__parent: property({api: "DiagramID", referenceBy: "id"})
});

include("Ea.DiagramLink@Ea.Types.Diagram");
include("Ea.DiagramObject@Ea.Types.Diagram");
