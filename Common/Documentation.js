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
		
		//application.getRepository().cacheInfo();
		
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
	
	_findOwner: function(root, qualifiedName) {
		
		var array = qualifiedName.split(".");
		var name = array.pop();
		var namespace = root;
		for (var ni = 0; ni < array.length; ni++) {
			var _name = array[ni];
			// TODO nie dzia³a filtrowanie:
			var filter = "this.getName() == '" + _name + "'";
			namespace = namespace.getPackages().filter(filter).first();
		}
		return {
			namespace: namespace,
			name: name
		};
	},
	
	_findPackage: function(root, qualifiedName) {
		var found = this._findOwner(root, qualifiedName);
		found._package = found.namespace.getPackages().filter("this.getName() == '" + found.name + "'").first();
		return found;
	},
	
	_findType: function(root, qualifiedName) {
		var found = this._findOwner(root, qualifiedName);
		found.type = found.namespace.getElements().filter("this.getName() == '" + found.name + "'").first();
		return found;
	},
	
	_insertPackage: function(root, qualifiedName, ast) {
		
		info("package:$", [qualifiedName]);
		var found = this._findPackage(root, qualifiedName);
		var _package = found._package;
		if (!_package) {
			info("* package changed");
			_package = found.namespace.createPackage(found.name);
		}
		
		_package.getElement().setAlias(qualifiedName);
		_package.getElement().update();
		
		this._insertSingleton(root, qualifiedName, ast);
		this._insertClasses(root, qualifiedName, ast);
		
		return _package;
	},
	
	_insertSingleton: function(root, qualifiedName, ast) {

		info("  singleton:$", [qualifiedName]);

		var found = this._findType(root, qualifiedName);
		var singleton = found.type;
		if (!singleton) {
			info("  * singleton changed");
			singleton = found.namespace.createElement(found.name, Ea.Element.Class);
		}
		singleton.setStereotype("singleton");
		singleton.update();
		
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
				this._bufferClassProperties(root, qualifiedName, ast, singleton, properties);
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
				
				var _class = found.type;
				if (!_class) {
					info("  * class changed");
					_class = found.namespace.createElement(found.name, Ea.Element.Class);
				}
				_class.update();
				
				if (!baseClass && qualifiedName != "Core.Types.Object")
					baseClass = "Core.Types.Object";
				
				if (baseClass) {
					baseClass = this._findType(root, baseClass).type;
					var generalization = _class.getConnectors().filter(Ea.Connector.Generalization).first();
					if (!generalization)
						_class.createConnector("", Ea.Connector.Generalization, baseClass);
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
		for (var prp = 0; prp < properties.length; prp++) {
			var property = properties[prp];
			if (property.value.type == "FunctionExpression") {
				
				var _private = property.key.name.charAt(0) == "_";
				var notes = "";
				
				var commentsBefore = property.key.commentsBefore ? property.key.commentsBefore.pop() : "";
				var doc = this._parseDoc(commentsBefore);
				var type = "any";
				if (doc) {
					type = "void";
					if (doc.type && doc.type.length != 0) {
						type = doc.type[0].type;
					}
					if (doc["private"])
						_private = true;
					notes = doc.comment;
				}
				if (_private)
					continue;

				info("method:$.$", [qualifiedName, property.key.name]);
				
				var method = _class.getMethods().filter("this.getName() == '" + property.key.name + "'").first();
				if (!method) {
					info("* method changed");
					method = _class.createMethod(property.key.name);
				}
				
				method.setNotes(notes);
				if (_private)
					method.setVisibility("Private");
				
				var multiplicityLower = 1;
				var multiplicityUpper = 1;
				if (type.indexOf("<") != -1) {
					type = type.replace(/^(.*)<(.*)>$/, function(whole, collectionType, elementType) {
						multiplicityLower = 0;
						multiplicityUpper = "*";
						return elementType;
					});
				}
				if (type.indexOf(".") != -1) {
					//info("return>>>1:$", [type]);
					type = this._findType(root, type).type;
					//info("return>>>2:$", [type]);
					method._setClassifier(type);
					method._setReturnType(type.getName());
				}
				else {
					method._setReturnType(type);
					
				}
				if (_static) {
					method.setStatic(true);
				}
				method.update();
				
				this._insertParams(root, qualifiedName, ast, property, method, doc);
			}
			else if (property.value.type == "CallExpression" && 
					property.value.callee.type == "Identifier" && property.value.callee.name == "property") {

				var propertyName = property.key.name.substr(1);
				var _private = false;

				var commentsBefore = property.key.commentsBefore ? property.key.commentsBefore.pop() : "";
				var doc = this._parseDoc(commentsBefore) || {};

				if (doc["private"])
					_private = true;
				
				if (_private)
					continue;
				
				info("property:$.$", [qualifiedName, propertyName]);
				
				var multiplicityLower = 1;
				var multiplicityUpper = 1;
				var type = "String";

				if (doc.type && doc.type.length != 0) {
					type = doc.type[0].type;
					if (type.indexOf("<") != -1) {
						type = type.replace(/^(.*)<(.*)>$/, function(whole, collectionType, elementType) {
							multiplicityLower = 0;
							multiplicityUpper = "*";
							return elementType;
						});
					}
				}

				if (type.indexOf(".") != -1) {
					//info(">>>1:$", [type]);
					type = this._findType(root, type).type;
					//info(">>>2:$", [type]);
					
					var association = _class.getConnectors().filter("this.instanceOf(Ea.Connector.Association) && this.getSupplierEnd().getRole() == '" + propertyName + "'").first();
					if (!association) {
						info("* association changed");
						association = _class.createConnector("", Ea.Connector.Association, type);
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
					if (multiplicityLower != 1 || multiplicityUpper != 1)
						supplierEnd.setMultiplicity(multiplicityLower + ".." + multiplicityUpper);
					else
						supplierEnd.setMultiplicity("");
					supplierEnd.setRole(propertyName);
					supplierEnd.setNotes(doc.comment || "");
					if (doc["derived"])
						supplierEnd.setDerived(true);
					if (doc["qualifier"])
						supplierEnd.setQualifier(doc["qualifier"][0].comment + ":" + doc["qualifier"][0].type);
					if (_private)
						supplierEnd.setVisibility("Private");

					supplierEnd.update();
				}
				else {
					var attribute = _class.getAttributes().filter("this.getName() == '" + propertyName + "'").first();
					if (!attribute) {
						info("* property changed");
						attribute = _class.createAttribute(propertyName);
					}
					if (_private)
						attribute.setVisibility("Private");
					attribute.setNotes(doc.comment || "");

					attribute._setPrimitiveType(type);
					if (doc["derived"])
						attribute.setDerived(true);
					attribute.setStereotype("property");
					
					// TODO: manage changes to [1..1]
					if (multiplicityLower != 1 || multiplicityUpper != 1) {
						attribute.setLower(multiplicityLower);
						attribute.setUpper(multiplicityUpper);
					}
					attribute.update();
				}
			}
		}
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
			
			var type = param.type || "any";
			var multiplicityLower = 1;
			if (type.charAt(0) == "?") {
				multiplicityLower = 0;
				type = type.substr(1);
			}
			if (type.indexOf("|") != -1) {
				info("!!!!!!!!!!!!!!!! $", [type]);
			}
			var multiplicityUpper = 1;
			if (type.indexOf("<") != -1) {
				type = type.replace(/^(.*)<(.*)>$/, function(whole, collectionType, elementType) {
					multiplicityLower = 0;
					multiplicityUpper = "*";
					return elementType;
				});
			}
			if (type.indexOf(".") != -1) {
				//info("param>>>1:$", [type]);
				try {
					type = this._findType(root, type).type;
					//info("param>>>2:$", [type]);
					parameter._setClassifier(type);
					parameter._setPrimitiveType(type.getName());
				}
				catch (exception) {
					//info("param!!!3:$", [type]);
				}
			}
			else {
				parameter._setPrimitiveType(type);
				
			}
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
