/*
   Copyright 2013 300 D&C

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

include("Sys.IO@Sys");

/**
 * @namespace
 */
Sys.Utils = {};

Sys.Utils.FileTarget = extend(Core.Target.AbstractTarget, {
	
	_path: null,
	_file: null,
	
	/**
	 * Creates new file target
	 * 
	 * @param {String} path Target file path
	 * @param {Number} type Specifies type of target as one of {@link Core.Target.Type}
	 */
	create: function(path, type) {
		_super.create(type);
		this._path = path;
		this._file = new Sys.IO.File(this._path, Sys.IO.Mode.WRITE);
	},
	
	/**
	 * Writes specified message to target file
	 * 
	 * @param {String} message
	 */
	write: function(message) {
		this._file.writeLine(message);
	},
	
	/**
	 * Closes target file
	 */
	close: function() {
		this._file.close();
	}
});
