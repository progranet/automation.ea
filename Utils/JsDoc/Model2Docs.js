/*
   Copyright 2012 300 D&C

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

include("Ea@Ea");
include("Sys@Sys");
include("Sys.IO@Sys");
include("Html@Html");
include("Html.IO@Html");
include("Word@Ms");

Model2Docs = {
		
	params: {
		styleSheet: "style.css",
		index: "index.html",
		//diagramMaxWidth: 600,
		//diagramMaxHeight: 900,
		getFileName: function(element) {
			var sufix = element.instanceOf(Ea.Package._Base) ? "namespace" : "element";
			return element.getAlias().replace(/$/, "-" + sufix + ".html");
		}
	},

	namespaces: null,
	
	execute: function() {
		
		var application = Ea.initializeDefaultApplication();
		
		info("=== START ===");
		
		var root = application.getRepository().getSelectedPackage();
		
		Sys.IO.copy(this.params.styleSheet, this.params.output, this);
		Sys.IO.copy(this.params.index, this.params.output, this);

		Html.loadTemplates("template.html", this);

		this.namespaces = new Html.IO.File(this.params.output + "namespaces.html");
		this.namespaces.write("html-head", {title: "namespaces", stylesheet: this.params.styleSheet});
		this.namespaces.write("namespaces-head");
		
		this.documentModel(root);
		
		this.namespaces.write("namespaces-foot");
		this.namespaces.write("html-foot");
		this.namespaces.close();
		
		info("=== FINISHED ===");
	},
	
	documentModel: function(root) {
		this._documentPackage(root, "");
	},
	
	_documentPackage: function(_package) {
		
		Ea.log(_package);
		
		var elements = _package.getElements().filter(Ea.Element.Class);
		if (elements.isEmpty())
			return;

		this.namespaces.write("namespaces-namespace", {
			qualifiedName: _package.getAlias(),
			fileName: this.params.getFileName(_package)
		});
		
		var packages = _package.getPackages();
		packages.forEach(function(_package) {
			this._documentPackage(_package);
		});

		var elementsFile = new Html.IO.File(this.params.output + this.params.getFileName(_package));
		elementsFile.write("html-head", {title: _package.getAlias(), stylesheet: this.params.styleSheet});
		elementsFile.write("header", {name: "package: " + _package.getAlias()});
		
		var utilities = elements.filter("this.getStereotype() == 'utility'");
		if (utilities.notEmpty()) {
			elementsFile.write("sub-header", {name: "utilities"});
			elementsFile.write("html-head", {title: _package.getAlias(), stylesheet: this.params.styleSheet});
			elementsFile.write("classes-head");
			
			utilities.forEach(function(_class) {
				
				if (_class.getAttributes().notEmpty() || _class.getMethods().notEmpty()) {
						
					elementsFile.write("classes-class", {
						_class: _class, 
						qualifiedName: _class.getAlias(),
						name: _class.getName(),
						fileName: this.params.getFileName(_class)
					});
					
					this._documentClass(_class, _package);
				}
			});
			
			elementsFile.write("classes-foot");
			elementsFile.write("html-foot");
		}

		var classes = elements.filter("this.getStereotype() != 'utility'");
		if (classes.notEmpty()) {
			elementsFile.write("sub-header", {name: "classes"});
			elementsFile.write("html-head", {title: _package.getAlias(), stylesheet: this.params.styleSheet});
			elementsFile.write("classes-head");
			
			classes.forEach(function(_class) {
				
				elementsFile.write("classes-class", {
					_class: _class, 
					qualifiedName: _class.getAlias(),
					name: _class.getName(),
					fileName: this.params.getFileName(_class)
				});
				
				this._documentClass(_class, _package);
			});
			
			elementsFile.write("classes-foot");
			elementsFile.write("html-foot");
		}

		elementsFile.close();
	},
	
	_documentClass: function(_class, _package) {
		
		Ea.log(_class);

		var classFile = new Html.IO.File(this.params.output + this.params.getFileName(_class));
		classFile.write("html-head", {title: _class.getAlias(), stylesheet: this.params.styleSheet});
		classFile.write("sub-header", {name: _package.getAlias()});
		classFile.write("header", {name: _class.getName()});
		
		var diagram = _class.getDiagrams().filter("this.getName() == 'Type hierarchy'").first();
		var params = this.params;
		if (diagram) {
			this._documentDiagram(diagram, classFile, function(elementView) {
				return params.getFileName(elementView.getElement());
			}, {
				maxWidth: this.params.diagramMaxWidth || 0,
				maxHeight: this.params.diagramMaxHeight || 0,
				path: this.params.output,
				fileName: "diagrams\\diagram_" + diagram.getXmlGuid() + "-hierarchy.png"
			});
			classFile.write("text", {text: "<br>"});
		}
		
		var documented = new Core.Types.Collection();
		_class.getRelated("subtype of").forEach(function(_class) {
			this._documentSuperclassMethods(_class, classFile, documented);
		});
		
		diagram = _class.getDiagrams().filter("this.getName() == 'Suppliers'").first();
		if (diagram) {
			this._documentDiagram(diagram, classFile, function(elementView) {
				return params.getFileName(elementView.getElement());
			}, {
				maxWidth: this.params.diagramMaxWidth || 0,
				maxHeight: this.params.diagramMaxHeight || 0,
				path: this.params.output,
				fileName: "diagrams\\diagram_" + diagram.getXmlGuid() + "-supplier.png"
			});
			classFile.write("text", {text: "<br>"});
		}
		
		var methods = _class.getMethods();
		if (methods.notEmpty()) {
			classFile.write("section-header", {name: "Method detail"});
			methods.forEach(function(method) {
				this._documentMethod(_class, method, classFile);
			});
		}

		classFile.close();

	},
	
	_documentSuperclassMethods: function(_class, classFile, documented) {
		
		var methods = _class.getMethods();
		var size = methods.getSize();
		if (size != 0) {
			
			var link = this.params.getFileName(_class);
			classFile.write("inherited-head", {header: "Methods inherited from class", element: _class, elementLink: link});
			classFile.write("inherited-row-head");
			
			methods.forEach(function(method, index) {
				classFile.write("inherited-row-content", {elementLink: link, feature: method, separator: (index + 1) != size ? ",&nbsp" : ""});
			});
			
			classFile.write("inherited-row-foot");
			classFile.write("inherited-foot");
			classFile.write("text", {text: "<br>"});
		}
		documented.add(_class);
		
		_class.getRelated("subtype of").forEach(function(_class) {
			if (!documented.contains(_class))
				this._documentSuperclassMethods(_class, classFile, documented);
		});
	},
	
	_documentMethod: function(_class, method, classFile) {
		
		classFile.write("ref", {ref: method.getName()});
		classFile.write("sub-header", {name: method.getName()});
		
		classFile.write("text", {text: "<code>"});

		classFile.write("text", {text: method.getName() + "("});
		
		var parameters = method.getParameters();
		var size = parameters.getSize();
		parameters.forEach(function(parameter, index) {
			classFile.write("text", {text: parameter.getName() + "&nbsp;:"});
			this._documentType(parameter.getType(), classFile);
			classFile.write("text", {text: (index + 1) != size ? ",&nbsp" : ""});
		});
		
		classFile.write("text", {text: ")&nbsp;:"});
		this._documentType(method.getType(), classFile);

		classFile.write("text", {text: "</code>"});

		classFile.write("paragraph", {text: method.getNotes()});
		
		classFile.write("text", {text: "<hr>"});
		
	},
	
	_documentType: function(type, classFile) {
		if (!type) {
			classFile.write("text", {text: "void"});
		}
		else if (type.instanceOf(Ea.Element.Class)) {
			classFile.write("link", {link: this.params.getFileName(type), name: type.getAlias()});
		}
		else {
			classFile.write("text", {text: type.getName()});
		}
	},
	
	_documentDiagram: function(diagram, file, elementLinkFn, params) {

		diagram.saveToFile(params.path + params.fileName);
		
		var dimension = diagram.getDimension();
		var scale = diagram.getScale(params.maxWidth, params.maxHeight);
		var dimImg = " width=\"" + Math.round(dimension.width * scale) + "\" height=\"" + Math.round(dimension.height * scale) + "\"";
		
		file.write("diagram", {
			filePath: params.fileName, 
			id: diagram.getXmlGuid().substring(5), 
			dimension: dimImg
		});
		
		if (params.legend) {
			file.write("diagram-legend", {
				legend: params.legend
			});
		}
		
		file.write("map-head", {id: diagram.getXmlGuid().substring(5)});
		diagram.getElementViews().forEach(function(elementView) {
			if (Ea.Element._Base.isInstance(elementView.getElement())) {
				var link = elementLinkFn(elementView);
				file.write("map-area", {
					elementLink: link, 
					elementView: elementView, 
					dimension: elementView.getCorrected(scale).valueOf()
				});
			}
		});
		file.write("map-foot");
		
		diagram.close();
	}
};
