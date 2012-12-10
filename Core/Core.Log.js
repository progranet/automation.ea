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
		level: {
			error: ["*"],
			exception: ["*"],
			stack: ["*"],
			info: ["*"],
			warn: ["*"],
			debug: ["*"],
			tree: ["*"],
			quiet: ["*"]
		},
		output: {
			format: {
				_default: function(message, params, level, debug, debugInfo) {
					message = Core.Output.exec(message, params);
					return (debug ? level + ": " + debugInfo + " " : "") + message;
				},
				exception: function(message, params, level) {
					message = params[0].description;
					return level + ": " + message;
				},
				stack: function(message, params, level, debug, debugInfo) {
					message = Core.Output.exec(message, params);
					return "      " + message + " @ " + debugInfo;
				}
			},
			level: {
				exception: "exception",
				stack: "stack"
			}
		}
	},

	_logs: {},
	
	/**
	 * Initializes namespace
	 * 
	 * @memberOf Core.Log
	 */
	initialize: function() {

		var callbackStacktrace = function(source, namespace, propertyName, qualifiedName, _static) {
			var parsed = Core.parse(source);
			source = "function " + parsed.name + "(" + parsed.joinedArguments + ") " +
			"{\n\
				try {"
					+ parsed.body + "\n\
				}\n\
				catch(e) {\n\
					if (!e.throwed) {\n\
						exception(\"$\", [e]);\n\
						e.throwed = true;\n\
					}\n\
					stack(\"\");\n\
					throw e;\n\
				}\n\
			}\n";
			return source;
		};
		Core.registerMethodEnrichment(callbackStacktrace);

		for (var level in this.params.level) {
			var mask = this.params.level[level];
			var outputFormat = this.params.output.format[this.params.output.level[level] || "_default"];
			this.registerLog(level, mask, outputFormat);
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
			level = this._logs[level];
		var fn = context[propertyName];
		if (!fn)
			return;
		var qualifiedName = fn.qualifiedName;
		if (!this._macth(level, qualifiedName))
			return;

		var contextName = fn._static === false ? context._class.qualifiedName : context.qualifiedName;
		var sourceFn = contextName + "." + propertyName;
		var source = sourceFn + (sourceFn == qualifiedName ? "" : " (" + qualifiedName.replace(/\.[^\.]+$/, "") + ")");
		var debugInfo = "" + (fn._static === false ? "" : "static ") + source;
		
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
				message = level.outputFormat(message, params, level.name, target.isDebug(), debugInfo);
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
	registerLog: function(level, mask, outputFormat) {
		this._logs[level] = {
			name: level,
			mask: mask,
			outputFormat: outputFormat,
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
	 * Registers specified target for logs
	 * 
	 * @memberOf Core.Log
	 * @param {String} level
	 * @param {Core.Target.AbstractTarget} target
	 */
	registerTarget: function(level, target) {
		if (typeof(level) == "string")
			level = this._logs[level];
		level.targets.push(target);
		/*if (_logBuffer[level.name]) {
			for (var mi = 0; mi < _logBuffer[level.name].length; mi++) {
				var buffered = _logBuffer[level.name][mi];
				this._log(level, this, "registerTarget", buffered.message, buffered.params);
			}
			delete _logBuffer[level.name];
		}*/
	}
};
