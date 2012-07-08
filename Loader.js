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
	var source;
	try {
		source = new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(scriptRoot + _package + qualifiedName  + ".js", 1).ReadAll();
	}
	catch(e) {
		throw new Error("Library not found: " + libraryName);
	}
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
		package: _package
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
	Repository.WriteOutput("Script", message + " (params: [" + params.join(", ") + "])", undefined);
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
include("Core.Log@Core");
include("Core.Output@Core");
include("Core.Lang@Core");
include("Core.Types@Core");
include("Core.Target@Core");
