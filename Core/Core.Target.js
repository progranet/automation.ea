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
Core.Target = {
		
	/**
	 * Enumeration of target types
	 * 
	 * @memberOf Core.Target
	 * @enum {number}
	 */
	Type: {
		INFO: 0,
		DEBUG: 1,
		TREE: 2
	}
};

Core.Target.AbstractTarget = define(/** @lends Core.Target.AbstractTarget# */{
	
	_type: null,
	
	/**
	 * Core.Target.AbstractTarget constructor
	 * 
	 * @constructs
	 * @extends Core.Types.Object
	 * @param {Number} type Specifies type of target as one of {@link Core.Target.Type}
	 */
	create: function(type) {
		_super.create();
		this._type = type;
	},
	
	/**
	 * Writes message to target
	 * 
	 * @memberOf Core.Target.AbstractTarget#
	 * @param {String} message
	 */
	write: function(message) {
		
	},
	
	/**
	 * Determines if target is debug
	 * 
	 * @see Core.Target.Type
	 * @memberOf Core.Target.AbstractTarget#
	 * @returns {Boolean}
	 */
	isDebug: function() {
		return this._type == Core.Target.Type.DEBUG;
	}
});
