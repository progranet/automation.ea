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

Js2Model = {
		
	_buffer: null,
	root: null,
	Class: null,
	application: null,
	
	execute: function() {
		
		this.application = Ea.initializeDefaultApplication();
		
		info("=== START ===");
		
		this.root = this.application.getRepository().getSelectedPackage();
		
		for (var l = 0; l < this.params.libs.length; l++) {
			
			this._buffer = {};
			
			info("*** TYPE PROCESSING ***");
			
			this._reverse(this.params.libs[l]);
			
			info("*** FEATURE PROCESSING ***");
			
			this._processBuffer();

			info("*** DIAGRAM PROCESSING ***");
			
			this._processDiagrams();
		}
		
		info("=== FINISHED ===");
	},
	
	_libraries: {},
	
	_reverse: function(library) {

		if (library in this._libraries)
			return;
		this._libraries[library] = true;
		
		var t = library.split("@");
		var qualifiedName = t[0];
		var _package = t[1] ? t[1].replace(/\./g, "\\") + "\\" : "";
		
		var file = null;
		var root = null;

		for (var ri = 0; ri < _scriptRoot.length; ri++) {
			root = _scriptRoot[ri];
			if (Sys.IO.fileExists(root + _package + qualifiedName  + ".js")) {
				file = new Sys.IO.File(root + _package + qualifiedName  + ".js", Sys.IO.Mode.READ);
				break;
			}
		}
		if (!file)
			throw new Error("Library not found: " + library);
		
		var source = file.readAll();
		
		var ast = null;
		try {
			ast = External.acorn.parse(source, {
				trackComments: true,
				strictSemicolons: true,
				allowTrailingCommas: false
			});
		}
		catch (error) {
			error("syntax error: $", [JSON.stringify(error, null, '\t')]);
			throw new Error("Syntax error:\r\n" + error.message + "\r\nin " + library + "\r\n");
		}
		
		this._insertPackage(qualifiedName, ast);

		for (var b = 0; b < ast.body.length; b++) {
			var expression = ast.body[b];
			var library = null;
			try {
				if (expression.expression.type == "CallExpression" && expression.expression.callee.name == "include") {
					library = expression.expression.arguments[0].value;
				}
			}
			catch (error) {
				
			}
			if (library) {
				this._reverse(library);
			}
		}
	},
	
	_findOwner: function(namespace, qualifiedName) {

		if (!qualifiedName)
			return namespace;
		
		var array = qualifiedName.split(".");
		var name = array.shift();
		var _namespace = namespace.getPackages().filter("this.getName() == '" + name + "'").first();
		if (!_namespace)
			throw new Error("Package not found in model: " + namespace.getQualifiedName() + "." + name);

		return this._findOwner(_namespace, array.join("."));
	},
	
	_findPackage: function(qualifiedName) {
		var array = qualifiedName.split(".");
		var name = array.pop();

		var namespace = this._findOwner(this.root, array.join("."));
		var element = namespace.getPackages().filter("this.getName() == '" + name + "'").first();
		
		return {
			namespace: namespace,
			name: name,
			element: element
		};
	},
	
	_types: {},
	
	_findType: function(qualifiedName) {
		
		if (qualifiedName in this._types) {
			return this._types[qualifiedName];
		}
		
		var array = qualifiedName.split(".");
		var name = array.pop();

		var namespace = this._findOwner(this.root, array.join("."));
		var element = namespace.getElements().filter("this.getName() == '" + name + "'").first();
		
		var typeDefinition = {
				namespace: namespace,
				name: name,
				element: element
			};
		
		if (element)
			this._types[qualifiedName] = typeDefinition;
		
		return typeDefinition;
	},
	
	_insertPackage: function(qualifiedName, ast) {
		
		info("package:$", [qualifiedName]);
		var found = this._findPackage(qualifiedName);
		var _package = found.element;
		if (!_package) {
			info("* package changed");
			_package = found.namespace.createPackage(found.name);
			_package.update();
		}
		
		_package.getElement().setAlias(qualifiedName);
		_package.getElement().update();
		
		this._insertSingleton(qualifiedName, ast);
		this._insertClasses(qualifiedName, ast);
		
		return _package;
	},
	
	_insertSingleton: function(qualifiedName, ast) {

		info("  namespace:$", [qualifiedName]);

		var found = this._findType(qualifiedName);
		var namespace = found.element;
		if (!namespace) {
			info("  * namespace changed");
			namespace = found.namespace.createElement(found.name, Ea.Element.Class);
		}
		namespace.setAlias(qualifiedName);
		namespace.setStereotype("utility");
		namespace.update();
		
		this._prepareBuffer(qualifiedName, namespace);
		
		for (var b = 0; b < ast.body.length; b++) {
			var expression = ast.body[b];
			var properties = null;
			try {
				if (expression.type == "ExpressionStatement" && expression.expression.type == "AssignmentExpression") {
					var _qualifiedName = External.escodegen.generate(expression.expression.left);
					if (_qualifiedName == qualifiedName) {
						properties = expression.expression.right.properties;
					}
				}
			}
			catch (error) {
				
			}
			if (properties) {
				this._bufferClassProperties(qualifiedName, properties, this.Kind.Object);
			}
		}
	},
	
	_insertClasses: function(qualifiedName, ast) {

		for (var b = 0; b < ast.body.length; b++) {
			var expression = ast.body[b];
			
			try {
				if (expression.type == "ExpressionStatement" && expression.expression.type == "AssignmentExpression"
					&& expression.expression.right.type == "CallExpression") {
					
					var callee = expression.expression.right.callee.name;

					if (callee == "define" || callee == "extend") {
						var arguments = expression.expression.right.arguments;
						this._insertClass({
							qualifiedName: External.escodegen.generate(expression.expression.left),
							baseClass: callee == "define" ? null  : External.escodegen.generate(arguments[0]),
							methods: arguments[callee == "define" ? 0 : 1],
							staticMethods: arguments[callee == "define" ? 1 : 2],
							properties: arguments[callee == "define" ? 2 : 3]
						});
					}
				}
			}
			catch (error) {
				
			}
			
		}
	},
	
	_insertClass: function(_class) {
		
		info("  class:$", [_class.qualifiedName]);
		
		var found = this._findType(_class.qualifiedName);
		
		var namespace = found.element;
		if (!namespace) {
			info("  * class changed");
			namespace = found.namespace.createElement(found.name, Ea.Element.Class);
		}
		namespace.setAlias(_class.qualifiedName);
		namespace.update();
		
		if (_class.qualifiedName != "Core.Types.Object" && _class.qualifiedName != "Core.Lang.Class") {
			_class.baseClass = _class.baseClass || "Core.Types.Object";
			_class.baseClass = _class.baseClass.replace(/\s/g, "").replace(/^\[/, "").replace(/\]$/, "").split(",");
			for (var bc = 0; bc < _class.baseClass.length; bc++) {
				var found = this._findType(_class.baseClass[bc]);
				var _baseClass = found.element;
				var generalization = namespace.getConnectors().filter("this.instanceOf(Ea.Connector.Generalization) && this.getSupplier().getAlias() == '" + _class.baseClass[bc] + "'").first();
				if (!generalization) {
					generalization = namespace.createConnector("", Ea.Connector.Generalization);
					generalization.setSupplier(_baseClass);
					generalization.update();
				}
			}
		}
		
		if (_class.qualifiedName == "Ea._Base.Class._Property") {
			var metaClass = this._findType("Core.Lang.Class").element;
			if (!metaClass)
				throw new Error("Core.Lang.Class not found in model");
			this.Class = metaClass;
		}
		
		this._prepareBuffer(_class.qualifiedName, namespace);
		
		if (_class.methods) {
			this._bufferClassProperties(_class.qualifiedName, _class.methods.properties, this.Kind.Object);
		}
		if (_class.staticMethods) {
			this._bufferClassProperties(_class.qualifiedName, _class.staticMethods.properties, this.Kind.Class);
		}
		if (_class.properties) {
			this._bufferClassProperties(_class.qualifiedName, _class.properties.properties, this.Kind.Properties);
		}
		
	},
	
	_collapseView: function(view) {
		var style = view._getStyle();
		style.set("AttPro", 0);
		style.set("AttPri", 0);
		style.set("AttPub", 0);
		style.set("AttPkg", 0);
		style.set("OpPro", 0);
		style.set("OpPri", 0);
		style.set("OpPub", 0);
		style.set("OpPkg", 0);
		style.set("AttCustom", 0);
		style.set("OpCustom", 0);
		style.set("RzO", 1);
		view._setStyle(style);
		view.setWidth(250);
		view.setHeight(50);
		view.update();		
	},
	
	_insertClassHierarchyDiagram: function(_class) {
		
		var diagrams = _class.getDiagrams().filter("this.getName() == 'Type hierarchy'");
		diagrams.forEach(function(diagram) {
			_class.deleteDiagram(diagram);
		});
		
		if (_class.getRelated("subtype of").isEmpty())
			return false;
		
		var diagram = _class.createDiagram("Type hierarchy", "Logical");
		diagram.update();

		var elements = {};

		var collapseView = this._collapseView;
		var createView = function(element) {
			
			var guid = element.getGuid();
			if (guid in elements)
				return;
			elements[guid] = true;
			
			var view = diagram.createElementView();
			view.setElement(element);
			collapseView(view);
			view.update();
			var general = element.getRelated("subtype of");
			general.forEach(function(generalization) {
				createView(generalization);
			});
		};

		createView(_class);

		var style = diagram._getStyle();
		style.set("OpParams", 2);
		style.set("UseAlias", 1);
		diagram._setStyle(style);
		diagram.update();

		diagram.getConnectorViews().filter("!this.getConnector().instanceOf(Ea.Connector.Generalization)").forEach(function(connectorView) {
			connectorView.setHidden(true);
			connectorView.update();
		});
		
		diagram.layout({
			crossReduceAggressive: true,
			layerSpacing: 20,
			columnSpacing: 20,
			cycleRemove: "Greedy",
			initialize: "Naive",
			layering: "OptimalLinkLength",
			direction: "Up"
		}, 10);
		
		diagram.close();
		
		return true;
	},
	
	_insertAssociationsDiagram: function(_class) {

		var diagrams = _class.getDiagrams().filter("this.getName() == 'Suppliers'");
		diagrams.forEach(function(diagram) {
			_class.deleteDiagram(diagram);
			
		});
			
		var associations = _class.getConnectors().filter(function() {
			if (!this.instanceOf(Ea.Connector.Association) || this.getClient() != _class)
				return false;
			var supplier = this.getSupplier();
			var type = eval(supplier.getAlias());
			return type.conformsTo(Ea.Types.Any);
		});
		
		/*if (associations.isEmpty())
			return false;*/
		
		var diagram = _class.createDiagram("Suppliers", "Logical");
		diagram.update();
			
		var elements = {};
		var relationships = new Core.Types.Collection();

		var view = diagram.createElementView();
		view.setElement(_class);
		view.update();
		elements[_class.getGuid()] = true;
			
		associations.forEach(function(association) {
			var supplier = association.getSupplier();
			if (!elements[supplier.getGuid()]) {
				var view = diagram.createElementView();
				view.setElement(supplier);
				this._collapseView(view);
				elements[supplier.getGuid()] = true;
			}
		});
		
		relationships.addAll(associations);
		
		var style = diagram._getStyle();
		style.set("OpParams", 2);
		style.set("UseAlias", 1);
		diagram._setStyle(style);
		diagram.update();

		var toHide = diagram.getConnectorViews().filter(function() {
			return !relationships.contains(this.getConnector());
		});
		
		toHide.forEach(function(view) {
			view.setHidden(true);
			view.update();
		});
		
		diagram.layout({
			crossReduceAggressive: true,
			layerSpacing: 100,
			columnSpacing: 50,
			cycleRemove: "Greedy",
			initialize: "Naive",
			layering: "LongestPathSink",
			direction: "Right"
		}, 10);
		diagram.close();
		
		return true;
	},
	
	Kind: {
		Object: "object",
		Class: "class",
		Properties: "properties"
	},
	
	_prepareBuffer: function(qualifiedName, namespace) {

		var buffered = {
			namespace: namespace,
			compartments: {}
		};
		buffered.compartments[this.Kind.Object] = [];
		buffered.compartments[this.Kind.Class] = [];
		buffered.compartments[this.Kind.Properties] = [];
		
		this._buffer[qualifiedName] = buffered;
	},
	
	_bufferClassProperties: function(qualifiedName, properties, kind) {
		var buffered = this._buffer[qualifiedName];
		buffered.compartments[kind] = properties;
	},
	
	_processBuffer: function() {
		
		for (var qualifiedName in this._buffer) {
			
			var buffered = this._buffer[qualifiedName];
			var accessors = {};
			this._insertFeatures(qualifiedName, buffered.namespace, buffered.compartments[this.Kind.Class], true, accessors);
			this._insertClassProperties(qualifiedName, buffered.namespace, buffered.compartments[this.Kind.Properties], accessors);
			this._insertFeatures(qualifiedName, buffered.namespace, buffered.compartments[this.Kind.Object], false, accessors);
		}
	},
	
	_processDiagrams: function() {
		
		for (var qualifiedName in this._buffer) {
			info("diagrams:$", [qualifiedName]);
			var buffered = this._buffer[qualifiedName];
			this._insertClassHierarchyDiagram(buffered.namespace);
			this._insertAssociationsDiagram(buffered.namespace);
		}
	},
	
	_insertClassProperties: function(qualifiedName, _class, properties, accessors) {
		
		for (var propertyIndex = 0; propertyIndex < properties.length; propertyIndex++) {
			var property = properties[propertyIndex];

			var commentsBefore = property.key.commentsBefore ? property.key.commentsBefore.pop() : "";
			var doc = this._parseDoc(commentsBefore) || {};

			this._insertClassProperty(qualifiedName, _class, {
				name: property.key.name,
				multiplicityLower: 1,
				multiplicityUpper: 1,
				collection: false,
				_private: doc["private"] ? true : false,
				derived: doc["derived"] ? true : false,
				readOnly: doc["readOnly"] ? true: false
			}, accessors, doc);
		}
	},
	
	_insertClassProperty: function(qualifiedName, _class, property, accessors, doc) {
		
		if (property._private)
			return;
		
		info("property:$.$", [qualifiedName, property.name]);
		
		var typeName = "String";

		if (doc.type && doc.type.length != 0) {
			typeName = doc.type[0].type;
			if (typeName.indexOf("<") != -1) {
				typeName = typeName.replace(/^(.*)<(.*)>$/, function(whole, collectionType, elementType) {
					property.collection = true;
					property.multiplicityLower = 0;
					property.multiplicityUpper = "*";
					property.single = doc["single"] ? doc["single"][0].comment : "";
					return elementType;
				});
			}
		}
		var comments = (doc.comment || "").split(/\r\n/g);
		var comment = "";
		for (var c = 0; c < comments.length; c++) {
			comment = comment + (c != 0 ? "\r\n" : "") + comments[c].replace(/^[\s*]*/, "").replace(/[\s]$/, "");
		}
		property.comment = comment;

		var type = this._findType(typeName).element;
		
		if (type) {
			this._insertAssociation(qualifiedName, doc, _class, property, type);
		}
		else {
			type = Ea._Base.PrimitiveType.getPrimitiveType(typeName);
			this._insertAttribute(qualifiedName, doc, _class, property, type);
		}
		
		var name = property.name.replace(/^_+/g, "");
		var accessorName = name.substring(0,1).toUpperCase() + name.substring(1);
		
		var prefix = typeName == "Boolean" ? "is" : "get";
		var getter = (property._private ? "_" : "") + prefix + accessorName;
		
		var comment = doc.comment ? (doc.comment.substring(0,1).toLowerCase() + doc.comment.substring(1)).split(".")[0] : "";
						
		this._insertAccessor(_class, property, getter, (comment ? "Returns " + comment : ""), type, true, []);
		accessors[getter] = true;
		
		if (!property.readOnly) {
			if (property.collection) {
				var elementName = property.single || property.name.replace(/^_+/g, "").replace(/s$/, "");
				var mutatorName = elementName.substring(0,1).toUpperCase() + elementName.substring(1);
				var adder = (property._private ? "_" : "") + "create" + mutatorName;
				this._insertAccessor(_class, property, adder, (comment ? "Creates new " + elementName + " and adds it to " + comment : ""), type, false, [{
					name: "name",
					type: Ea._Base.PrimitiveType.getPrimitiveType("String")
				}, {
					name: "type",
					type: this.Class
				}]);
				accessors[adder] = true;
				var remover = (property._private ? "_" : "") + "delete" + mutatorName;
				this._insertAccessor(_class, property, remover, (comment ? "Deletes specified " + elementName + " and removes it from " + comment : ""), null, false, [{
					name: elementName,
					type: type
				}]);
				accessors[remover] = true;
			}
			else {
				
				var setter = (property._private ? "_" : "") + "set" + accessorName;
				this._insertAccessor(_class, property, setter, (comment ? "Sets " + comment : ""), null, false, [{
					name: name,
					type: type
				}]);
				accessors[setter] = true;
			}
		}
	},
	
	_insertAccessor: function(_class, p, name, comment, type, query, params) {
		var method = _class.getMethods().filter("this.getName() == '" + name + "'").first();
		if (!method) {
			info("* accessor changed: $", [name]);
			method = _class.createMethod(name);
		}
		if (p._private)
			method.setVisibility("Private");
		
		method.setType(type);
		method.setStereotype(query ? "accessor" : "mutator");
		if (query)
			method.setQuery(true);
		method.setNotes(comment);
		method.update();

		for (var prm = 0; prm < params.length; prm++) {

			var param = params[prm];
			
			var parameter = method.getParameters().filter("this.getName() == '" + param.name + "'").first();
			if (!parameter) {
				info("  * accessor param changed: $, $", [name, param.name]);
				parameter = method.createParameter(param.name);
			}
			parameter.setType(param.type);
			parameter.setPosition(prm + 1);
			parameter.update();
		}
	},
	
	_insertAttribute: function(qualifiedName, doc, _class, p, type) {
		
		var attribute = _class.getAttributes().filter("this.getName() == '" + p.name + "'").first();
		if (!attribute) {
			info("* property changed");
			attribute = _class.createAttribute(p.name);
		}
		if (p._private)
			attribute.setVisibility("Private");
		
		attribute.setNotes(p.comment);

		//attribute._setPrimitiveType(type);
		attribute.setType(type);
		if (p.derived)
			attribute.setDerived(true);
		attribute.setStereotype("property");
		
		if (p.readOnly) {
			attribute.setReadOnly(true);
		}
		
		if (p.collection) {
			attribute.setLower(p.multiplicityLower);
			attribute.setUpper(p.multiplicityUpper);
		}
		else {
			attribute.setLower("");
			attribute.setUpper("");
		}
		attribute.update();
	},
	
	_insertAssociation: function(qualifiedName, doc, _class, p, type) {
		
		var association = _class.getConnectors().filter("this.instanceOf(Ea.Connector.Association) && this.getSupplierEnd().getRole() == '" + p.name + "'").first();
		
		if (!association) {
			info("* association changed");
			association = _class.createConnector("", Ea.Connector.Association);
			association.setSupplier(type);
			association.update();
		}
		
		var clientEnd = association.getClientEnd();
		clientEnd.setNavigability("Non-Navigable");
		clientEnd.setNavigable(false);
		if (doc.aggregation)
			clientEnd.setAggregation(doc.aggregation[0].comment);
		clientEnd.update();
		
		var supplierEnd = association.getSupplierEnd();
		supplierEnd.setNavigability("Navigable");
		supplierEnd.setNavigable(true);
		
		var multiplicity;
		if (p.collection) {
			if (p.multiplicityLower == "0" && p.multiplicityUpper == "*")
				multiplicity = "*";
			else
				multiplicity = p.multiplicityLower + ".." + p.multiplicityUpper;
		}
		else {
			multiplicity = "1";
		}
		supplierEnd.setMultiplicity(multiplicity);
		
		supplierEnd.setRole(p.name);
		supplierEnd.setNotes(p.comment.replace(/\r\n/g, " "));
		if (p.readOnly)
			supplierEnd.setConstraint("readOnly");
		if (p.derived)
			supplierEnd.setDerived(true);
		if (doc["qualifier"])
			supplierEnd.setQualifier(doc["qualifier"][0].comment + ":" + doc["qualifier"][0].type);
		if (p._private)
			supplierEnd.setVisibility("Private");

		supplierEnd.update();
	},
	
	_insertFeatures: function(qualifiedName, namespace, properties, _static, accessors) {

		for (var propertyIndex = 0; propertyIndex < properties.length; propertyIndex++) {
			
			var property = properties[propertyIndex];
			
			if (property.value.type == "FunctionExpression") {

				var propertyName = property.key.name;
				if (_static || !(propertyName in accessors))
					this._insertMethod(qualifiedName, namespace, property, _static);
			}
			
		}
	},
	
	_insertMethod: function(qualifiedName, namespace, property, _static) {
		var _private = property.key.name.charAt(0) == "_";
		var notes = "";
		
		var commentsBefore = property.key.commentsBefore ? property.key.commentsBefore.pop() : "";
		var doc = this._parseDoc(commentsBefore);
		var typeName = null;
		if (doc) {
			if (doc.type && doc.type.length != 0) {
				typeName = doc.type[0].type;
			}
			if (doc["private"])
				_private = true;
			notes = doc.comment;
		}
		else {
			typeName = "any";
		}
		if (_private)
			return;

		var name = property.key.name;
		info("method:$.$", [qualifiedName, name]);
		var method = namespace.getMethods();
		method = method.filter("this.getName() == '" + name + "'").first();
		if (!method) {
			info("* method changed");
			method = namespace.createMethod(name);
		}
		
		if (name == "create")
			method.setStereotype("create");
		
		method.setNotes(notes);
		if (_private)
			method.setVisibility("Private");
		
		//var multiplicityLower = 1;
		//var multiplicityUpper = 1;
		
		if (typeName) {
			if (typeName.indexOf("<") != -1) {
				typeName = typeName.replace(/^(.*)<(.*)>$/, function(whole, collectionType, elementType) {
					//multiplicityLower = 0;
					//multiplicityUpper = "*";
					return elementType;
				});
			}
			var type = this._findType(typeName).element || Ea._Base.PrimitiveType.getPrimitiveType(typeName);
			method.setType(type);
		}
		else {
			method.setType(null);
		}

		if (_static) {
			method.setStatic(true);
		}
		method.update();
		
		this._insertParams(qualifiedName, property, method, doc);
	},
	
	_insertParams: function(qualifiedName, property, method, doc) {
		var params= {};
		if (doc && doc.param) {
			for (var prm = 0; prm < doc.param.length; prm++) {
				var param = doc.param[prm];
				var comment = param.comment.split(" ");
				params[comment.shift()] = {
					type: param.type,
					comment: comment.join(" ")
				};
			}
		}
		for (var prm = property.value.params.length - 1; prm != -1; prm--) {
			var paramName = property.value.params[prm].name;
			param = params[paramName] || {};
			
			info("  param:$", [paramName]);
			var parameter = method.getParameters().filter("this.getName() == '" + paramName + "'").first();
			if (!parameter) {
				info("  * param changed");
				parameter = method.createParameter(paramName);
			}
			
			var typeName = param.type || "any";
			//var multiplicityLower = 1;
			if (typeName.charAt(0) == "?") {
				//multiplicityLower = 0;
				typeName = typeName.substr(1);
			}
			//var multiplicityUpper = 1;
			if (typeName.indexOf("<") != -1) {
				typeName = typeName.replace(/^(.*)<(.*)>$/, function(whole, collectionType, elementType) {
					//multiplicityLower = 0;
					//multiplicityUpper = "*";
					return elementType;
				});
			}
			
			var type = this._findType(typeName).element || Ea._Base.PrimitiveType.getPrimitiveType(typeName);
			parameter.setType(type);

			parameter.setNotes(param.comment || "");
			parameter.setPosition(prm + 1);
			parameter.update();
		}
	},
	
	_parseDoc: function(comment) {
		var clean = function(raw) {
			var cleaned = raw.replace(/^[\s\r\n\*]*/, "").replace(/[\s\r\n\*]*$/, "");
			return cleaned;
		};

		if (!comment || comment.charAt(0) != "*")
			return null;
		var doc = {
			
		};
		if (comment.indexOf("@") == -1) {
			doc.comment = clean(comment);
			comment = "";
		}
		else {
			doc.comment = clean(comment.substr(0, comment.indexOf("@")));
			comment = comment.substr(comment.indexOf("@"));
			var tags = comment.split(/\r\n[\s*\r\n]*@/g);
			for (var t = 0; t < tags.length; t++) {
				var tag = null;
				tags[t].replace(/([a-z]+)(\s+\{([^\}]+)\})?(.*)/gi, function(whole, name, _type, type, comment) {
					tag = {
						name: name,
						type: type,
						comment: clean(comment)
					};
				});
				if (!doc[tag.name])
					doc[tag.name] = [];
				doc[tag.name].push(tag);
			}
		}
		return doc;
	}
	
};
