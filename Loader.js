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

include = function(libraryName, params) {
	//Session.Output("> " + libraryName);
	var t = libraryName.split("@");
	var qualifiedName = t[0];
	if (isIncluded(qualifiedName)) {
		warn("Library already included: " + qualifiedName);
		return;
	}
	var _package = (t[1] || "").replace(/\./g, "\\");
	var included = _include(qualifiedName, _package);
	var namespace = eval(qualifiedName);
	if (!namespace.params)
		namespace.params = {};
	for (var param in params)
		namespace.params[param] = params[param];
	namespace.name = qualifiedName.split(".").pop();
	namespace.qualifiedName = qualifiedName;
	namespace.toString = function() {
		return this.qualifiedName;
	};
	namespace._loader = included;
	Core.enrichNamespace(namespace);
	if ("initialize" in namespace)
		namespace.initialize();
	_included[qualifiedName] = namespace;
	return namespace;
};

External = {};

Core = false;

_included = {};
_scriptRoot = scriptRoot.split(";");

isIncluded = function(libraryName) {
	return (libraryName in _included);
};

_load = function(qualifiedName, _package) {
	var file = null;
	var libraryPath = null;
	for (var ri = 0; ri < _scriptRoot.length; ri++) {
		libraryPath = _scriptRoot[ri] + (_package ? _package + "\\" : "");
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
		path: libraryPath
	};
};

_include = function(qualifiedName, _package) {
	var loaded = _load(qualifiedName, _package);
	var source = loaded.source;
	if (Core)
		source = Core.enrichSource(qualifiedName, source);
	
	/*
	CreateOutputTab("External");
	WriteOutput("External", qualifiedName, undefined);
	var ast = null;
	try {
		ast = External.acorn.parse(source, {
			trackComments: true,
			strictSemicolons: true,
			allowTrailingCommas: false
		});
	}
	catch (error) {
		WriteOutput("Script", JSON.stringify(error, null, '\t'), undefined);
	}
	finally {
		//WriteOutput("External", "var ast = " + qualifiedName + " = " + JSON.stringify(ast, null, '\t') + ";", undefined);
		//var code = External.escodegen.generate(ast);
		//WriteOutput("External", "   " + code, undefined);
		//source = code;
	}*/
	eval(source);

	return loaded;
};

/*eval(_load("json2").source);
eval(_load("acorn").source);
eval(_load("escodegen").source);*/

eval(_load("Init").source);
eval(_load("Lang").source);

include("Core@Core");
include("Core.Helper@Core");
include("Core.Log@Core");
include("Core.Output@Core");
include("Core.Lang@Core");
include("Core.Types@Core");
include("Core.Target@Core");
