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
 * Trims leading or trailing whitespace from this string
 * 
 * @type {String}
 */
String.prototype.trim = function() {
    return this.replace(/^\s+/g, "").replace(/\s+$/g, "");
};

/**
 * @namespace
 */
Core.Utils = {
	
	/**
	 * Returns array of names from map
	 * 
	 * @param {Object} map
	 * @type {Array}
	 */
	getNames: function(map) {
		var names = [];
		for (name in map) {
			names.push(name);
		}
		return names;
	},
	
	/**
	 * Returns array of values from map
	 * 
	 * @param {Object} map
	 * @type {Array}
	 */
	getValues: function(map) {
		var values = [];
		for (name in map) {
			values.push(map[name]);
		}
		return values;
	}
};
