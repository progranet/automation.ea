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
	 * @enum {Number}
	 */
	Mode: {
		READ: 	1,	//ForReading,
		WRITE: 	2,	//ForWriting,
		APPEND:	8	//ForAppending
	},

	/**
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
	 */
	finalize: function() {
		debug("closing used files");
		for (var f = 0; f < this._files.length; f++) {
			this._files[f].close();
		}
	},
	
	/**
	 * @deprecated Use Sys.IO.copyFile instead
	 * @param {String} filePath
	 * @param {String} folderPath
	 * @param {Object} namespace Namespace containing file
	 */
	copy: function(filePath, folderPath, namespace) {
		this.copyFile(filePath, folderPath, namespace);
	},

	/**
	 * Makes a copy of specified file in script space to specified folder 
	 * 
	 * @see Sys.IO.getPath
	 * @param {String} filePath
	 * @param {String} folderPath
	 * @param {Object} namespace Namespace containing file
	 */
	copyFile: function(filePath, folderPath, namespace) {
		Sys.IO._fileSystem.CopyFile(this.getPath(filePath, namespace), folderPath);
	},
	
	/**
	 * Creates a folder on specified path
	 * 
	 * @param {String} path
	 */
	createFolder: function(path) {
		if (!Sys.IO._fileSystem.FolderExists(path)) {
			Sys.IO._fileSystem.CreateFolder(path);
		}
	},
	
	/**
	 * Returns absolute path to the file in namespace
	 * 
	 * @param {String} file
	 * @param {Object} namespace Namespace containing file 
	 * @type {String}
	 */
	getPath: function(file, namespace) {
		return namespace ? namespace._loader.path + file : file;
	},
	
	/**
	 * Checks if specified file exists in file system
	 * 
	 * @param {String} filePath
	 * @type {Boolean}
	 */
	fileExists: function(filePath) {
		return Sys.IO._fileSystem.FileExists(filePath);
	},
	
	getFolder: function(path) {
		return new Sys.IO.Folder(Sys.IO._fileSystem.GetFolder(path));
	}
};

Sys.IO._Element = define({
	
	_element: null,
	_path: null,
	
	/**
	 * Returns complete path to this file system element
	 * 
	 * @type {String}
	 */
	getPath: function() {
		return this._path;
	},
	
	/**
	 * Returns name of this file system element
	 * 
	 * @type {String}
	 */
	getName: function() {
		return this._element.Name;
	},
	
	/**
	 * Returns size of this file system element
	 * 
	 * @type {Number}
	 */
	getSize: function() {
		return this._element.Size;
	},
	
	/**
	 * Returns parent (folder) of this file system element
	 * 
	 * @type {Sys.IO.Folder}
	 */
	getParent: function() {
		return new Sys.IO.Folder(this._element.ParentFolder);
	},
	
	/**
	 * Returns creation date for this file system element
	 * 
	 * @type {Date}
	 */
	getCreated: function() {
		return new Date(this._element.DateCreated);
	},

	/**
	 * Returns last modification date for this file system element
	 * 
	 * @type {Date}
	 */
	getModified: function() {
		return new Date(this._element.DateLastModified);
	},
	
	/**
	 * Returns date when this file system element was last accessed
	 * 
	 * @type {Date}
	 */
	getAccessed: function() {
		return new Date(this._element.DateLastAccessed);
	}
});
	
Sys.IO.File = extend(Sys.IO._Element, {

	_stream: null,
	_state: null,
	
	/**
	 * Constructs a file wrapper in file system.
	 * If there is mode specified file will be opened or created.
	 * 
	 * @param {any} file File path or Windows file system File object
	 * @param {Sys.IO.Mode} mode File wrapper creation mode
	 * @param {Sys.IO.Unicode} unicode File unicode mode (default Sys.IO.Unicode.ASCII)
	 * @param {Object} namespace Namespace containing file
	 */
	create: function(file, mode, unicode, namespace) {
		
		_super.create();
		
		if (typeof file == "string") {
			this._path = Sys.IO.getPath(file, namespace);
			if (mode != Sys.IO.Mode.WRITE) {
				this._element = Sys.IO._fileSystem.GetFile(this._path);
			}
		}
		else {
			this._element = file;
			this._path = file.Path;
		}
		this._state = Sys.IO.File.State.NONE;
		if (mode)
			this.open(mode, unicode);
	},
	
	/**
	 * Opens file or creates it according to specified parameters
	 * 
	 * @param {Sys.IO.Mode} mode File wrapper creation mode
	 * @param {Sys.IO.Unicode} unicode File unicode mode (default Sys.IO.Unicode.ASCII)
	 */
	open: function(mode, unicode) {
		
		if (this._state != Sys.IO.File.State.NONE)
			throw new Error("File cannot by opened: " + this._path);
		
		if (mode == Sys.IO.Mode.WRITE) {
			this._stream = Sys.IO._fileSystem.CreateTextFile(this._path, true, unicode || Sys.IO.Unicode.ASCII);
		}
		else {
			this._stream = this._element.OpenAsTextStream(mode, Sys.IO.Unicode.DEFAULT);
		}
		this._state = Sys.IO.File.State.OPEN;
		Sys.IO._files.push(this);
	},
	
	/**
	 * Writes specified text to this file stream.
	 * 
	 * @param {String} text
	 */
	write: function(text) {
		this._stream.Write(text);
	},
	
	/**
	 * Writes line to this file stream.
	 * 
	 * @param {String} text
	 */
	writeLine: function(text) {
		this._stream.WriteLine(text);
	},
	
	/**
	 * Reads line from this file stream.
	 * 
	 * @type {String}
	 */
	readLine: function() {
		return this._stream.ReadLine();
	},
	
	/**
	 * Reads entire file.
	 * 
	 * @type {String}
	 */
	readAll: function() {
		return this._stream.ReadAll();
	},
	
	/**
	 * Checks if this file stream is at the end
	 * 
	 * @type {Boolean}
	 */
	atEnd: function() {
		return this._stream.AtEndOfStream;
	},
	
	/**
	 * Closes this file.
	 * 
	 */
	close: function() {
		if (this._state != Sys.IO.File.State.OPEN) {
			debug("file is not open: " + this._path);
			return;
		}
		this._stream.Close();
		this._state = Sys.IO.File.State.CLOSED;
	}
	
},
{
	State: {
		NONE: 0,
		OPEN: 1,
		CLOSED: 2
	}
});

Sys.IO.Folder = extend(Sys.IO._Element, {
	
	/**
	 * Constructs Sys.IO.Folder
	 * 
	 * @param {any} folder Path to folder or Windows file system Folder object
	 * @param {Object} namespace
	 */
	create: function(folder, namespace) {
		
		_super.create();
		
		if (typeof folder == "string") {
			this._path = Sys.IO.getPath(folder, namespace);
			this._element = Sys.IO._fileSystem.GetFolder(this._path);
		}
		else {
			this._element = folder;
			this._path = folder.Path;
		}
	},
	
	/**
	 * Returns collection of this folder subfolders
	 * 
	 * @type {Core.Types.Collection<Sys.IO.Folder>}
	 */
	getFolders: function() {
		var foldersCollection = new Enumerator(this._element.SubFolders);
		var folders = new Core.Types.Collection();
		for (foldersCollection.moveFirst(); !foldersCollection.atEnd(); foldersCollection.moveNext()) {
			var folder = new Sys.IO.Folder(foldersCollection.item());
			folders.add(folder);
			
		}
		return folders;
	},
	
	/**
	 * Returns collection of this folder files
	 * 
	 * @type {Core.Types.Collection<Sys.IO.File>}
	 */
	getFiles: function() {
		var filesCollection = new Enumerator(this._element.Files);
		var files = new Core.Types.Collection();
		for (filesCollection.moveFirst(); !filesCollection.atEnd(); filesCollection.moveNext()) {
			var file = new Sys.IO.File(filesCollection.item());
			files.add(file);
		}
		return files;
	}
});
