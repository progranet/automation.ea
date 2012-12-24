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
	var libraryPath = null;
	for (var ri = 0; ri < _scriptRoot.length; ri++) {
		libraryPath = _scriptRoot[ri] + _package;
		try {
			file = new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(libraryPath + qualifiedName  + ".js", 1);
		}
		catch(e) {}
		if (file) break;
	}
	if (!file)
		throw new Error("Library not found: " + libraryName);
	
	var source = file.ReadAll();
	
	return {
		source: source,
		path: libraryPath,
		_package: _package,
		qualifiedName: qualifiedName
	};
};

_include = function(library) {
	
	var inc = _load(library);
	if (!inc)
		return false;
	
	if (Core)
		inc.source = Core.enrichSource(inc.qualifiedName, inc.source);
	
	CreateOutputTab("Loader");
	WriteOutput("Loader", inc.qualifiedName, undefined);

	var ast = null;
	try {
		ast = External.acorn.parse(inc.source, {
			trackComments: true,
			strictSemicolons: true,
			allowTrailingCommas: false
		});
	}
	catch (error) {
		WriteOutput("Loader", JSON.stringify(error, null, '\t'), undefined);
		throw new Error("Syntax error:\r\n" + error.message + "\r\nin " + library + "\r\n");
	}
	finally {
		//WriteOutput("Loader", "var ast = " + inc.qualifiedName + " = " + JSON.stringify(ast, null, '\t') + ";", undefined);
		var source = External.escodegen.generate(ast);
		//WriteOutput("Loader", "   " + source, undefined);
		inc.source = source;
	}
	eval(inc.source);

	return inc;
};

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
