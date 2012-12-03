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
	var t = libraryName.split("@");
	var qualifiedName = t[0];
	if (isIncluded(qualifiedName)) {
		warn("Library already included: " + qualifiedName);
		return;
	}
	var _package = (t[1] ? t[1] + "." : "").replace(/\./g, "\\");
	if (!_scriptRoot)
		_scriptRoot = scriptRoot.split(";");
	var file = null;
	var libraryPath = null;
	for (var ri = 0; ri < _scriptRoot.length; ri++) {
		libraryPath = _scriptRoot[ri] + _package;
		try {
			file = new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(libraryPath + qualifiedName  + ".js", 1);
		}
		catch(e) {
			warn("Error: Source not found: " + libraryPath + qualifiedName  + ".js");
		}
		if (file) break;
	}
	if (!file)
		throw new Error("Library not found: " + libraryName);
	var source = file.ReadAll();
	if (Core)
		source = Core.enrichSource(qualifiedName, source);
	eval(source);
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
	namespace._loader = {
		path: libraryPath
	};
	if (Core)
		Core.enrichNamespace(namespace);
	if ("initialize" in namespace)
		namespace.initialize();
	_included[qualifiedName] = namespace;
	return namespace;
};

Core = false;

_included = {};
_scriptRoot = null;

isIncluded = function(libraryName) {
	return (libraryName in _included);
};


_logBuffer = {
	info: [],
	error: [],
	warn: [],
	debug: []
};

_info = function(message, params, level) {
	if (level)
		_logBuffer[level].push({
			message: message,
			params: params
		});
};

info = function(message, params) {
	_info(message, params, "info");
};

error = function(message, params) {
	_info(message, params, "error");
};

warn = function(message, params) {
	_info(message, params, "warn");
};

debug = function(message, params) {
	_info(message, params, "debug");
};

include("Core@Core");
include("Core.Helper@Core");
include("Core.Log@Core");
include("Core.Output@Core");
include("Core.Lang@Core");
include("Core.Types@Core");
include("Core.Target@Core");
