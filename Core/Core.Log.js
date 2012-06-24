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

Core.Log = {

	params: {
		error: ["*"],
		debug: ["*"],
		info: ["*"],
		warn: ["*"]
	},

	logs: {
		error: function(propertyName, message, params) {
			Core.Log._log(Core.Log.logs.error, this, propertyName, message, params);
		},
		debug: function(propertyName, message, params) {
			Core.Log._log(Core.Log.logs.debug, this, propertyName, message, params);
		},
		info: function(propertyName, message, params) {
			Core.Log._log(Core.Log.logs.info, this, propertyName, message, params);
		},
		warn: function(propertyName, message, params) {
			Core.Log._log(Core.Log.logs.warn, this, propertyName, message, params);
		}
	},
	
	pattern: null,
	
	initialize: function() {

		var pattern = "", i = 0;
		var logs = Core.Log.logs;
		for (var ln in logs) {
			logs[ln].name = ln;
			logs[ln].mask = Core.Log.params[ln] || [];
			logs[ln].targets = [];
			pattern = pattern + (i++ > 0 ? "|" : "") + ln;
		}

		pattern = (new RegExp("(([^\\.]\\s*)(" + pattern + ")\\s*\\()", "g"));
		Core.Log.pattern = pattern.compile(pattern);
		
		var callbackStacktrace = function(fn, context, propertyName, qualifiedName, _static) {
			var bio = fn.indexOf("{");
			fn = fn.substring(0, bio) +
			"{\n\
				try {" + fn.substring(bio + 1, fn.length - 2) +	"\n\
				}\n\
				catch(e) {\n\
					if (e.throwed) {\n\
						error(\"^      \");\n\
					}\n\
					else {\n\
						error(\"!exception: \" + e.description);\n\
						error(\"^      \");\n\
						/*for (var a = 0; a < arguments.length; a++) {\n\
							var argument = arguments[a];\n\
							error(\"^      \" + typeof argument);\n\
						}*/\n\
						e.throwed = true;\n\
					}\n\
					throw e;\n\
				}\n\
			}\n";
			return fn;
		};
		Core.enrichMethodRegister(callbackStacktrace);

		var callbackLogs = function(fn, context, propertyName, qualifiedName, _static) {
			fn = fn.replace(Core.Log.pattern, function($0, $1, $2, $3) {
				return $2 + "Core.Log.logs." + $3 + ".call(this, \"" + propertyName + "\", ";
			});
			return fn;
		};
		Core.enrichMethodRegister(callbackLogs);
		
		/*var callbackSource = function(qualifiedName, source) {
			var lines = source.split(/\r\n/);
			source = "";
			for (var ln = 0; ln < lines.length; ln++) {
				var line = lines[ln];
				if (/;\s*$/.test(line)) {
					line = line + "___ln=" + (ln + 1) + ";";
				}
				source = source + line + "\r\n";
			}
			info(source);
			return source;
		};
		Core.enrichSourceRegister(callbackSource);*/

		Core.enrichNamespace(Core);
	},
	
	isLogged: function(level, namespace) {
		var lt = level.mask;
		for (var pi = 0; pi < lt.length; pi++) {
			var p = lt[pi];
			if (p == "*") {
				return true;
			}
			else if (p.charAt(p.length - 1) == "*") {
				if (namespace.indexOf(p.substring(0, p.length - 2)) == 0)
					return true;
			}
			else {
				if (namespace == p)
					return true;
			}
		}
		return false;
	},
	
	_log: function(level, context, propertyName, message, params) {
		if (typeof(level) == "string")
			level = Core.Log.logs[level];
		var fn = context[propertyName];
		if (!fn)
			return;
		var qualifiedName = fn.qualifiedName;
		if (!Core.Log.isLogged(level, qualifiedName)) return;

		message = Core.Output.exec(message, params);
		var c0 = message ? message.charAt(0) : "";
		var s = (c0 == "^" ? 1 : (c0 == "!" ? 2 : false));
		if (s) message = message.substring(1);

		var contextName = fn.static === false ? context._class.qualifiedName : context.qualifiedName;
		var sourceFn = contextName + "." + propertyName;
		var sourceAt = qualifiedName;
		var source = sourceFn + (sourceFn == sourceAt ? "" : " @ " + sourceAt.replace(/\.[^\.]+$/, ""));
		var debugInfo = level.name + ": {" + (fn.static === false ? "" : "static ") + source + "} ";
		
		for (var ti = 0; ti < level.targets.length; ti++) {
			var target = level.targets[ti];
			message = (s == 1 ? message + " " : "") + (s == 2 ? "" : (target.isDebug() ? debugInfo : "")) + (s == 1 ? "" : message);
			target.write(message);
		}
	},
	
	registerTarget: function(level, target) {
		if (typeof(level) == "string")
			level = Core.Log.logs[level];
		level.targets.push(target);
	}
};

include("Core.Output@Core");
