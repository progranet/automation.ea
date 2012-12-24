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
 * Checks if array this contains specified element 
 * 
 * @memberOf Array#
 * @param {Object} element
 * @returns {Boolean}
 */
Array.prototype.contains = function(element) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === element) return true;
	}
	return false;
};

/**
 * Left pads this string with specified string while length of this string is less than specified 
 * 
 * @memberOf String#
 * @param {String} pad
 * @param {Number} length
 * @returns {String}
 */
String.prototype.lpad = function(pad, length) {
	var context = this;
    while (context.length < length)
        context = pad + context;
    return context;
};
