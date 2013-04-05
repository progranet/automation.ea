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
	
	setParent: function(parent) {
		if (parent.instanceOf(Ea.Package._Base)) {
			this._setPackage(parent);
			this._setParent(null);
		}
		else if (parent.instanceOf(Ea.Element._Base)) {
			this._setPackage(parent._getPackage());
			this._setParent(parent);
		}
		else {
			throw new Error("Illegal parent type for Diagram: " + parent);
		}
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
			if (view.getDimension()) {
				var viewDimension = view.getDimension().valueOf();
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
	},
	
	createConnectorView: function(name, type) {
		return this._createConnectorView(name, type);
	},
	
	deleteConnectorView: function(connectorView) {
		return this._deleteConnectorView(connectorView);
	},
	
	reload: function() {
		this._source.application.getRepository().reloadDiagram(this);
	},
	
	update: function() {
		_super.update();
		this.reload();
	}
},
{
	determineType: function(source) {
		return this._deriveType(source, this._type);
	},
	
	/**
	 * Diagram id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	_id: property({api: "DiagramID"}),
	
	/**
	 * Diagram guid
	 * 
	 * @readOnly
	 */
	_guid: property({api: "DiagramGUID"}),
	
	/**
	 * Diagram type
	 * 
	 * @readOnly
	 */
	_type: property({api: "Type"}),
	
	/**
	 * Diagram meta type
	 * 
	 * @private
	 * @readOnly
	 */
	_metaType: property({api: "MetaType"}),
	
	/**
	 * Diagram notes
	 */
	_notes: property({api: "Notes"}),
	
	/**
	 * Diagram stereotype
	 */
	_stereotype: property({api: "Stereotype"}),
	
	/**
	 * Diagram style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_style: property({api: "ExtendedStyle"}),
	
	/**
	 * Diagram extended style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_styleEx: property({api: "StyleEx"}),
	
	/**
	 * Diagram element views collection
	 * 
	 * @type {Ea.Collection._Base<Ea.DiagramObject._Base>}
	 * @aggregation composite
	 */
	_elementView: property({api: "DiagramObjects"}),
	
	/**
	 * Diagram connector views collection
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.DiagramLink._Base>}
	 */
	__connectorView: property({api: "DiagramLinks"}),
	
	/**
	 * Diagram connector views collection
	 * 
	 * @derived
	 * @type {Core.Types.Collection<Ea.DiagramLink._Base>}
	 * @aggregation composite
	 */
	_connectorView: property(),
		// collection filtered because of EA returns virtual connector views for Ea.Connector.Sequence with [id = 0]
	
	/**
	 * Diagram parent
	 * 
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	_parent: property(),

	/**
	 * Diagram parent element
	 * 
	 * @private
	 * @type {Ea.Element._Base}
	 */
	__parent: property({api: "ParentID", referenceBy: "id"}),
	
	/**
	 * Diagram package
	 * 
	 * @private
	 * @type {Ea.Package._Base}
	 */
	_package: property({api: "PackageID", referenceBy: "id"}),
	
	/**
	 * Diagram swimlanes definition
	 * 
	 * @type {Ea.SwimlaneDef._Base}
	 * @aggregation composite
	 */
	_swimlaneDef: property({api: "SwimlaneDef"}),
	
	/**
	 * Diagram swimlanes
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea.Swimlane._Base>}
	 */
	_swimlane: property(),

	/**
	 * Diagram highlight imports switch value
	 * 
	 * @type {Boolean}
	 */
	_highlightImports: property({api: "HighlightImports"}),
	
	/**
	 * Diagram show details switch value
	 * 
	 * @type {Boolean}
	 */
	_showDetails: property({api: "ShowDetails"}),
	
	/**
	 * Diagram  show package contents switch value
	 * 
	 * @type {Boolean}
	 */
	_showPackageContents: property({api: "ShowPackageContents"}),
	
	/**
	 * Diagram show private switch value
	 * 
	 * @type {Boolean}
	 */
	_showPrivate: property({api: "ShowPrivate"}),
	
	/**
	 * Diagram show protected switch value
	 * 
	 * @type {Boolean}
	 */
	_showProtected: property({api: "ShowProtected"}),
	
	/**
	 * Diagram show public switch value
	 * 
	 * @type {Boolean}
	 */
	_showPublic: property({api: "ShowPublic"}),

	/**
	 * Diagram selected connector
	 * 
	 * @type {Ea.Connector._Base}
	 */
	_selectedConnector: property({api: "SelectedConnector"}),
	
	/**
	 * Diagram selected elements collection
	 * 
	 * @readOnly
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 */
	_selectedElement: property({api: "SelectedObjects"}), // TODO: add/remove elements to collection (not the same as create/delete in this case)
	
	/**
	 * Diagram author
	 */
	_author: property({api: "Author"}),
	
	/**
	 * Diagram version
	 */
	_version: property({api: "Version"}),
	
	/**
	 * Diagram creation date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_created: property({api: "CreatedDate"}),
	
	/**
	 * Diagram modification date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_modified: property({api: "ModifiedDate"}),
	
	/**
	 * Diagram dimension
	 * 
	 * @derived
	 * @readOnly
	 * @type {Object}
	 */
	_dimension: property()
});

include("Ea.SwimlaneDef@Ea.Types.Diagram");

Ea.Diagram.View = extend(Ea.Types.Any, {
	
	_dimension: null,

	left: null,
	top: null,
	right: null,
	bottom: null},
{
	/**
	 * View parent diagram
	 * 
	 * @type {Ea.Diagram._Base}
	 */
	_parent: property({api: "DiagramID", referenceBy: "id"})
});

include("Ea.DiagramLink@Ea.Types.Diagram");
include("Ea.DiagramObject@Ea.Types.Diagram");
