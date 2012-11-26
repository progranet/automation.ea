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
Sys.IO = {

	/**
	 * @memberOf Sys.IO
	 * @enum {Number}
	 */
	Mode: {
		READ: 	1,	//ForReading,
		WRITE: 	2,	//ForWriting,
		APPEND:	8	//ForAppending
	},

	/**
	 * @memberOf Sys.IO
	 * @enum {Number}
	 */
	Unicode: {
		DEFAULT:	-2,	//TristateUseDefault,
		UNICODE:	-1,	//TristateTrue,
		ASCII:		0	//TristateFalse
	},
	
	
	_fileSystem: new ActiveXObject("Scripting.FileSystemObject"),
	
	_files: [],
	
	/**
	 * Finalizes namespace - closes used files
	 * 
	 * @memberOf Sys.IO
	 */
	finalize: function() {
		debug("closing used files");
		for (var f = 0; f < this._files.length; f++) {
			this._files[f].close();
		}
	},
	
	/**
	 * Makes copy of specified file in script space to specified folder 
	 * 
	 * @see Sys.IO.getPath
	 * @memberOf Sys.IO
	 * @param {String} filePath
	 * @param {String} folderPath
	 * @param {?Object} context Namespace containing file
	 */
	copy: function(file, folderPath, context) {
		Sys.IO._fileSystem.CopyFile(this.getPath(file, context), folderPath);
	},
	
	/**
	 * Creates folder on specified path
	 * 
	 * @memberOf Sys.IO
	 * @param {String} path
	 */
	createFolder: function(path) {
		if (!Sys.IO._fileSystem.FolderExists(path)) {
			Sys.IO._fileSystem.CreateFolder(path);
		}
	},
	
	/**
	 * Returns absolute path to the file in script space
	 * 
	 * @memberOf Sys.IO
	 * @param {String} file
	 * @param {?Object} namespace Namespace containing file 
	 * @returns {String}
	 */
	getPath: function(file, namespace) {
		if (namespace) {
			file = namespace._loader.package + file;
		}
		if (file.indexOf(":") == -1) {
			file = scriptRoot + file;
		}
		return file;
	},
	
	/**
	 * Returns creation date for specified file
	 * 
	 * @memberOf Sys.IO
	 * @param {String} filePath
	 * @returns {Date}
	 */
	getCreated: function(filePath) {
		if (!Sys.IO._fileSystem.FileExists(filePath)) return null;
		return new Date(Sys.IO._fileSystem.GetFile(filePath).DateCreated);
	}
};
	
Sys.IO.File = define(/** @lends Sys.IO.File# */ {

	_file: null,
	_path: null,
	_closed: false,
	
	/**
	 * Creates new file wrapper. According to parameters file will be opened (read mode) or created (write modes)
	 * 
	 * @constructs
	 * @param {String} file
	 * @param {?Sys.IO.Mode} mode File wrapper creation mode (default Sys.IO.Mode.WRITE)
	 * @param {?Sys.IO.Unicode} unicode File unicode mode (default Sys.IO.Unicode.ASCII)
	 * @param {?Object} namespace Namespace containing file
	 */
	create: function(file, mode, unicode, namespace) {
		mode = mode || Sys.IO.Mode.WRITE;
		unicode = unicode || Sys.IO.Unicode.ASCII;
		file = Sys.IO.getPath(file, namespace);
		if (mode == Sys.IO.Mode.WRITE) {
			this._file = Sys.IO._fileSystem.CreateTextFile(file, true, unicode);
		}
		else if (mode = Sys.IO.Mode.READ) {
			this._file = Sys.IO._fileSystem.OpenTextFile(file, mode, false, Sys.IO.Unicode.DEFAULT);
		}
		Sys.IO._files.push(this);
	},
	
	/**
	 * Writes text to file.
	 * 
	 * @memberOf Sys.IO.File#
	 * @param {String} text
	 */
	write: function(text) {
		this._file.Write(text);
	},
	
	/**
	 * Writes line to file.
	 * 
	 * @memberOf Sys.IO.File#
	 * @param {String} text
	 */
	writeLine: function(text) {
		this._file.WriteLine(text);
	},
	
	/**
	 * Reads line from file.
	 * 
	 * @memberOf Sys.IO.File#
	 * @returns {String}
	 */
	readLine: function() {
		return this._file.ReadLine();
	},
	
	/**
	 * Checks if file is at the end
	 * 
	 * @memberOf Sys.IO.File#
	 * @returns {Boolean}
	 */
	atEnd: function() {
		return this._file.AtEndOfStream;
	},
	
	/**
	 * Closes file.
	 * 
	 * @memberOf Sys.IO.File#
	 */
	close: function() {
		if (this._closed) {
			debug("file already closed: " + this._path);
			return;
		}
		this._file.Close();
		this._closed = true;
	}
});

Sys.IO.FileTarget = extend(Core.Target.AbstractTarget, /** @lends Sys.IO.FileTarget# */ {
	
	_path: null,
	_file: null,
	
	/**
	 * Creates new file target
	 * 
	 * @constructs
	 * @extends Core.Target.AbstractTarget
	 * @param {String} path Target file path
	 * @param {Number} type Specifies type of target as one of {@link Core.Target.Type}
	 */
	create: function(path, type) {
		_super.create(type);
		this._path = path;
		this._file = new Sys.IO.File(this._path, Sys.IO.Mode.WRITE);
	},
	
	/**
	 * Writes message to target file
	 * 
	 * @memberOf Sys.IO.FileTarget#
	 * @param {String} message
	 */
	write: function(message) {
		this._file.writeLine(message);
	},
	
	/**
	 * Closes target file
	 * 
	 * @memberOf Sys.IO.FileTarget#
	 */
	close: function() {
		this._file.close();
	}
});
