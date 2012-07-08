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
	margin: {
		left: 25,
		top: 35,
		right: 35,
		bottom: 25
	},
	marginLanes: {
		left: 20,
		top: 30,
		right: 20,
		bottom: 10
	}
};

Ea.Diagram._Base = extend(Ea.Types.Namespace, {

	getParent: function() {
		return this._getParent() || this._getPackage();
	},
	
	save: function(path, reuse) {
		/*
		var fileDate = Core.IO.getCreated(path);
		if (!reuse || (!fileDate || fileDate.valueOf() <= this.getModified())) {
			Ea.getApplication().getProject().saveDiagram(this, path);
			Ea.getApplication().getRepository().closeDiagram(this);
		}
		*/
		Ea.Application.getProject().saveDiagram(this, path);
		Ea.Application.getRepository().closeDiagram(this);
		return true;
	},
	
	getSwimlanes: function(filter) {
		return this.getSwimlaneDef().getSwimlanes();
	},
	
	_dimension: null,
	getDimension: function() {
		if (!this._dimension || Ea.mm) {
			var dd = this._dimension = {
				right: 0,
				bottom: 0,
				width: 240,
				height: 150
			};
			var views = new Core.Types.Collection();
			views.addAll(this.getElementViews());
			views.addAll(this.getConnectorViews());
			views.forEach(function(view, n) {
				var dimension = view.getDimension();
				if (dimension) {
					dd.left = dd.left !== undefined ? Math.min(dd.left, dimension.left) : dimension.left;
					dd.top = dd.top !== undefined ? Math.min(dd.top, dimension.top) : dimension.top;
					dd.right = Math.max(dd.right, dimension.right);
					dd.bottom = Math.max(dd.bottom, dimension.bottom);
				}
			});
			var margin;
			var swimlanes = this.getSwimlanes();
			if (swimlanes.notEmpty()) {
				dd.left = 0;
				dd.top = 0;
				var left = 0;
				swimlanes.forEach(function(swimlane) {
					var right = left + swimlane.getWidth();
					dd.right = Math.max(dd.right, right);
					left = right;
				});
				dd.bottom = dd.bottom + 40;
				margin = Ea.Diagram.marginLanes;
			}
			else {
				margin = Ea.Diagram.margin;
			}
			dd.width = dd.right - dd.left + margin.left + margin.right;
			dd.height = dd.bottom - dd.top + margin.top + margin.bottom;
			dd.correctionX = -dd.left + margin.left;
			dd.correctionY = -dd.top + margin.top;
		}
		return this._dimension;
	},
	
	_calculated: null,
	getCalculated: function(maxWidth, maxHeight) {
		if (!this._calculated || Ea.mm) {
			var dimension = this.getDimension();
			var scale;
			this._calculated = {
				scale: scale = Math.min((maxWidth && dimension.width > maxWidth) ? maxWidth / dimension.width : 1, (maxHeight && dimension.height > maxHeight) ? maxHeight / dimension.height : 1),
				width: Math.round(dimension.width * scale),
				height: Math.round(dimension.height * scale)
			};
			this.scaled = scale < 1;
		}
		return this._calculated;
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
		var typeName = this._type.get(source).replace(/\s/g,"");
		var type = this.namespace[typeName];
		if (!type) {
			throw new Error("Not implemented Diagram type: " + typeName);
		}
		return type;
	},
	
	_id: attribute({api: "DiagramID", type: Number, id: "id"}),
	_guid: attribute({api: "DiagramGUID", id: "guid"}),
	_type: attribute({api: "Type"}),
	_metaType: attribute({api: "MetaType", private: true}),
	
	_style: attribute({api: "ExtendedStyle", type: Ea.DataTypes.Map}),
	_styleEx: attribute({api: "StyleEx", type: Ea.DataTypes.Map}),
	_elementViews: attribute({api: "DiagramObjects", type: "Ea.Collection._Base", elementType: "Ea.DiagramObject._Base", aggregation: "composite"}),
	_connectorViews: attribute({api: "DiagramLinks", type: "Ea.Collection._Base", elementType: "Ea.DiagramLink._Base", aggregation: "composite"}),
	_parent: attribute({api: "ParentID", type: "Ea.Element._Base", referenceBy: "id", private: true}),
	_package: attribute({api: "PackageID", type: "Ea.Package._Base", referenceBy: "id", private: true}),
	_swimlaneDef: attribute({api: "SwimlaneDef", type: "Ea.SwimlaneDef._Base", aggregation: "composite"}),

	_author: attribute({api: "Author"}),
	_created: attribute({api: "CreatedDate", type: Ea.DataTypes.Date}),
	_modified: attribute({api: "ModifiedDate", type: Ea.DataTypes.Date}),
	
	_dimension: derived({getter: "getDimension", type: Object})
});

Ea.Diagram.Activity = extend(Ea.Diagram._Base);
Ea.Diagram.Analysis = extend(Ea.Diagram._Base);
Ea.Diagram.Collaboration = extend(Ea.Diagram._Base);
Ea.Diagram.Component = extend(Ea.Diagram._Base);
Ea.Diagram.CompositeStructure = extend(Ea.Diagram._Base);
Ea.Diagram.Custom = extend(Ea.Diagram._Base);
Ea.Diagram.Deployment = extend(Ea.Diagram._Base);
Ea.Diagram.InteractionOverview = extend(Ea.Diagram._Base);
Ea.Diagram.Logical = extend(Ea.Diagram._Base);
Ea.Diagram.Object = extend(Ea.Diagram._Base);
Ea.Diagram.Package = extend(Ea.Diagram._Base);
Ea.Diagram.Sequence = extend(Ea.Diagram._Base);
Ea.Diagram.Statechart = extend(Ea.Diagram._Base);
Ea.Diagram.Timing = extend(Ea.Diagram._Base);
Ea.Diagram.UseCase = extend(Ea.Diagram._Base);

Ea.register("Ea.SwimlaneDef@Ea.Types.Diagram", 50);
Ea.register("Ea.Swimlanes@Ea.Types.Diagram", 51);
Ea.register("Ea.Swimlane@Ea.Types.Diagram", 52);

Ea.View = extend(Ea.Types.Any, {
	
	_dimension: null,

	left: null,
	top: null,
	right: null,
	bottom: null,

	getParent: function() {
		return this.getDiagram();
	}
},
{
	_diagram: attribute({api: "DiagramID", type: "Ea.Diagram._Base", referenceBy: "id"})
});

Ea.register("Ea.DiagramLink@Ea.Types.Diagram", 20);
Ea.register("Ea.DiagramObject@Ea.Types.Diagram", 19);
