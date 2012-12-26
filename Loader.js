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
		throw new Error("Library not found: " + libraryName);
	
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
	
	var inc = _load(library);

	if (!inc)
		return false;
	
	WriteOutput("Loader", "loaded: " + inc.qualifiedName, undefined);

	if (!inc.builded)
		_build(inc);
	
	eval(inc.source);

	return inc;
};

var extend = "";

_find = function(object, condition, context, found) {
	
	found = found || [];
	
	for (var name in object) {
		var value = object[name];
		var match = false;
		try {
			match = condition.call(value, name, context);
		}
		catch (error) {
			
		}
		finally {
			if (match)
				found.push(value);
		}
		if (typeof value == "object")
			found = _find(value, condition, context, found);
	}
	
	return found;
	
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
		
		//WriteOutput("Loader", "/*1*/" + context.qualifiedName + "." + typeName + " = " + JSON.stringify(this) + ";", undefined);
		
		return true;
	}
	return false;
};

var ea = function(name, context) {
	
	var method = this.callee.name;
	
	if (this.type == "CallExpression" && this.callee.type == "Identifier" && (method == "attribute" || method == "derived")) {
		
		this.callee = {
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
	                    "name": "Class"
	                }
	            },
	            "property": {
	                "type": "Identifier",
	                "name": method
	            }
	        };
		
		//WriteOutput("Loader", "/*2*/prop = " + JSON.stringify(this) + ";", undefined);
	
		return true;
	}
	return false;
};

_build = function(inc) {
	
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
		throw new Error("Syntax error:\r\n" + error.message + "\r\nin " + library + "\r\n");
	}

	_find(ast, lang, inc);
	_find(ast, ea, inc);
	
	//WriteOutput("Loader", "var ast = " + inc.qualifiedName + " = " + JSON.stringify(ast, null, '\t') + ";", undefined);
	var source = External.escodegen.generate(ast);

	var dirs = (".build\\" + inc._package).split("\\");
	var dir = inc.root;
	for (var di = 0; di < dirs.length; di++) {
		dir = dir + dirs[di] + "\\";
		if (!fileSystem.FolderExists(dir))
			fileSystem.CreateFolder(dir);
	}
	var path = inc.root + ".build\\" + inc._package;
	WriteOutput("Loader", "building changed: " + path + inc.qualifiedName, undefined);
	file = fileSystem.CreateTextFile(path + inc.qualifiedName  + ".js", true);
	file.Write(source);
	file.Close();
	
	//WriteOutput("Loader", "   " + source, undefined);
	inc.source = source;
	
	return inc;
};

CreateOutputTab("Loader");
ClearOutput("Loader");
//EnsureOutputVisible("Loader");

fileSystem = new ActiveXObject("Scripting.FileSystemObject");
External = {};
Core = false;

_included = {};
_scriptRoot = scriptRoot.split(";");

load("json2@External");
load("acorn@External");
load("escodegen@External");

load("Init");
load("Lang");

include("Core@Core");
include("Core.Helper@Core");
include("Core.Log@Core");
include("Core.Output@Core");
include("Core.Lang@Core");
include("Core.Types@Core");
include("Core.Target@Core");
