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
			info: ["*"],
			warn: ["*"],
			debug: ["*"],

			_treeLogger: ["*"],
			_quietLogger: ["*"],

			__el: ["*"],
			__sl: ["*"]
		},
		output: {
			format: {
				_default: function(message, params, level, debug, debugInfo) {
					message = Core.Output.exec(message, params);
					return (debug ? level + ": " + debugInfo + " " : "") + message;
				},
				exception: function(message, params, level) {
					message = params[0].description;
					return "exception: " + message;
				},
				stack: function(message, params, level, debug, debugInfo) {
					message = Core.Output.exec(message, params);
					return "      " + message + " @ " + debugInfo;
				}
			},
			level: {
				__el: "exception",
				__sl: "stack"
			}
		}
	},

	_logs: {},
	
	/**
	 * Initializes namespace
	 */
	initialize: function() {

		for (var level in this.params.level) {
			var mask = this.params.level[level];
			var outputFormat = this.params.output.format[this.params.output.level[level] || "_default"];
			this.registerLog(level, mask, outputFormat);
		}
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

		var fn = propertyName ? context[propertyName] : null;
		var debugInfo;
		if (fn) {
			var qualifiedName = fn.qualifiedName;
			var contextName = fn._static === false ? context._class.qualifiedName : context.qualifiedName;
			var sourceFn = contextName + "." + propertyName;
			var source = sourceFn + (sourceFn == qualifiedName ? "" : " (" + qualifiedName.replace(/\.[^\.]+$/, "") + ")");
			debugInfo = "" + (fn._static === false ? "" : "[static] ") + source;
		}
		else {
			debugInfo = propertyName ? (propertyName.indexOf("[global]") == -1 ? "[private] " : "") + propertyName : "[anonymous]";
		}
//		if (!this._macth(level, qualifiedName))
//			return;

		for (var ti = 0; ti < level.targets.length; ti++) {
			var target = level.targets[ti];
			message = level.outputFormat(message, params, level.name, target.isDebug(), debugInfo);
			target.write(message);
		}
	},
	
	/**
	 * Registers log on specified logging level and mask
	 * 
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
	},
	
	/**
	 * Registers specified target for logs
	 * 
	 * @param {String} level
	 * @param {Core.Target.AbstractTarget} target
	 */
	registerTarget: function(level, target) {
		if (typeof(level) == "string")
			level = this._logs[level];
		level.targets.push(target);
	}
};

_log = function() {
	return Core.Log._log.apply(Core.Log, arguments);
};