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

Core.Output = {
	
	exec: function(scriptlet, params) {
		scriptlet = scriptlet + "";
		params = params || {};
		if (params instanceof Array) {
			var p = 0;
			return scriptlet.replace(/\$/g, function() {
				return p < params.length ? Core.Output.getString(params[p++]) : "<<undefined parameter>>";
			});
		}
		else if (typeof(params) == "object") {
			return scriptlet.replace(/<%\s*([^%]+)\s*%>/g, function(whole, body) {
				eval("var fn = function(" + Core.Helper.getNames(params).join(", ") + ") {return " + body + ";}");
				return fn.apply(params.$this, Core.Helper.getValues(params));
			});
		}
		else {
			throw new Error("Unexpected params for output: " + scriptlet + " (typeof params: " + typeof(params) + ")");
		}
	},
	
	getString: function(context, isArray) {

		if (context == null) {
			if (context === undefined) {
				return "<<undefined>>";
			}
			return "<<null>>";
		}
		
		var type = typeof(context);
		
		if (type == "object") {
			if (isArray || (context instanceof Array)) {
				var result = "[";
				for (var e = 0; e < context.length; e++) {
					if (e > 0) result = result + ", ";
					result = result + Core.Output.getString(context[e]);
				}
				return result + "]";
			}
			if (Core.Types.Object.isInstance(context)) {
				return context;
			}
			var result = "{";
			var pi = 0;
			for (var p in context) {
				if (pi++ > 0) result = result + ", ";
				var value;
					value = Core.Output.getString(context[p]);
				result = result + p + ": " + value;
				//result = result + p + ": " + context[p];
			}
			return result + "}";
		}

		if (type == "string") {
			return context.replace(/%/g, "\\%");
		}
		
		if (type == "function") {
			if (context.isClass) {
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
