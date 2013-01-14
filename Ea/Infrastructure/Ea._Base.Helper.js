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
Ea._Base.Helper = {
		
	params: {
	
	},
	
	/**
	 * @memberOf Ea._Base.Helper
	 * @param type
	 * @type {Boolean}
	 */
	isCollectionType: function(type) {
		return Core.Lang.isClass(type) && (type == Core.Types.Collection || type.isSubclassOf(Core.Types.Collection));
	},
	
	typeEval: function(type) {
		var _type = type;
		if (typeof type == "string")
			type = eval(type);
		if (!type)
			throw new Error("Undefined type" + (_type ? " [" + _type + "]" : ""));
		return type;
	}	
	
};

Ea._Base.Helper.Target = extend(Core.Target.AbstractTarget, /** @lends Ea._Base.Helper.Target# */ {
	
	_name: null,
	_repository: null,
	
	create: function(debug, params) {
		_super.create(debug);
		params = params || {};
		this._name = params.name;
		this._repository = params.repository;
		this._repository.showOutput(this._name);
		this._repository.clearOutput(this._name);
	},
	
	/**
	 * @memberOf Ea._Base.Helper.Target#
	 */
	write: function(message) {
		if (this._type == Core.Target.Type.TREE)
			message = message.replace(/\|/g, "      |").replace(/\-/g, "—").replace(/\+/g, "[•]");
		this._repository.writeOutput(this._name, message);
	}
});

Ea._Base.Helper.Log = define(/** @lends Ea._Base.Helper.Log# */{
	
	_path: null,
	
	create: function(element) {
		_super.create();
		this._path = [];
		var parent = element.getParent();
		if (parent) {
			var parentPath = Ea._Base.Helper.Log.getLog(parent).getPath();
			for (var p = 0; p < parentPath.length; p++) {
				this._path.push(parentPath[p]);
			}
		}
		this._path.push(element);
	},
	
	/**
	 * @memberOf Ea._Base.Helper.Log#
	 */
	getPath: function() {
		return this._path;
	},
	
	log: function() {
		
		var path = this.getPath();
		var _tab = function(count, string) {
			var gen = "";
			for (var i = 0; i < count; i++)
				gen = gen + string;
			return gen;
		};

		if (path.length > 0) {
			for (var p = 0; p < path.length; p++) {
				if (!Ea._Base.Helper.Log._current || p >= Ea._Base.Helper.Log._current.length || Ea._Base.Helper.Log._current[p] != path[p]) {
					var element = path[p];
					var string = (element.instanceOf(Ea.Package._Base) ? "+" : "") + " " + element;
					_treeLogger(_tab(p, "|") + "-" + string);
				}
			}
			Ea._Base.Helper.Log._current = path;
		}
	}
},
{
	_current: null,
	
	_logs: {},

	getLog: function(element) {
		if (!Ea._Base.Helper.Log._logs[element.getGuid()])
			Ea._Base.Helper.Log._logs[element.getGuid()] = new Ea._Base.Helper.Log(element);
		return Ea._Base.Helper.Log._logs[element.getGuid()];
	}
});
