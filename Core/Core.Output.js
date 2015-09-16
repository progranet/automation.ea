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
Core.Output = {
	
	/**
	 * Returns string represented by scriptlet replaced with values evaluated from specified params
	 * 
	 * @param {String} scriptlet Template scriptlet 
	 * @param {Object} params Array or map of objects to be evaluated
	 * @param {Object} scriptlets map of scriptlets to include
	 * @type {String}
	 */
	exec: function(scriptlet, params, scriptlets) {
		
		var evalParam = function(string, inContext, outContext, sign) {
			if (!string)
				return null;
			var ep = string.indexOf(sign || "=");
			if (ep == -1)
				throw new Error("Illegal parameter substitution: " + string);
			var name = string.substr(0, ep).trim();
			var expression = string.substr(ep + 1).trim();
			eval("var fn = function(" + Core.Utils.getNames(inContext).join(", ") + ") {return " + expression + ";}");
			var value = fn.apply(inContext.$this, Core.Utils.getValues(inContext));
			outContext[name] = value;
			return name;
		};		
		
		scriptlet = scriptlet + "";
		params = params || {};
		if (params instanceof Array) {
			var p = 0;
			return scriptlet.replace(/\$/g, function() {
				return p < params.length ? Core.Output.getString(params[p++]) : "<<undefined parameter>>";
			});
		}
		else if (typeof(params) == "object") {
			return scriptlet.replace(/<%([\!\^\*]?)\s*([^%]+)\s*%>/g, function(whole, dir, body) {
				if (dir == "!") {
					evalParam(body, params, params);
					return "";
				}
				else if (dir == "^") {
					return body.replace(/^\s*([^\(]+)\((.*)\)\s*$/g, function(whole, name, paramValues) {
						var scriptlet = scriptlets[name.trim()];
						if (!scriptlet)
							throw new Error("Undefined scriptlet, name: " + name);
						var includeContext = {};
						paramValues = paramValues.split(",");
						for (var p = 0; p < paramValues.length; p++) {
							evalParam(paramValues[p], params, includeContext);
						}
						if (typeof(scriptlet.generate == "function"))
							return scriptlet.generate(includeContext);
						return Core.Output.exec(scriptlet, includeContext, scriptlets);
					});
				}
				else if (dir == "*") {
					return body.replace(/^\s*([^\(]+)\((.*)\)\s*$/g, function(whole, name, paramValues) {
						var scriptlet = scriptlets[name.trim()];
						if (!scriptlet)
							throw new Error("Undefined scriptlet, name: " + name);
						var includeContext = {};
						paramValues = paramValues.split(",");
						if (paramValues.length < 1)
							throw new Error("Collection undefined for scriptlet name: " + name);
						for (var p = 1; p < paramValues.length; p++) {
							evalParam(paramValues[p], params, includeContext);
						}
						var collection = {};
						var elementParamName = evalParam(paramValues[0], params, collection, "@");
						collection = collection[elementParamName];
						var result = [];
						collection.forEach(null, function(element) {
							includeContext[elementParamName] = element;
							var elementResult;
							if (typeof(scriptlet.generate == "function"))
								elementResult = scriptlet.generate(includeContext);
							else
								elementResult = Core.Output.exec(scriptlet, includeContext, scriptlets);
							result.push(elementResult);
						});
						return result.join("");
					});
				}
				eval("var fn = function(" + Core.Utils.getNames(params).join(", ") + ") {return " + body + ";}");
				return fn.apply(params.$this, Core.Utils.getValues(params));
			});
		}
		else {
			throw new Error("Unexpected params for output: " + scriptlet + " (typeof params: " + typeof(params) + ")");
		}
	},
	
	/**
	 * Returns string representing evaluated context in form depending on its type
	 * 
	 * @param {Object} context
	 * @type {String}
	 */
	getString: function(context) {

		if (context == null) {
			if (context === undefined) {
				return "<<undefined>>";
			}
			return "<<null>>";
		}
		
		var type = typeof(context);
		
		if (type == "object") {
			if (context instanceof Array) {
				var result = "[";
				for (var e = 0; e < context.length; e++) {
					if (e != 0) result = result + ", ";
					result = result + Core.Output.getString(context[e]);
				}
				return result + "]";
			}
			if (Core.Types.Object.isInstance(context)) {
				return context.toString();
			}
			var result = "{";
			var pi = 0;
			for (var p in context) {
				if (pi++ != 0) result = result + ", ";
				var value = Core.Output.getString(context[p]);
				result = result + p + ": " + value;
				//result = result + p + ": " + context[p];
			}
			return result + "}";
		}

		if (type == "string") {
			return context.replace(/%/g, "\\%");
		}
		
		if (type == "function") {
			if (Core.Lang.isClass(context)) {
				return context;
			}
			var parsed = Core.parse(context);
			if (parsed.name) {
				return parsed.name;
			}
			return "<<function>>";
		}
		
		return context + "";
	}
};
