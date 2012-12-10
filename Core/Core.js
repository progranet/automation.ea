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
	 * @memberOf Core
	 * @param {Object} property
	 * @param {String} propertyName
	 * @returns {Boolean}
	 * @static
	 */
	isFunction: function(property, propertyName) {
		return typeof property == "function" && !/^_*[A-Z]/.test(propertyName) && !this.isNative(property);
	},
	
	_fnPattern: new RegExp("^\\s*function\\s*([\\w$]*)\\s*\\(([\\w$,\\s]*)\\)\\s*\\{\\s*([\\w\\W]*)\\s*\\}\\s*$"),
	_nativePattern: new RegExp("\\[native\\s*code\\]", "i"),
	
	/**
	 * Returns parsed arguments of function   
	 * 
	 * @memberOf Core
	 * @param {Function} fn
	 * @returns {Object}
	 * @static
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
	 * @memberOf Core
	 * @param {Function} fn
	 * @returns {Boolean}
	 * @static
	 */
	isNative: function(fn) {
		return this._nativePattern.test(this.parse(fn).body);
	},
	
	_callbacksMethod: [],

	/**
	 * Registers method enrichment. All methods are passed to the registered callback function in order to enrich their source. 
	 * 
	 * @memberOf Core
	 * @param {Function} callback function(source, namespace, propertyName, qualifiedName, _static)
	 * @static
	 */
	registerMethodEnrichment: function(callback) {
		this._callbacksMethod.push(callback);
	},

	/**
	 * Enriches method with registered method enrichments.
	 * 
	 * @see Core.registerMethodEnrichment
	 * @memberOf Core
	 * @param {Object} namespace
	 * @param {String} propertyName
	 * @param {String} qualifiedName
	 * @param {Boolean} _static
	 * @static
	 */
	enrichMethod: function(namespace, propertyName, qualifiedName, _static) {
		var property = namespace[propertyName];
		if (!this.isFunction(namespace[propertyName], propertyName))
			return;
		var source = property.toString();
		for (var ci = 0; ci < this._callbacksMethod.length; ci++) {
			var callback = this._callbacksMethod[ci];
			source = callback(source, namespace, propertyName, qualifiedName, _static);
		}
		eval("namespace[propertyName] = " + source);
		namespace[propertyName].qualifiedName = qualifiedName;
		namespace[propertyName]._static = _static;
	},
	
	/**
	 * Enriches all methods in namespace with registered method enrichments. 
	 * 
	 * @see Core.enrichMethod
	 * @memberOf Core
	 * @param {Object} namespace
	 * @static
	 */
	enrichNamespace: function(namespace) {
		for (var propertyName in namespace) {
			this.enrichMethod(namespace, propertyName, namespace.qualifiedName + "." + propertyName, true);
		};
	},
	
	_callbackSource: [],
	
	/**
	 * Registers source enrichment. Source code of each being included library is passed to the registered callback function in order to enrich them. 
	 * 
	 * @memberOf Core
	 * @param {Function} callback function(qualifiedName, source)
	 * @static
	 */
	registerSourceEnrichment: function(callback) {
		this._callbackSource.push(callback);
	},

	/**
	 * Enriches source code of library with registered source enrichments.
	 * 
	 * @see Core.registerSourceEnrichment
	 * @memberOf Core
	 * @param {String} qualifiedName
	 * @param {String} source
	 * @static
	 */
	enrichSource: function(qualifiedName, source) {
		for (var ci = 0; ci < this._callbackSource.length; ci++) {
			var callback = this._callbackSource[ci];
			source = callback(qualifiedName, source);
		}
		return source;
	},
	
	/**
	 * Merges properties of specified object to (target) toObject.
	 * 
	 * @memberOf Core
	 * @param {Object} toObject
	 * @param {Object} object
	 * @static
	 */
	merge: function(toObject, object) {
		for (var name in object) {
			if (name in toObject)
				throw new Error("Merge target object " + toObject + " already has property: " + name);
			toObject[name] = object[name];
		}
	}
};
