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
				
				//WriteOutput("Loader", sourceDate < buildedDate, undefined);
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

	eval(inc.source);

	if (!inc.builded)
		_save(inc);
	
	return inc;
};

_find = function(object, name, condition, context, found) {
	
	if (typeof object == "object") {
		if (object instanceof Array) {
			for (var i = 0; i < object.length; i++) {
				var value = object[i];
				_find(value, null, condition, context);
			}
		}
		else {
			try {
				condition.call(object, name, context);
			}
			catch (error) {}
			finally {}
			for (var name in object) {
				var value = object[name];
				_find(value, name, condition, context);
			}
		}
	}
};

var lang = function(name, context) {
	
	var method = this.right.callee.name;
	
	if (name = "expression" && this.right.type == "CallExpression" && this.right.callee.type == "Identifier" && (method == "extend" || method == "define")) {
		
		var typeName = this.left.property.name;
		this.right.callee = {
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
		this.right.arguments.unshift(
			{
                "type": "Literal",
                "value": context.qualifiedName,
                "raw": "'" + context.qualifiedName + "'"
			},		
			{
                "type": "Literal",
                "value": typeName,
                "raw": "'" + typeName + "'"
			});
		
		//WriteOutput("Loader", "/*define/extend*/" + context.qualifiedName + "." + typeName + " = " + JSON.stringify(this) + ";", undefined);
		
		return true;
	}
	return false;
};

var ea = function(name, context) {
	
	if (this.value.type == "CallExpression" && this.value.callee.type == "Identifier" && this.value.callee.name == "property") {
		
		this.value.callee = {
	            "type": "MemberExpression",
	            "computed": false,
	            "object": {
	                "type": "MemberExpression",
	                "computed": false,
	                "object": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "Identifier",
                            "name": "Ea"
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "_Base"
                        }
	                },
	                "property": {
	                    "type": "Identifier",
	                    "name": "Class"
	                }
	            },
	            "property": {
	                "type": "Identifier",
	                "name": "property"
	            }
	        };
		
		var tags = this.key.commentsBefore.join("\r\n").split("@");
		var ast = this;
		if (ast.value.arguments.length == 0) {
			ast.value.arguments.push({
                "type": "ObjectExpression",
                "properties": []
            });
		}
		for (var ti = 0; ti < tags.length; ti++) {
			var tag = tags[ti];
			tag = tag.replace(/^\s*type\s+\{([^\}<]+)(<([^\{>]+)>)?[^\}]*\}/g, function(whole, type, nm, elementType) {
				ast.value.arguments[0].properties.push({
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
					ast.value.arguments[0].properties.push({
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
			tag = tag.replace(/^\s*private/g, function(whole) {
				ast.value.arguments[0].properties.push({
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
				ast.value.arguments[0].properties.push({
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
				ast.value.arguments[0].properties.push({
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
			tag = tag.replace(/^\s*separator\s+(.+)\s*/g, function(whole, separator) {
				ast.value.arguments[0].properties.push({
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
			tag = tag.replace(/^\s*qualifier\s+(.+)\s*/g, function(whole, qualifier) {
				ast.value.arguments[0].properties.push({
					"type": "Property",
					"key": {
						"type": "Identifier",
						"name": "key"
					},
					"value": {
						"type": "Literal",
						"value": qualifier,
						"raw": "'" + qualifier + "'"
					},
					"kind": "init"
				});
			});
		}
		
		WriteOutput("Loader", "" + context.qualifiedName + "." + this.key.name + " = " + JSON.stringify(this) + ";", undefined);
	
		return true;
	}
	return false;
};

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

	_find(ast, null, lang, inc);
	_find(ast, null, ea, inc);
	
	WriteOutput("Loader", "generating: " + inc.qualifiedName, undefined);

	inc.source = External.escodegen.generate(ast, {
		format: {
			indent: {
				style: "\t"
			},
			quotes: "double"
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
External = {};

_included = {};
_scriptRoot = scriptRoot.split(";");

load("json2@External");
load("acorn@External");
load("escodegen@External");

load("Init");
load("Lang");

include("Core@Core");
