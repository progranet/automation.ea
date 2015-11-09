/*
   Copyright 2011-2015 300 D&C

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

include = function(library, params) {
	
	var inc = _include(library);

	if (!inc)
		return false;
	
	var _ownerArray = inc.qualifiedName.split(".");
	_ownerArray.pop();
	var _ownerString = _ownerArray.join(".");
	var owner = null;
	if (_ownerString) {
		owner = eval(_ownerString);
		inc.owner = owner;
	}
	
	var namespace = eval(inc.qualifiedName);
	if (!namespace.params)
		namespace.params = {};
	for (var param in params)
		namespace.params[param] = params[param];
	namespace.name = inc.qualifiedName.split(".").pop();
	namespace.qualifiedName = inc.qualifiedName;
	namespace.toString = function() {
		return this.qualifiedName;
	};
	namespace._loader = inc;
	namespace._extensions = [];
	
	namespace.findType = function(typeName) {
		if (!namespace.typeExists(typeName)) {
			namespace[typeName] = Core.Lang.extend(namespace, typeName, namespace._Base);
			warn("Not implemented type: $.$", [namespace.qualifiedName, typeName]);
		}
		return namespace[typeName];
	};	
	namespace.typeExists = function(typeName) {
		return (typeName in namespace);
	};
	namespace.extension = function(extension) {
		namespace._extensions.push(extension);
	};
	
	Core.enrichNamespace(namespace);
	if ("initialize" in namespace)
		namespace.initialize();
	if (owner && "addOwned" in owner)
		owner.addOwned(namespace);
	_included[inc.qualifiedName] = namespace;
	return namespace;
};

load = function(library) {
	
	var inc = _load(library);

	if (!inc)
		return false;
	
	eval(inc.source);	
};

_load = function(library) {

	var t = library.split("@");
	var qualifiedName = t[0];
	if (qualifiedName in _included) {
		warn("Library already included: " + qualifiedName);
		return false;
	}
	var _package = t[1] ? t[1].replace(/\./g, "\\") + "\\" : "";
	
	var file = null;
	var builded = false;
	var root = null;
	for (var ri = 0; ri < _scriptRoot.length; ri++) {
		root = _scriptRoot[ri];
		if (fileSystem.FileExists(root + _package + qualifiedName  + ".js")) {
			if (fileSystem.FileExists(root + ".build\\" + _package + qualifiedName  + ".js")) {
				
				sourceDate = new Date(fileSystem.GetFile(root + _package + qualifiedName  + ".js").DateLastModified);
				buildedDate = new Date(fileSystem.GetFile(root + ".build\\" + _package + qualifiedName  + ".js").DateLastModified);
				
				if (sourceDate < buildedDate) {
					file = fileSystem.OpenTextFile(root + ".build\\" + _package + qualifiedName  + ".js", 1);
					builded = true;
				}
			}
			if (!file) {
				file = fileSystem.OpenTextFile(root + _package + qualifiedName  + ".js", 1);
			}
			break;
		}
	}
	
	if (!file)
		throw new Error("Library not found: " + library);
	var source = file.ReadAll();

	/*var builded = false;
	var root = _scriptRoot[0];;
	var url = "https://raw.github.com/progranet/automation.ea/master/" + _package.replace(/\\/g, "/") + qualifiedName  + ".js";
	winHttpReq.Open("GET", url, false);
	winHttpReq.Send();
	var source = winHttpReq.ResponseText;
	//WriteOutput("Loader", "result:" + result, undefined);*/

	return {
		source: source,
		path: root + _package,
		root: root,
		_package: _package,
		qualifiedName: qualifiedName,
		builded: builded
	};
};

_include = function(library) {
	
	WriteOutput("Loader", "loading: " + library, undefined);

	var inc = _load(library);

	if (!inc)
		return false;
	
	if (!inc.builded)
		_build(inc);
	
	WriteOutput("Loader", "evaluating: " + inc.qualifiedName, undefined);

	try {
		eval(inc.source);
	}
	catch (error) {
		WriteOutput("Loader", "Source code of " + library + " does not evaluate correctly", undefined);
		WriteOutput("Loader", inc.source, undefined);
		
		throw error;
	}

	if (!inc.builded)
		_save(inc);
	
	return inc;
};

var lang = function(qualifiedName) {
	
	if (this.type == "ExpressionStatement" && this.expression.type == "AssignmentExpression" && this.expression.right.type == "CallExpression" && this.expression.right.callee.type == "Identifier") {
		var method = this.expression.right.callee.name;
		
		var properties = null,
			features = null,
			superClass = null;
		
		if (method == "define") {
			superClass = "Core.Types.Object";
			if (this.expression.right.arguments.length == 0) {
				this.expression.right.arguments.push({
					"type": "ObjectExpression",
					"properties": []
				});
			}
			features = this.expression.right.arguments[0];
			properties = this.expression.right.arguments[2];
		}
		else if (method == "extend") {
			var superClasses = this.expression.right.arguments[0];
			if (superClasses.type == "MemberExpression") {
				superClass = External.escodegen.generate(superClasses);
			}
			else if (superClasses.type == "ArrayExpression" && superClasses && superClasses.length != 0) {
				superClass = External.escodegen.generate(superClasses.elements[0]);
			}
			else {
				throw new Error("Unsupported super class declaration: " + External.escodegen.generate(superClasses));
			}
			if (this.expression.right.arguments.length == 1) {
				this.expression.right.arguments.push({
					"type": "ObjectExpression",
					"properties": []
				});
			}
			features = this.expression.right.arguments[1];
			properties = this.expression.right.arguments[3];
		}
		else {
			return false;
		}

		var typeName = this.expression.left.property.name;
		
		var processArray = function(array) {
			for (var e = 0; e < array.length; e++)
				processObject(array[e]);
		};
		
		var processObject = function(object) {
			
			for (var name in object) {
				
				var property = object[name];
				
				if (name == "type") {

					switch (property) {
					case "CallExpression":
						if (object.callee && object.callee.type == "MemberExpression" && object.callee.object.type == "Identifier" && object.callee.object.name == "_super") {
							if (object.callee.property.type == "Identifier") {
								var methodName = object.callee.property.name;
								object.callee = {
									"type": "MemberExpression",
									"object": {
										"type": "MemberExpression",
										"object": {
											"type": "ThisExpression"
										},
										"property": {
											"type": "Literal",
											"value": superClass + "." + methodName,
											"raw": "\"" + superClass  + "." + methodName + "\""
										},
										"computed": true
									},
									"property": {
										"type": "Identifier",
										"name": "call"
									},
									"computed": false
								};
								object.arguments.unshift({
									"type": "ThisExpression"
								});
							}
							else {
								throw new Error("Unsupported super class call: " + External.escodegen.generate(property));
							}
						}
						break;
					}
				}
				else {
					var type = typeof(property);
					if (type == "object") {
						if (property instanceof Array) {
							processArray(property);
						}
						else {
							processObject(property);
						}
					}
					else if (type == "string") {
						
					}
				}
			}
		};
		
		var methods = {};
		for (var p = 0; p < features.properties.length; p++) {
			var property = features.properties[p];
			if (property.value.type == "FunctionExpression") {
				methods[property.key.name] = property;
				processObject(property.value);
			}
		}

		if (!("create" in methods)) {
			var constructor = {
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "create"
				},
				"value": {
					"type": "FunctionExpression",
					"id": null,
					"params": [],
					"body": {
						"type": "BlockStatement",
						"body": [
							{
								"type": "ExpressionStatement",
								"expression": {
									"type": "CallExpression",
									"callee": {
										"type": "MemberExpression",
										"object": {
											"type": "MemberExpression",
											"object": {
												"type": "ThisExpression"
											},
											"property": {
												"type": "Literal",
												"value": superClass + ".create",
												"raw": "\"" + superClass  + ".create\""
											},
											"computed": true
										},
										"property": {
											"type": "Identifier",
											"name": "apply"
										},
										"computed": false
									},
									"arguments": [
										{
											"type": "ThisExpression"
										},
										{
											"type": "Identifier",
											"name": "arguments"
										}
									]
								}
							}
						]
					}
				},
				"kind": "init"
			};
			features.properties.push(constructor);
			methods.create = constructor;
		}

		if (properties) {
			properties = properties.properties;
			for (var p = 0; p < properties.length; p++) {
				var property = properties[p];
				ea2(property, features.properties, methods, qualifiedName + "." + typeName);
			}
		}
		
		this.expression.right.callee = {
	            "type": "MemberExpression",
	            "computed": false,
	            "object": {
	                "type": "MemberExpression",
	                "computed": false,
	                "object": {
	                    "type": "Identifier",
	                    "name": "Core"
	                },
	                "property": {
	                    "type": "Identifier",
	                    "name": "Lang"
	                }
	            },
	            "property": {
	                "type": "Identifier",
	                "name": method
	            }
	        };
		this.expression.right.arguments.unshift(
			{
                "type": "Literal",
                "value": qualifiedName,
                "raw": "'" + qualifiedName + "'"
			},		
			{
                "type": "Literal",
                "value": typeName,
                "raw": "'" + typeName + "'"
			});
		
		return true;
	}
	
	return false;
};

var ea2 = function(property, features, methods, qualifiedName) {
	
	var tags = property.key.commentsBefore.join("\r\n").split("@");
	var isCollection = false,
		isReadOnly = false,
		isPrivate = false,
		isDerived = false,
		typeName = null,
		singular = null;
		
	for (var ti = 0; ti < tags.length; ti++) {
		var tag = tags[ti];
		tag = tag.replace(/^\s*type\s+\{([^\}<]+)(<([^\{>]+)>)?[^\}]*\}/g, function(whole, type, nm, elementType) {
			typeName = type;
			property.value.properties.push({
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "type"
				},
				"value": {
					"type": "Literal",
					"value": type,
					"raw": "'" + type + "'"
				},
				"kind": "init"
			});
			if (elementType) {
				isCollection = true;
				property.value.properties.push({
					"type": "Property",
					"key": {
						"type": "Identifier",
						"name": "elementType"
					},
					"value": {
						"type": "Literal",
						"value": elementType,
						"raw": "'" + elementType + "'"
					},
					"kind": "init"
				});
			}
		});
		tag = tag.replace(/^\s*readOnly/g, function(whole) {
			isReadOnly = true;
			property.value.properties.push({
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "readOnly"
				},
				"value": {
					"type": "Literal",
					"value": true,
					"raw": "'true'"
				},
				"kind": "init"
			});
		});
		tag = tag.replace(/^\s*private/g, function(whole) {
			isPrivate = true;
			property.value.properties.push({
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "private"
				},
				"value": {
					"type": "Literal",
					"value": true,
					"raw": "'true'"
				},
				"kind": "init"
			});
		});
		tag = tag.replace(/^\s*derived/g, function(whole) {
			isDerived = true;
			property.value.properties.push({
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "derived"
				},
				"value": {
					"type": "Literal",
					"value": true,
					"raw": "'true'"
				},
				"kind": "init"
			});
		});
		tag = tag.replace(/^\s*aggregation\s+([a-z]+)\s*/g, function(whole, kind) {
			property.value.properties.push({
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "aggregation"
				},
				"value": {
					"type": "Literal",
					"value": kind,
					"raw": "'" + kind + "'"
				},
				"kind": "init"
			});
		});
		tag = tag.replace(/^\s*separator\s+([\S]+)/g, function(whole, separator) {
			property.value.properties.push({
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "separator"
				},
				"value": {
					"type": "Literal",
					"value": separator,
					"raw": "'" + separator + "'"
				},
				"kind": "init"
			});
		});
		tag = tag.replace(/^\s*assigment\s+([\S]+)/g, function(whole, assigment) {
			property.value.properties.push({
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "assigment"
				},
				"value": {
					"type": "Literal",
					"value": assigment,
					"raw": "'" + assigment + "'"
				},
				"kind": "init"
			});
		});
		tag = tag.replace(/^\s*qualifier\s+(\{(.+)\}\s+)?([a-zA-Z0-9_$]+)\s*/g, function(whole, _type, type, qualifier) {
			var qualifierFn = "this.get" + qualifier.charAt(0).toUpperCase() + qualifier.substr(1) + "()";
			property.value.properties.push({
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "key"
				},
				"value": {
					"type": "Literal",
					"value": qualifierFn,
					"raw": "'" + qualifierFn + "'"
				},
				"kind": "init"
			});
		});
		tag = tag.replace(/^\s*key\s+([A-Za-z_0-9]+)\s*/g, function(whole, key) {
			property.value.properties.push({
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "key"
				},
				"value": {
					"type": "Literal",
					"value": key,
					"raw": "'" + key + "'"
				},
				"kind": "init"
			});
		});
		tag = tag.replace(/^\s*single\s+([A-Za-z_0-9]+)\s*/g, function(whole, single) {
			singular = single;
			property.value.properties.push({
				"type": "Property",
				"key": {
					"type": "Identifier",
					"name": "single"
				},
				"value": {
					"type": "Literal",
					"value": single,
					"raw": "'" + single + "'"
				},
				"kind": "init"
			});
		});
	}
	
	var name = property.key.name;
	property.value.properties.push({
		"type": "Property",
		"key": {
			"type": "Identifier",
			"name": "name"
		},
		"value": {
			"type": "Literal",
			"value": name,
			"raw": "'" + name + "'"
		},
		"kind": "init"
	});
	
	var createAccessor = function(kind, accessorName) {

		var accessor = methods[accessorName];
		
		if (isDerived) {
			if (!accessor)
				throw new Error("Accessor: " + accessorName + " not defined for derived property: " + qualifiedName + "." + name);
			
			accessor.key.name = accessorName + "$inner";
		}
		else {
			if (accessor)
				throw new Error("Accessor name: " + accessorName + " already defined for property: " + qualifiedName + "." + name);
		}
		
		features.push({
			"type": "Property",
			"key": {
				"type": "Identifier",
				"name": accessorName
			},
			"value": {
				"type": "FunctionExpression",
				"id": null,
				"params": [],
				"body": {
					"type": "BlockStatement",
					"body": [
						{
							"type": "ReturnStatement",
							"argument": {
								"type": "CallExpression",
								"callee": {
									"type": "MemberExpression",
									"object": {
										"type": "MemberExpression",
										"object": {
											"type": "MemberExpression",
											"object": {
												"type": "MemberExpression",
												"object": {
													"type": "ThisExpression"
												},
												"property": {
													"type": "Identifier",
													"name": "_class"
												},
												"computed": false
											},
											"property": {
												"type": "Identifier",
												"name": "_properties"
											},
											"computed": false
										},
										"property": {
											"type": "Identifier",
											"name": name
										},
										"computed": false
									},
									"property": {
										"type": "Identifier",
										"name": kind
									},
									"computed": false
								},
								"arguments": [
									{
										"type": "ThisExpression"
									},
									{
										"type": "Identifier",
										"name": "arguments"
									}
								]
							}
						}
					]
				}
			},
			"kind": "init"
		});
	};

	var accessorName = name.replace(/^_+/g, "");
	accessorName = accessorName.substring(0,1).toUpperCase() + accessorName.substring(1);
	
	createAccessor("get", (isPrivate ? "_" : "") + (typeName == "Boolean" ? "is" : "get") + accessorName);
	
	if (!isReadOnly) {
		if (isCollection) {
			var mutatorName = singular || name.replace(/^_+/g, "").replace(/s$/, "");
			mutatorName = mutatorName.substring(0,1).toUpperCase() + mutatorName.substring(1);
			createAccessor("add", (isPrivate ? "_" : "") + "create" + mutatorName);
			createAccessor("remove", (isPrivate ? "_" : "") + "delete" + mutatorName);
		}
		else {
			createAccessor("set", (isPrivate ? "_" : "") + "set" + accessorName);
		}
	}
	
	property.value = {
			"type": "NewExpression",
			"callee": {
				"type": "MemberExpression",
				"object": {
					"type": "MemberExpression",
					"object": {
						"type": "MemberExpression",
						"object": {
							"type": "Identifier",
							"name": "Ea"
						},
						"property": {
							"type": "Identifier",
							"name": "_Base"
						},
						"computed": false
					},
					"property": {
						"type": "Identifier",
						"name": "Class"
					},
					"computed": false
				},
				"property": {
					"type": "Identifier",
					"name": isDerived ? "DerivedProperty" : "ApiProperty"
				},
				"computed": false
			},
			"arguments": [
				{
					"type": "Literal",
					"value": qualifiedName,
					"raw": "\"" + qualifiedName + "\""
				},
				property.value
			]
		};
};

var __loggers = ["error", "info", "warn", "debug", "_treeLogger", "_quietLogger", "__el", "__sl"];

_build = function(inc) {
	
	WriteOutput("Loader", "building: " + inc.qualifiedName, undefined);

	var ast = null;
	try {
		ast = External.acorn.parse(inc.source, {
			trackComments: true,
			strictSemicolons: true,
			allowTrailingCommas: false
		});
	}
	catch (error) {
		WriteOutput("Loader", "syntax error: " + JSON.stringify(error, null, '\t'), undefined);
		throw new Error("Syntax error:\r\n" + error.message + "\r\nin " + inc.qualifiedName + "\r\n");
	}

	for (var e = 0; e < ast.body.length; e++) {
		var expression = ast.body[e];
		lang.call(expression, inc.qualifiedName);
	}
	
	var protect = function(object, context) {
		var body = object.body.body;
		if (body.length != 0 && context.fn != "_log")
			object.body.body = [{
				"type": "TryStatement",
				"block": {
					"type": "BlockStatement",
					"body": body
				},
				"handlers": [
					{
						"type": "CatchClause",
						"param": {
							"type": "Identifier",
							"name": "e"
						},
						"guard": null,
						"body": {
							"type": "BlockStatement",
							"body": [
								{
									"type": "IfStatement",
									"test": {
										"type": "UnaryExpression",
										"operator": "!",
										"prefix": true,
										"argument": {
											"type": "MemberExpression",
											"object": {
												"type": "Identifier",
												"name": "e"
											},
											"property": {
												"type": "Identifier",
												"name": "__t"
											},
											"computed": false
										}
									},
									"consequent": {
										"type": "BlockStatement",
										"body": [
											{
												"type": "ExpressionStatement",
												"expression": {
													"type": "CallExpression",
													"callee": {
														"type": "Identifier",
														"name": "__el"
													},
													"arguments": [
														{
															"type": "Literal",
															"value": "$",
															"raw": "\"$\""
														},
														{
															"type": "ArrayExpression",
															"elements": [
																{
																	"type": "Identifier",
																	"name": "e"
																}
															]
														}
													]
												}
											},
											{
												"type": "ExpressionStatement",
												"expression": {
													"type": "AssignmentExpression",
													"operator": "=",
													"left": {
														"type": "MemberExpression",
														"object": {
															"type": "Identifier",
															"name": "e"
														},
														"property": {
															"type": "Identifier",
															"name": "__t"
														},
														"computed": false
													},
													"right": {
														"type": "Literal",
														"value": true
													}
												}
											}
										]
									},
									"alternate": null
								},
								{
									"type": "ExpressionStatement",
									"expression": {
										"type": "CallExpression",
										"callee": {
											"type": "Identifier",
											"name": "__sl"
										},
										"arguments": [
											{
												"type": "Literal",
												"value": "",
												"raw": "\"\""
											}
										]
									}
								},
								{
									"type": "ThrowStatement",
									"argument": {
										"type": "Identifier",
										"name": "e"
									}
								}
							]
						}
					}
				],
				"finalizer": null
			}];
	};
	
	var processArray = function(array, context) {
		for (var e = 0; e < array.length; e++)
			processObject(array[e], context);
	};
	
	var processObject = function(object, context) {
		for (var name in object) {
			var property = object[name];
			if (name == "type") {
				switch (property) {
				case "FunctionDeclaration":
					if (object.id) {
						context.fn = (context.path == "Program" ? "[global] " : "") + object.id.name;
					}
					else {
						context.fn = "";
					}
					protect(object, context);
					break;
				case "FunctionExpression":
					if (object.id) {
						context.fn = object.id.name;
					}
					else {
						switch (context.ast.type) {
						case "VariableDeclarator":
							context.fn = context.ast.id.name;
							break;
						case "Property":
							context.fn = context.ast.key.name;
							break;
						case "AssignmentExpression":
							context.fn = (context.path == "Program.ExpressionStatement.AssignmentExpression" ? "[global] " : "") + External.escodegen.generate(context.ast.left);
							break;
						case "CallExpression":
							context.fn = "";
							break;
						case "ArrayExpression":
							context.fn = "";
							break;
						default:
							throw new Error("Unsupported function context: " + context.ast.type);
						}
					}
					protect(object, context);
					break;
				case "CallExpression":
					if (object.callee) {
						var name = object.callee.name;
						if (name) {
							if (__loggers.indexOf(name) != -1) {
								object.callee = {
										"type": "Identifier",
										"name": "_log"
									};
								object.arguments.unshift({
									"type": "Literal",
									"value": name,
									"raw": "\"" + name + "\""
								},
								{
									"type": "ThisExpression"
								},
								{
									"type": "Literal",
									"value": context.fn,
									"raw": "\"" + context.fn + "\""
								});
							}
						}
						else {
							if (object.callee.property && object.callee.property.name == "forEach") {
								object.arguments.unshift({
									"type": "ThisExpression"
								});
							}
						}
					}
					break;
				}
			}
			else {
				var type = typeof(property);
				if (type == "object") {
					if (property instanceof Array) {
						processArray(property, {ast: object, fn: context.fn, parent: context, path: context.path});
					}
					else {
						processObject(property, {ast: object, fn: context.fn, parent: context, path: context.path + "." + object.type});
					}
				}
				else if (type == "string") {
					
				}
			}
		}
	};
	
	processObject(ast, {path: "Program"});
	
	WriteOutput("Loader", "generating: " + inc.qualifiedName, undefined);

	inc.source = External.escodegen.generate(ast, {
		format: {
			indent: {
				style: ""
			},
			quotes: "double",
			compact: true
		}
	});

	return inc;
};

_save = function(inc) {

	var path = inc.root + ".build\\" + inc._package;

	WriteOutput("Loader", "saving: " + path + inc.qualifiedName, undefined);
	
	var dirs = (".build\\" + inc._package).split("\\");
	var dir = inc.root;
	for (var di = 0; di < dirs.length; di++) {
		dir = dir + dirs[di] + "\\";
		if (!fileSystem.FolderExists(dir))
			fileSystem.CreateFolder(dir);
	}
	file = fileSystem.CreateTextFile(path + inc.qualifiedName  + ".js", true);
	file.Write(inc.source);
	file.Close();
};

CreateOutputTab("Loader");
ClearOutput("Loader");
//EnsureOutputVisible("Loader");

fileSystem = new ActiveXObject("Scripting.FileSystemObject");
winHttpReq = new ActiveXObject("WinHttp.WinHttpRequest.5.1");

External = {};

_included = {};
_scriptRoot = scriptRoot.split(";");

load("json2@External");
load("acorn@External");
load("escodegen@External");

load("Init");
load("Lang");

include("Core@Core");
