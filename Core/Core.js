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
Core = {
		
	/**
	 * Tests if specified property is a method 
	 * 
	 * @param {Object} property
	 * @param {String} propertyName
	 * @type {Boolean}
	 */
	isMethod: function(property, propertyName) {
		return typeof property == "function" && propertyName != "_class" && !/^[A-Z]/.test(propertyName.replace(/^_+/, "")) && !this.isNative(property);
		//return typeof property == "function";
	},
	
	_fnPattern: new RegExp("^\\s*function\\s*([\\w$]*)\\s*\\(([\\w$,\\s]*)\\)\\s*\\{\\s*([\\w\\W]*)\\s*\\}\\s*$"),
	_nativePattern: new RegExp("\\[native\\s*code\\]", "i"),
	
	/**
	 * Returns parsed arguments of function   
	 * 
	 * @param {Function} fn
	 * @type {Object}
	 */
	parse: function(fn) {
		var parsed = {
			arguments: [],
			joinedArguments: ""
		};
		fn = typeof(fn) == "string" ? fn : fn.toString();
		var pt = this._fnPattern.exec(fn);
		if (pt) {
			parsed.name = pt[1];
			parsed.joinedArguments = pt[2];
			parsed.arguments = pt[2].split(",");
			parsed.body = pt[3];
		}
		return parsed;
	},
	
	/**
	 * Tests if specified function is native 
	 * 
	 * @param {Function} fn
	 * @type {Boolean}
	 */
	isNative: function(fn) {
		return this._nativePattern.test(this.parse(fn).body);
	},
	
	_callbacksMethod: [],

	/**
	 * Registers method enrichment callback function.
	 * Enrichment is source code instrumentation where callback function is provided with meta information about method:
	 *  - {String} source Source of method
	 *  - {String} methodName name of method in namespace 
	 * 
	 * @param {Function} callback function(source, methodName)
	 */
	registerMethodEnrichment: function(callback) {
		this._callbacksMethod.push(callback);
	},

	/**
	 * Enriches method with registered method enrichments.
	 * Method is passed to all registered callback functions in order to enrich their source.
	 * Enrichments is performed before method is assigned to namespace.
	 * 
	 * @see Core.registerMethodEnrichment
	 * @param {Object} namespace
	 * @param {String} methodName
	 * @param {String} qualifiedName
	 * @param {Boolean} _static
	 */
	enrichMethod: function(namespace, methodName, qualifiedName, _static) {
		var method = namespace[methodName];
		if (!method._enriched) {
			namespace[methodName].qualifiedName = qualifiedName;
			namespace[methodName]._static = _static;
			namespace[methodName]._enriched = true;
		}
	},
	
	/**
	 * Enriches all methods in namespace (utility) with registered method enrichments.
	 * 
	 * @see Core.enrichMethod
	 * @param {Object} namespace
	 */
	enrichNamespace: function(namespace) {
		for (var propertyName in namespace) {
			if (this.isMethod(namespace[propertyName], propertyName))
				this.enrichMethod(namespace, propertyName, namespace.qualifiedName + "." + propertyName, true);
		};
	},
	
	/**
	 * Merges properties of specified object to (target) toObject.
	 * 
	 * @param {Object} toObject
	 * @param {Object} object
	 */
	merge: function(toObject, object) {
		for (var name in object) {
			if (name in toObject)
				throw new Error("Merge target object " + toObject + " already has property: '" + name + "'");
			toObject[name] = object[name];
		}
	}
};

include("Core.Utils@Core");
include("Core.Log@Core");
include("Core.Output@Core");
include("Core.Lang@Core");
include("Core.Types@Core");
include("Core.Target@Core");
