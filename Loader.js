/*
   Copyright 2011-2014 300 D&C

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
		throw error;
	}

	if (!inc.builded)
		_save(inc);
	
	return inc;
};

var lang = function(qualifiedName) {
	
	if (this.type == "ExpressionStatement" && this.expression.type == "AssignmentExpression" && this.expression.right.type == "CallExpression" && this.expression.right.callee.type == "Identifier") {
		var method = this.expression.right.callee.name;
		
		var properties = null;
		
		if (method == "define") {
			properties = this.expression.right.arguments[2];
		}
		else if (method == "extend") {
			properties = this.expression.right.arguments[3];
		}
		else {
			return false;
		}
		
		if (properties) {
			properties = properties.properties;
			for (var p = 0; p < properties.length; p++) {
				var property = properties[p];
				ea2(property);
			}
		}

		var typeName = this.expression.left.property.name;
		
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

var ea2 = function(property) {
	
	var tags = property.key.commentsBefore.join("\r\n").split("@");
	for (var ti = 0; ti < tags.length; ti++) {
		var tag = tags[ti];
		tag = tag.replace(/^\s*type\s+\{([^\}<]+)(<([^\{>]+)>)?[^\}]*\}/g, function(whole, type, nm, elementType) {
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

	for (var e = 0; e < ast.body.length; e++) {
		var expression = ast.body[e];
		lang.call(expression, inc.qualifiedName);
	}
	
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
