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
	 * @enum {number}
	 */
	Type: {
		INFO: 0,
		DEBUG: 1,
		TREE: 2,
		BLIND: 3
	}
};

Core.Target.AbstractTarget = define({
	
	_type: null,
	
	/**
	 * Core.Target.AbstractTarget constructor
	 * 
	 * @param {Number} type Specifies type of target as one of {@link Core.Target.Type}
	 */
	create: function(type) {
		_super.create();
		this._type = type;
	},
	
	/**
	 * Writes specified message to this target
	 * 
	 * @param {String} message
	 */
	write: function(message) {
		
	},
	
	/**
	 * Determines if this target type is debug
	 * 
	 * @see Core.Target.Type
	 * @type {Boolean}
	 */
	isDebug: function() {
		return this._type == Core.Target.Type.DEBUG;
	}
});
