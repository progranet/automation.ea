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
Core.Log = {

	params: {
		error: ["*"],
		info: ["*"],
		warn: ["*"],
		debug: ["*"],
		tree: ["*"]
	},

	_logs: {},
	
	/**
	 * Initializes namespace
	 * 
	 * @memberOf Core.Log
	 */
	initialize: function() {

		var callbackStacktrace = function(source, namespace, propertyName, qualifiedName, _static) {
			var bio = source.indexOf("{");
			source = source.substring(0, bio) +
			"{\n\
				try {"
					+ source.substring(bio + 1, source.length - 2) + "\n\
				}\n\
				catch(e) {\n\
					if (e.throwed) {\n\
						error(\"^      \");\n\
					}\n\
					else {\n\
						error(\"!exception: \" + e.description);\n\
						error(\"^      \");\n\
						e.throwed = true;\n\
					}\n\
					throw e;\n\
				}\n\
			}\n";
			return source;
		};
		Core.registerMethodEnrichment(callbackStacktrace);

		for (var level in Core.Log.params) {
			this.registerLog(level, Core.Log.params[level]);
		}
		
		Core.enrichNamespace(Core);
	},
	
	/**
	 * @private
	 */
	_macth: function(level, namespace) {
		var lt = level.mask;
		for (var pi = 0; pi < lt.length; pi++) {
			var p = lt[pi];
			if (p == "*" || p == namespace || (p.charAt(p.length - 1) == "*" && namespace.indexOf(p.substring(0, p.length - 2)) == 0))
				return true;
		}
		return false;
	},
	
	/**
	 * @private
	 */
	_log: function(level, context, propertyName, message, params) {
		if (typeof(level) == "string")
			level = Core.Log._logs[level];
		var fn = context[propertyName];
		if (!fn)
			return;
		var qualifiedName = fn.qualifiedName;
		if (!Core.Log._macth(level, qualifiedName))
			return;

		var contextName = fn.static === false ? context._class.qualifiedName : context.qualifiedName;
		var sourceFn = contextName + "." + propertyName;
		var sourceAt = qualifiedName;
		var source = sourceFn + (sourceFn == sourceAt ? "" : " @ " + sourceAt.replace(/\.[^\.]+$/, ""));
		var debugInfo = level.name + ": {" + (fn.static === false ? "" : "static ") + source + "} ";
		
		message = Core.Output.exec(message, params);
		var description = message.charAt(0) == "!";
		var stack = message.charAt(0) == "^";
		if (description || stack)
			message = message.substring(1);

		if (level.targets.length == 0) {
			//_info(message, params, level.name);
			/*_logBuffer[level.name].push({
				message: message,
				params: params
			});*/
		}
		else {
			for (var ti = 0; ti < level.targets.length; ti++) {
				var target = level.targets[ti];
				message = (stack ? message + " " : "") + (description ? "" : (target.isDebug() ? debugInfo : "")) + (stack ? "" : message);
				target.write(message);
			}
		}
	},
	
	/**
	 * Registers log on specified logging level and mask
	 * 
	 * @memberOf Core.Log
	 * @param {String} level
	 * @param {String} mask
	 */
	registerLog: function(level, mask) {
		Core.Log._logs[level] = {
			name: level,
			mask: mask,
			targets: []
		};

		var callbackLogs = function(source, namespace, propertyName, qualifiedName, _static) {
			return source.replace(new RegExp("([^\\.\\w]\\s*)" + level + "\\s*\\(", "g"), function(whole, prefix) {
				return prefix + "Core.Log._log(\"" + level + "\", this, \"" + propertyName + "\", ";
			});
		};
		Core.registerMethodEnrichment(callbackLogs);
	},
	
	/**
	 * Registers target for logs
	 * 
	 * @memberOf Core.Log
	 * @param {Object} level
	 * @param {Core.Target.AbstractTarget} target
	 */
	registerTarget: function(level, target) {
		if (typeof(level) == "string")
			level = Core.Log._logs[level];
		level.targets.push(target);
		/*if (_logBuffer[level.name]) {
			for (var mi = 0; mi < _logBuffer[level.name].length; mi++) {
				var buffered = _logBuffer[level.name][mi];
				Core.Log._log(level, Core.Log, "registerTarget", buffered.message, buffered.params);
			}
			delete _logBuffer[level.name];
		}*/
	}
};
