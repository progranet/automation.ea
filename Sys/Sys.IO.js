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

var ForReading = 1, ForWriting = 2, ForAppending = 8;
var TristateUseDefault = -2, TristateTrue = -1, TristateFalse = 0;

Sys.IO = {
	mode: {
		read: ForReading,
		write: ForWriting,
		append: ForAppending
	},
	unicode: {
		_default: TristateUseDefault,
		unicode: TristateTrue,
		ascii: TristateFalse
	},
	fileSystem: new ActiveXObject("Scripting.FileSystemObject"),
	_files: [],
	finalize: function() {
		debug("closing used files");
		for (var f = 0; f < this._files.length; f++) {
			this._files[f].close();
		}
	},
	copy: function(file, path, context) {
		Sys.IO.fileSystem.CopyFile(this._getPath(file, context), path);
	},
	createFolder: function(path) {
		if (!Sys.IO.fileSystem.FolderExists(path)) {
			Sys.IO.fileSystem.CreateFolder(path);
		}
	},
	_getPath: function(file, library) {
		if (library) {
			file = library._loader.package + file;
		}
		if (file.indexOf(":") == -1) {
			file = scriptRoot + file;
		}
		return file;
	},
	getCreated: function(file) {
		if (!Sys.IO.fileSystem.FileExists(file)) return null;
		return new Date(Sys.IO.fileSystem.GetFile(file).DateCreated);
	}
};
	
Sys.IO.File = define({

	_file: null,
	path: null,
	closed: false,
	
	create: function(path, mode, unicode, library) {
		mode = mode || Sys.IO.mode.write;
		unicode = unicode || Sys.IO.unicode.ascii;
		path = Sys.IO._getPath(path, library);
		if (mode == Sys.IO.mode.write) {
			this._file = Sys.IO.fileSystem.CreateTextFile(path, true, unicode);
		}
		else if (mode = Sys.IO.mode.read) {
			this._file = Sys.IO.fileSystem.OpenTextFile(path, mode, false, Sys.IO.unicode._default);
		}
		Sys.IO._files.push(this);
	},
	
	write: function(text) {
		this._file.Write(text);
	},
	
	writeLine: function(text) {
		this._file.WriteLine(text);
	},
	
	readLine: function() {
		return this._file.ReadLine();
	},
	
	atEnd: function() {
		return this._file.AtEndOfStream;
	},
	
	close: function() {
		if (this.closed) {
			debug("file already closed: " + this.path);
			return;
		}
		this._file.Close();
		this.closed = true;
	}
});

Sys.IO.FileTarget = extend(Core.Target.AbstractTarget, {
	
	_path: null,
	_file: null,
	
	create: function(path, debug) {
		_super.create(debug);
		this._path = path;
		this._file = new Sys.IO.File(this._path, Sys.IO.mode.write);
	},
	
	write: function(message) {
		this._file.writeLine(message);
	},
	
	close: function() {
		this._file.close();
	}
});

