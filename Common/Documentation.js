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

Documentation = {
		
	params: {
		styleSheet: "style.css",
		index: "index.html",
		diagramMaxWidth: 600,
		diagramMaxHeight: 900
	},

	_buffer: null,
	
	namespaces: null,
	
	execute: function() {
		
		var application = Ea.initializeDefaultApplication();
		
		info("=== START ===");
		
		var root = application.getRepository().getSelectedPackage();
		
		for (var l = 0; l < this.params.libs.length; l++) {
			var lib = this.params.libs[l];
			this.modelSource(root, lib);
		}
		
		Sys.IO.copy(this.params.styleSheet, this.params.output, this);
		Sys.IO.copy(this.params.index, this.params.output, this);

		Html.loadTemplates("template.html", this);

		this.namespaces = new Html.IO.File(this.params.output + "namespaces.html");
		this.namespaces.write("html-head", {title: "namespaces", stylesheet: this.params.styleSheet});
		this.namespaces.write("namespaces-head");
		
		this.documentModel(root, null);
		
		this.namespaces.write("namespaces-foot");
		this.namespaces.write("html-foot");
		this.namespaces.close();
		
		//application.cacheInfo();
		
		info("=== FINISHED ===");
	},
	
	documentModel: function(_package, parentName) {
		this._documentPackage(_package, parentName);
	},
	
	_documentPackage: function(_package, parentName) {
		
		var qualifiedName = (parentName ? parentName + "." + _package.getName() : (parentName == null ? "." : _package.getName()));
		
		this.namespaces.write("namespaces-namespace", {namespace: qualifiedName});
		
		var packages = _package.getPackages();
		packages.forEach(function(_package) {
			this._documentPackage(_package, qualifiedName == "." ? "" : qualifiedName);
		});

		var classFile = new Html.IO.File(this.params.output + qualifiedName + ".html");
		classFile.write("html-head", {title: qualifiedName, stylesheet: this.params.styleSheet});
		classFile.write("classes-head");

		var classes = _package.getElements().filter(Ea.Element.Class);
		classes.forEach(function(_class) {
			
			classFile.write("classes-class", {
				_class: _class, 
				qualifiedName: (qualifiedName == "." ? "" : qualifiedName + ".") + _class.getName()
			});
			
			//this._documentClass(_class, qualifiedName);
		});

		classFile.write("classes-foot");
		classFile.write("html-foot");
		classFile.close();
	},
	
	modelSource: function(rootPackage, library) {
		this._buffer = [];
		info("*** TYPE PROCESSING ***");
		this._reverse(rootPackage, library);
		info("*** FEATURE PROCESSING ***");
		this._processBuffer(rootPackage);
	},
	
	_reverse: function(rootPackage, library) {
		
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
		
		this._insertPackage(rootPackage, qualifiedName, ast);

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
			if (library)
				this._reverse(rootPackage, library);
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
	
	_findPackage: function(root, qualifiedName) {
		var array = qualifiedName.split(".");
		var name = array.pop();

		var namespace = this._findOwner(root, array.join("."));
		var element = namespace.getPackages().filter("this.getName() == '" + name + "'").first();
		
		return {
			namespace: namespace,
			name: name,
			element: element
		};
	},
	
	_findType: function(root, qualifiedName) {
		var array = qualifiedName.split(".");
		var name = array.pop();

		var namespace = this._findOwner(root, array.join("."));
		var element = namespace.getElements().filter("this.getName() == '" + name + "'").first();
		
		return {
			namespace: namespace,
			name: name,
			element: element
		};
	},
	
	_insertPackage: function(root, qualifiedName, ast) {
		
		info("package:$", [qualifiedName]);
		var found = this._findPackage(root, qualifiedName);
		var _package = found.element;
		if (!_package) {
			info("* package changed");
			_package = found.namespace.createPackage(found.name);
			_package.update();
		}
		
		_package.getElement().setAlias(qualifiedName);
		_package.getElement().update();
		
		this._insertSingleton(root, qualifiedName, ast);
		this._insertClasses(root, qualifiedName, ast);
		
		return _package;
	},
	
	_insertSingleton: function(root, qualifiedName, ast) {

		info("  namespace:$", [qualifiedName]);

		var found = this._findType(root, qualifiedName);
		var namespace = found.element;
		if (!namespace) {
			info("  * namespace changed");
			namespace = found.namespace.createElement(found.name, Ea.Element.Class);
		}
		namespace.setStereotype("utility");
		namespace.update();
		
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
				this._bufferClassProperties(root, qualifiedName, ast, namespace, properties);
			}
		}
	},
	
	_insertClasses: function(root, qualifiedName, ast) {

		for (var b = 0; b < ast.body.length; b++) {
			var expression = ast.body[b];
			
			var qualifiedName = null;
			var arguments = null;
			var baseClass = null;
			var methods = null;
			var staticMethods = null;

			try {
				if (expression.type == "ExpressionStatement" && expression.expression.type == "AssignmentExpression"
					&& expression.expression.right.type == "CallExpression") {
					
					var callee = expression.expression.right.callee.name;
					if (callee == "define" || callee == "extend") {
						qualifiedName = External.escodegen.generate(expression.expression.left);
						//info(" * * * $", [qualifiedName]);
						arguments = expression.expression.right.arguments;
						baseClass = callee == "define" ? null  : External.escodegen.generate(arguments[0]);
						methods = arguments[callee == "define" ? 0 : 1].properties;
						staticMethods = arguments[callee == "define" ? 1 : 2].properties;
						
					}
				}
			}
			catch (error) {
				
			}
			if (qualifiedName) {

				info("  class:$", [qualifiedName]);
				
				var found = this._findType(root, qualifiedName);
				
				var _class = found.element;
				if (!_class) {
					info("  * class changed");
					_class = found.namespace.createElement(found.name, Ea.Element.Class);
				}
				_class.setAlias(qualifiedName);
				_class.update();
				
				if (qualifiedName != "Core.Types.Object") {
					baseClass = baseClass || "Core.Types.Object";
					baseClass = baseClass.replace(/\s/g, "").replace(/^\[/, "").replace(/\]$/, "").split(",");
					for (var bc = 0; bc < baseClass.length; bc++) {
						var found = this._findType(root, baseClass[bc]);
						var _baseClass = found.element;
						var generalization = _class.getConnectors().filter("this.instanceOf(Ea.Connector.Generalization) && this.getSupplier().getAlias() == '" + baseClass[bc] + "'").first();
						if (!generalization) {
							generalization = _class.createConnector("", Ea.Connector.Generalization);
							generalization.setSupplier(_baseClass);
							generalization.update();
						}
					}
				}

				if (methods)
					this._bufferClassProperties(root, qualifiedName, ast, _class, methods);
				if (staticMethods)
					this._bufferClassProperties(root, qualifiedName, ast, _class, staticMethods, true);
				
			}
		}
	},

	_bufferClassProperties: function(root, qualifiedName, ast, _class, properties, _static) {
		this._buffer.push({
			qualifiedName: qualifiedName,
			ast: ast,
			_class: _class,
			properties: properties,
			_static: _static
		});
	},
	
	_processBuffer: function(root) {
		for (var b = 0; b < this._buffer.length; b++) {
			var buffered = this._buffer[b];
			this._insertClassProperties(root, buffered.qualifiedName, buffered.ast, buffered._class, buffered.properties, buffered._static);
		}
	},
	
	_insertClassProperties: function(root, qualifiedName, ast, _class, properties, _static) {
		
		var accessors = {};
		
		for (var propertyIndex = 0; propertyIndex < properties.length; propertyIndex++) {
			var property = properties[propertyIndex];
			
			if (property.value.type == "CallExpression" && 
					property.value.callee.type == "Identifier" && property.value.callee.name == "property") {

				var commentsBefore = property.key.commentsBefore ? property.key.commentsBefore.pop() : "";
				var doc = this._parseDoc(commentsBefore) || {};

				var p = {
					_static: _static,
					name: property.key.name.replace(/^_+/g, ""),
					multiplicityLower: 1,
					multiplicityUpper: 1,
					collection: false,
					_private: doc["private"] ? true : false,
					derived: doc["derived"] ? true : false,
					readOnly: doc["readOnly"] ? true: false
				};
				
				if (p._private)
					continue;
				
				info("property:$.$", [qualifiedName, p.name]);
				
				var typeName = "String";

				if (doc.type && doc.type.length != 0) {
					typeName = doc.type[0].type;
					if (typeName.indexOf("<") != -1) {
						typeName = typeName.replace(/^(.*)<(.*)>$/, function(whole, collectionType, elementType) {
							p.collection = true;
							p.multiplicityLower = 0;
							p.multiplicityUpper = "*";
							return elementType;
						});
					}
				}
				var comments = (doc.comment || "").split(/\r\n/g);
				var comment = "";
				for (var c = 0; c < comments.length; c++) {
					comment = comment + (c != 0 ? "\r\n" : "") + comments[c].replace(/^[\s*]*/, "").replace(/[\s]$/, "");
				}
				p.comment = comment;

				var type = this._findType(root, typeName).element;
				
				if (type) {
					this._insertAssociation(root, qualifiedName, doc, _class, p, type);
				}
				else {
					type = Ea._Base.PrimitiveType.getPrimitiveType(typeName);
					this._insertAttribute(root, qualifiedName, doc, _class, p, type);
				}
				
				var accesorName = p.name.substring(0,1).toUpperCase() + p.name.substring(1);
				var getterName = p.collection ? accesorName.replace(/y$/, "ie") + "s" : accesorName;
				
				var prefix = typeName == "Boolean" ? "is" : "get";
				var getter = (p._private ? "_" : "") + prefix + getterName;
				
				var comment = doc.comment ? (doc.comment.substring(0,1).toLowerCase() + doc.comment.substring(1)).split(".")[0] : "";
								
				this._insertAccessor(_class, p, getter, (comment ? "Returns " + comment : ""), type, []);
				accessors[getter] = true;
				
				if (!p.readOnly) {
					if (p.collection) {
						var adder = (p._private ? "_" : "") + "create" + accesorName;
						this._insertAccessor(_class, p, adder, (comment ? "Creates new " + p.name + " and adds it to " + comment : ""), type, [{
							name: "name",
							type: Ea._Base.PrimitiveType.getPrimitiveType("String")
						}, {
							name: "type",
							type: Ea._Base.PrimitiveType.getPrimitiveType("Class")
						}]);
						accessors[adder] = true;
						var remover = (p._private ? "_" : "") + "delete" + accesorName;
						this._insertAccessor(_class, p, remover, (comment ? "Deletes specified " + p.name + " and removes it from " + comment : ""), null, [{
							name: p.name,
							type: type
						}]);
						accessors[remover] = true;
					}
					else {
						
						var setter = (p._private ? "_" : "") + "set" + accesorName;
						this._insertAccessor(_class, p, setter, (comment ? "Sets " + comment : ""), null, [{
							name: p.name,
							type: type
						}]);
						accessors[setter] = true;
					}
				}
			}
			
		}

		for (var propertyIndex = 0; propertyIndex < properties.length; propertyIndex++) {
			
			var property = properties[propertyIndex];
			
			if (property.value.type == "FunctionExpression") {

				var propertyName = property.key.name;
				if (!(propertyName in accessors))
					this._insertMethod(root, qualifiedName, ast, _class, property, _static);
			}
			
		}
	},
	
	_insertAccessor: function(_class, p, name, comment, type, params) {
		var method = _class.getMethods().filter("this.getName() == '" + name + "'").first();
		if (!method) {
			info("* accessor changed: $", [name]);
			method = _class.createMethod(name);
		}
		if (p._private)
			method.setVisibility("Private");
		
		method.setType(type);
		method.setStereotype("accessor");
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
			parameter.update();
		}
	},
	
	_insertAttribute: function(root, qualifiedName, doc, _class, p, type) {
		
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
	
	_insertAssociation: function(root, qualifiedName, doc, _class, p, type) {
		
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
	
	_insertMethod: function(root, qualifiedName, ast, _class, property, _static) {
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
		
		var method = _class.getMethods().filter("this.getName() == '" + name + "'").first();
		if (!method) {
			info("* method changed");
			method = _class.createMethod(name);
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
			var type = this._findType(root, typeName).element || Ea._Base.PrimitiveType.getPrimitiveType(typeName);
			method.setType(type);
		}
		else {
			method.setType(null);
		}

		if (_static) {
			method.setStatic(true);
		}
		method.update();
		
		this._insertParams(root, qualifiedName, ast, property, method, doc);
	},
	
	_insertParams: function(root, qualifiedName, ast, property, method, doc) {
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
			
			var type = this._findType(root, typeName).element || Ea._Base.PrimitiveType.getPrimitiveType(typeName);
			parameter.setType(type);

			parameter.setNotes(param.comment || "");
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
