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
	},
	
	Layout: {
		CycleRemove: {
			DFS: 1073741824,
			Greedy: -2147483648
		},
		Initialize: {
			DFSIn: 201326592,
			DFSOut: 67108864,
			Naive: 134217728
		},
		Layering: {
			LongestPathSink: 805306368,
			LongestPathSource: 536870912,
			OptimalLinkLength: 268435456
		},
		Direction: {
			Down: 131072,
			Left: 262144,
			Right: 524288,
			Up: 65536
		}
	}
	
};

Ea.Diagram._Base = extend(Ea.Types.Namespace, {

	getNamespace: function() {
		return this.getParent() || this.getPackage();
	},
	
	setNamespace: function(parent) {
		if (parent.instanceOf(Ea.Package._Base)) {
			this.setPackage(parent);
			this.setParent(null);
		}
		else if (parent.instanceOf(Ea.Element._Base)) {
			this.setPackage(parent.getPackage());
			this.setParent(parent);
		}
		else {
			throw new Error("Illegal parent type for Diagram: " + parent);
		}
	},
	
	/**
	 * @deprecated Use Ea.Diagram.saveToFile() and Ea.Diagram.close()
	 */
	save: function(path) {
		this.saveToFile(path);
		this.close();
	},
	
	saveToFile: function(path) {
		this._source.application.getProject().saveDiagram(this, path);
	},

	load: function() {
		this._source.application.getProject().loadDiagram(this);
	},
	
	open: function() {
		this._source.application.getRepository().openDiagram(this);
	},
	
	close: function() {
		this._source.application.getRepository().closeDiagram(this);
	},
	
	reload: function() {
		this._source.application.getRepository().reloadDiagram(this);
	},
	
	layout: function(style, iterations, saveAsDefault) {
		var numStyle = 0;
		if ("crossReduceAggressive" in style) {
			numStyle = numStyle + 33554432;
			delete style.crossReduceAggressive;
		}
		
		var layerSpacing = style.layerSpacing || 20;
		delete style.layerSpacing;
		
		var columnSpacing = style.columnSpacing || 20;
		delete style.columnSpacing;

		for (var variable in style) {
			var constantName = variable.substr(0, 1).toUpperCase() + variable.substr(1);
			if (constantName in Ea.Diagram.Layout) {
				if (style[variable] in Ea.Diagram.Layout[constantName]) {
					var constantValue = Ea.Diagram.Layout[constantName][style[variable]];
					numStyle = numStyle + constantValue;
				}
				else {
					warn("Not defined constant $ for diagram layout style $. Available constants: $", [style[variable], constantName, Ea.Diagram.Layout[constantName]]);
				}
			}
			else {
				warn("Not defined diagram layout style $", [constantName]);
			}
		}
		
		this._source.application.getProject().layoutDiagram(this, numStyle, iterations, layerSpacing, columnSpacing, saveAsDefault);
	},
	
	getSwimlanes: function(filter) {
		return this.getSwimlaneDef().getSwimlanes().filter(filter);
	},
	
	getDimension: function() {
		
		var dimension = {
			right: 0,
			bottom: 0,
			width: 240,
			height: 150,
			left: null,
			top: null
		};
		var views = new Core.Types.Collection();
		
		views.addAll(this.getElementViews());
		views.addAll(this.getConnectorViews());

		views.forEach(function(view) {
			if (view.getDimension()) {
				var viewDimension = view.getDimension().valueOf();
				dimension.left = dimension.left !== null ? Math.min(dimension.left, viewDimension.left) : viewDimension.left;
				dimension.top = dimension.top !== null ? Math.min(dimension.top, viewDimension.top) : viewDimension.top;
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
	
	getScale: function(maxWidth, maxHeight) {
		var dimension = this.getDimension();
		return Math.min((maxWidth && dimension.width > maxWidth) ? maxWidth / dimension.width : 1, (maxHeight && dimension.height > maxHeight) ? maxHeight / dimension.height : 1);
	},
	
	/**
	 * @deprecated
	 */
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
	
	update: function() {
		_super.update();
		this.reload();
	}
},
{
	_deriveTypeName: function(source) {
		var name = this.getProperty("_type").getApiValue(source.api).replace(/[-\s]/g,"");
		return name;
	}
},
{
	/**
	 * Diagram id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	id: {api: "DiagramID"},
	
	/**
	 * Diagram guid
	 * 
	 * @readOnly
	 */
	guid: {api: "DiagramGUID"},
	
	/**
	 * Diagram type
	 * 
	 * @private
	 * @readOnly
	 */
	_type: {api: "Type"},
	
	/**
	 * Diagram meta type
	 * 
	 * @private
	 * @readOnly
	 */
	_metaType: {api: "MetaType"},
	
	/**
	 * Diagram notes
	 */
	notes: {api: "Notes"},
	
	/**
	 * Diagram stereotype
	 */
	stereotype: {api: "Stereotype"},
	
	/**
	 * Diagram style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_style: {api: "ExtendedStyle"},
	
	/**
	 * Diagram extended style
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_styleEx: {api: "StyleEx"},
	
	/**
	 * Diagram element views collection
	 * 
	 * @type {Ea.Collection._Base<Ea.DiagramObject._Base>}
	 * @aggregation composite
	 */
	elementViews: {api: "DiagramObjects"},
	
	/**
	 * Diagram connector views collection
	 * 
	 * @type {Ea.Collection._Base<Ea.DiagramLink._Base>}
	 * @aggregation composite
	 */
	connectorViews: {api: "DiagramLinks"},
	
	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},

	/**
	 * Diagram parent element
	 * 
	 * @type {Ea.Element._Base}
	 */
	parent: {api: "ParentID", referenceBy: "id"},
	
	/**
	 * Diagram package
	 * 
	 * @type {Ea.Package._Base}
	 */
	package: {api: "PackageID", referenceBy: "id"},
	
	/**
	 * Diagram swimlanes definition
	 * 
	 * @type {Ea.SwimlaneDef._Base}
	 * @aggregation composite
	 */
	swimlaneDef: {api: "SwimlaneDef"},
	
	/**
	 * Diagram swimlanes
	 * 
	 * @derived
	 * @readOnly
	 * @type {Core.Types.Collection<Ea.Swimlane._Base>}
	 */
	swimlanes: {},

	/**
	 * Diagram highlight imports switch value
	 * 
	 * @type {Boolean}
	 */
	highlightImports: {api: "HighlightImports"},
	
	/**
	 * Diagram show details switch value
	 * 
	 * @type {Boolean}
	 */
	showDetails: {api: "ShowDetails"},
	
	/**
	 * Diagram  show package contents switch value
	 * 
	 * @type {Boolean}
	 */
	showPackageContents: {api: "ShowPackageContents"},
	
	/**
	 * Diagram show private switch value
	 * 
	 * @type {Boolean}
	 */
	showPrivate: {api: "ShowPrivate"},
	
	/**
	 * Diagram show protected switch value
	 * 
	 * @type {Boolean}
	 */
	showProtected: {api: "ShowProtected"},
	
	/**
	 * Diagram show public switch value
	 * 
	 * @type {Boolean}
	 */
	showPublic: {api: "ShowPublic"},

	/**
	 * Diagram selected connector
	 * 
	 * @type {Ea.Connector._Base}
	 */
	selectedConnector: {api: "SelectedConnector"},
	
	/**
	 * Diagram selected elements collection
	 * 
	 * @readOnly
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 */
	selectedElements: {api: "SelectedObjects"}, // TODO: add/remove elements to collection (not the same as create/delete in this case)
	
	/**
	 * Diagram author
	 */
	author: {api: "Author"},
	
	/**
	 * Diagram version
	 */
	version: {api: "Version"},
	
	/**
	 * Diagram creation date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	created: {api: "CreatedDate"},
	
	/**
	 * Diagram modification date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	modified: {api: "ModifiedDate"},
	
	/**
	 * Diagram dimension
	 * 
	 * @derived
	 * @readOnly
	 * @type {Object}
	 */
	dimension: {}
});

include("Ea.SwimlaneDef@Ea.Types.Diagram");

Ea.Diagram.View = extend(Ea.Types.NamedElement, {
	
	getNamespace: function() {
		return this.getDiagram();
	},
	
	setNamespace: function(namespace) {
		this.setDiagram(namespace);
	},
	
	getName: function() {
		return this.getObject().getName() + "@" + this.getDiagram().getName();
	},
	
	setName: function(name) {
		throw new Error("Setting name of view is not supported");
	}
},
{},
{
	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},

	/**
	 * View owning diagram
	 * 
	 * @type {Ea.Diagram._Base}
	 */
	diagram: {api: "DiagramID", referenceBy: "id"},
	
	/**
	 * View name
	 * 
	 * @derived
	 */
	name: {}
});

include("Ea.DiagramLink@Ea.Types.Diagram");
include("Ea.DiagramObject@Ea.Types.Diagram");
