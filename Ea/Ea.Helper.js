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

/**
 * @namespace
 */
Ea.Helper = {
		
	params: {
		indent: "      "
	},
	
	/**
	 * @memberOf Ea.Helper
	 * @param type
	 * @type {Boolean}
	 */
	isCollectionType: function(type) {
		return Core.Lang.isClass(type) && (type == Core.Types.Collection || type.isSubclassOf(Core.Types.Collection));
	},
	
	typeEval: function(type) {
		var _type = type;
		if (typeof type == "string")
			type = eval(type);
		if (!type)
			throw new Error("Undefined type" + (_type ? " [" + _type + "]" : ""));
		return type;
	},
	
	inspect: function(object) {
		this._inspect(object, 0, "$ = {", []);
	},
	
	_ids: {},
	
	_indent: function(number) {
		var indent = "";
		for (var i = 0; i < number; i++) {
			indent = indent + this.params.indent;
		}
		return indent;
	},

	_expand: function(template, params, value, indent, aggregation) {
		if (Ea.Types.Any.isInstance(value)) {
			if (aggregation == "composite" || aggregation == "shared") {
				this._inspect(value, indent + 1, template + " = {", params);
				return;
			}
			template = template + " = {...}";
		}
		params.push(value);
		info(this._indent(indent + 1) + template, params);
	},
	
	_inspect: function(object, indent, template, params) {
		
		var type = object._class;
		var attributes = Ea.Class.getAttributes(type);
		
		params.push(object);
		info(this._indent(indent) + template, params);

		if (this._ids[object.__id__]) {
			info(this._indent(indent + 1) + "#LOOP#");
		}
		else {
			this._ids[object.__id__] = object;
			for (var ai = 0; ai < attributes.length; ai++) {
				
				var property = attributes[ai];
				var value = property.get(object);
				
				var params = {
					name: property.name.replace(/^_+/, ""),
					_private: property.private,
					aggregation: property.aggregation,
					type: property.type,
					isCollection: value && property.type.isClass && value.instanceOf(Core.Types.Collection)
				};
				params.elementType = params.isCollection ? property.elementType : null;
				params.typeName = params.isCollection ? Core.Output.getString(params.type) + "<" + Core.Output.getString(params.elementType) + ">" : Core.Output.getString(params.type);
				params.template = (params._private ? "-" : "") + (property.derived ? "/" : "") + params.name + " [" + params.typeName + "]";

				if (params.isCollection) {
					if (value.instanceOf(Core.Types.Map)) {
						if (value.isEmpty()) {
							info(this._indent(indent + 1) + "$ = {}", [params.template]);
						}
						else {
							info(this._indent(indent + 1) + "$ = {", [params.template]);
							value.forEach(function(value, key) {
								this._expand("$ = $", [key], value, indent + 1, params.aggregation);
							});
							info(this._indent(indent + 1) + "}");
						}
					}
					else {
						if (value.isEmpty()) {
							info(this._indent(indent + 1) + "$ = []", [params.template]);
						}
						else {
							info(this._indent(indent + 1) + "$ = [", [params.template]);
							value.forEach(function(value, index) {
								this._expand("$", [], value, indent + 1, params.aggregation);
							});
							info(this._indent(indent + 1) + "]");
						}
					}
				}
				else {
					this._expand("$ = $", [params.template], value, indent, params.aggregation);
				}
				
			}
		}
		info(this._indent(indent) + "}");
	},
	
	reverse: function(rootPackage, library) {
		
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
				Ea.Helper.reverse(rootPackage, library);
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
				this._insertClassProperties(root, qualifiedName, ast, singleton, properties);
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
				
				if (baseClass) {
					baseClass = this._findType(root, baseClass).type;
					//_class.getConnectors();
					_class.createConnector("", Ea.Connector.Generalization, baseClass);
				}

				if (methods)
					this._insertClassProperties(root, qualifiedName, ast, _class, methods);
				if (staticMethods)
					this._insertClassProperties(root, qualifiedName, ast, _class, staticMethods, true);
				
			}
		}
	},

	_insertClassProperties: function(root, qualifiedName, ast, _class, properties, _static) {
		for (var prp = 0; prp < properties.length; prp++) {
			var property = properties[prp];
			if (property.value.type == "FunctionExpression") {
				
				info("    method:$", [property.key.name]);
				
				var method = _class.getMethods().filter("this.getName() == '" + property.key.name + "'").first();
				if (!method) {
					info("    * method changed");
					method = _class.createMethod(property.key.name);
				}
				
				var commentsBefore = property.key.commentsBefore ? property.key.commentsBefore.pop() : "";
				var doc = this._parseDoc(commentsBefore);
				var type = "any";
				if (doc) {
					type = "void";
					if (doc.type && doc.type.length != 0) {
						type = doc.type[0].type;
					}
					method.setNotes(doc.comment);
					if (doc["private"])
						method.setVisibility("Private");
				}
				method._setReturnType(type);
				if (_static) {
					method.setStatic(true);
				}
				method.update();
				
				this._insertParams(root, qualifiedName, ast, property, method, doc);
			}
			else if (property.value.type == "CallExpression" && 
					property.value.callee.type == "Identifier" && property.value.callee.name == "property") {

				info("    property:$", [property.key.name]);
				
				var attribute = _class.getAttributes().filter("this.getName() == '" + property.key.name + "'").first();
				if (!attribute) {
					info("    * property changed");
					attribute = _class.createAttribute(property.key.name);
				}
				
				var commentsBefore = property.key.commentsBefore ? property.key.commentsBefore.pop() : "";
				var doc = this._parseDoc(commentsBefore);
				var type = "String";
				var multiplicityUpper = 1;
				if (doc) {
					attribute.setNotes(doc.comment);
					if (doc.type && doc.type.length != 0) {
						type = doc.type[0].type;
						if (type.indexOf("<") != -1) {
							type = type.replace(/^(.*)<(.*)>$/, function(whole, collectionType, elementType) {
								multiplicityUpper = "*";
								return elementType;
							});
						}
						attribute.setLower(0);
						attribute.setUpper(multiplicityUpper);
					}
					if (doc["private"])
						attribute.setVisibility("Private");
					if (doc["derived"])
						attribute.setDerived(true);
				}
				if (type.indexOf(".") != -1) {
					info(">>>$", [type]);
					type = this._findType(root, type).type;
					attribute._setClassifier(type);
				}
				else
					attribute._setPrimitiveType(type);
				attribute.setStereotype("property");
				attribute.update();
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
			
			info("      param:$", [paramName]);
			var parameter = method.getParameters().filter("this.getName() == '" + paramName + "'").first();
			if (!parameter) {
				info("      * param changed");
				parameter = method.createParameter(paramName);
			}
			
			parameter._setPrimitiveType(param.type || "any");
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
		var doc = {};
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

Ea.Helper.Target = extend(Core.Target.AbstractTarget, /** @lends Ea.Helper.Target# */ {
	
	_name: null,
	
	create: function(name, debug) {
		_super.create(debug);
		this._name = name;
		Ea.getDefaultApplication().getRepository().showOutput(this._name);
		Ea.getDefaultApplication().getRepository().clearOutput(this._name);
	},
	
	/**
	 * @memberOf Ea.Helper.Target#
	 */
	write: function(message) {
		if (this._type == Core.Target.Type.TREE)
			message = message.replace(/\|/g, "      |").replace(/\-/g, "—").replace(/\+/g, "[•]");
		Ea.getDefaultApplication().getRepository().writeOutput(this._name, message);
	}
});

Ea.Helper.Log = define(/** @lends Ea.Helper.Log# */{
	
	_path: null,
	
	create: function(element) {
		_super.create();
		this._path = [];
		var parent = element.getParent();
		if (parent) {
			var parentPath = Ea.Helper.Log.getLog(parent).getPath();
			for (var p = 0; p < parentPath.length; p++) {
				this._path.push(parentPath[p]);
			}
		}
		this._path.push(element);
	},
	
	/**
	 * @memberOf Ea.Helper.Log#
	 */
	getPath: function() {
		return this._path;
	},
	
	log: function() {
		
		var path = this.getPath();
		var _tab = function(count, string) {
			var gen = "";
			for (var i = 0; i < count; i++)
				gen = gen + string;
			return gen;
		};

		if (path.length > 0) {
			for (var p = 0; p < path.length; p++) {
				if (!Ea.Helper.Log._current || p >= Ea.Helper.Log._current.length || Ea.Helper.Log._current[p] != path[p]) {
					var element = path[p];
					var string = (element.instanceOf(Ea.Package._Base) ? "+" : "") + " " + element;
					_treeLogger(_tab(p, "|") + "-" + string);
				}
			}
			Ea.Helper.Log._current = path;
		}
	}
},
{
	_current: null,
	
	_logs: {},

	getLog: function(element) {
		if (!Ea.Helper.Log._logs[element.getGuid()])
			Ea.Helper.Log._logs[element.getGuid()] = new Ea.Helper.Log(element);
		return Ea.Helper.Log._logs[element.getGuid()];
	}
});
