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
		var fileDate = Sys.IO.getCreated(path);
		if (!reuse || (!fileDate || fileDate.valueOf() <= this.getModified())) {

		}
		*/
		this._source.application.getProject().saveDiagram(this, path);
		this._source.application.getRepository().closeDiagram(this);
		return true;
	},
	
	getSwimlanes: function(filter) {
		return this.getSwimlaneDef().getSwimlanes();
	},
	
	getDimension: function() {
		var dimension = this.fromCache("dimension");
		if (dimension === undefined) {
			dimension = {
				right: 0,
				bottom: 0,
				width: 240,
				height: 150
			};
			var views = new Core.Types.Collection();
			views.addAll(this.getElementViews());
			views.addAll(this.getConnectorViews());
			views.forEach(function(view, n) {
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

			this.toCache("dimension", dimension);
		}
		return dimension;
	},
	
	getCalculated: function(maxWidth, maxHeight) {
		var calculated = this.fromCache("calculated");
		if (calculated === undefined) {
			var dimension = this.getDimension();
			var scale;
			calculated = {
				scale: scale = Math.min((maxWidth && dimension.width > maxWidth) ? maxWidth / dimension.width : 1, (maxHeight && dimension.height > maxHeight) ? maxHeight / dimension.height : 1),
				width: Math.round(dimension.width * scale),
				height: Math.round(dimension.height * scale)
			};
			// TODO: get rid of this:
			this.scaled = scale < 1;
			this.toCache("calculated", calculated);
		}
		return calculated;
	},
	
	getElements: function(filter) {
		var elements = this._elements = new Core.Types.Collection();
		this.getElementViews().forEach(function(view) {
			elements.add(view.getElement());
		});			
		return this._elements.filter(filter);
	}
},
{
	_dimension: derived({type: Object, getter: "getDimension"}),
	
	api: "Diagram",

	getType: function(source) {
		return this._deriveType(source, this._type);
	},
	
	_id: attribute({api: "DiagramID", type: Number, id: "id"}),
	_guid: attribute({api: "DiagramGUID", id: "guid"}),
	_type: attribute({api: "Type"}),
	_metaType: attribute({api: "MetaType", private: true}),
	_notes: attribute({api: "Notes"}),
	_stereotype: attribute({api: "Stereotype"}),
	
	_style: attribute({api: "ExtendedStyle", type: Ea.DataTypes.Map}),
	_styleEx: attribute({api: "StyleEx", type: Ea.DataTypes.Map}),
	_elementViews: attribute({api: "DiagramObjects", type: "Ea.Collection._Base", elementType: "Ea.DiagramObject._Base", aggregation: "composite"}),
	_connectorViews: attribute({api: "DiagramLinks", type: "Ea.Collection._Base", elementType: "Ea.DiagramLink._Base", filter: "this.getId() != 0", aggregation: "composite"}),
		// collection filtered because of EA returns virtual connector views for Ea.Connector.Sequence with [id = 0]
	_parent: attribute({api: "ParentID", type: "Ea.Element._Base", referenceBy: "id", private: true}),
	_package: attribute({api: "PackageID", type: "Ea.Package._Base", referenceBy: "id", private: true}),
	_swimlaneDef: attribute({api: "SwimlaneDef", type: "Ea.SwimlaneDef._Base", aggregation: "composite"}),

	_highlightImports: attribute({api: "HighlightImports", type: Boolean}),
	_showDetails: attribute({api: "ShowDetails", type: Boolean}),
	_showPackageContents: attribute({api: "ShowPackageContents", type: Boolean}),
	_showPrivate: attribute({api: "ShowPrivate", type: Boolean}),
	_showProtected: attribute({api: "ShowProtected", type: Boolean}),
	_showPublic: attribute({api: "ShowPublic", type: Boolean}),

	_selectedConnector: attribute({api: "SelectedConnector", type: "Ea.Connector._Base"}),
	_selectedElements: attribute({api: "SelectedObjects", type: "Ea.Collection._Base", elementType: "Ea.Element._Base"}),
	
	_author: attribute({api: "Author"}),
	_version: attribute({api: "Version"}),
	_created: attribute({api: "CreatedDate", type: Ea.DataTypes.Date}),
	_modified: attribute({api: "ModifiedDate", type: Ea.DataTypes.Date}),
	
	_dimension: derived({getter: "getDimension", type: Object})
});

Ea.register("Ea.SwimlaneDef@Ea.Types.Diagram", 50);

Ea.View = extend(Ea.Types.Any, {
	
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
	_parent: attribute({api: "DiagramID", type: "Ea.Diagram._Base", referenceBy: "id", private: true})
});

Ea.register("Ea.DiagramLink@Ea.Types.Diagram", 20);
Ea.register("Ea.DiagramObject@Ea.Types.Diagram", 19);
