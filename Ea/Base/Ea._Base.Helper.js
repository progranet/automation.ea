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
		indent: "      "
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
	},
	
	inspect: function(object) {
		this._inspect(object, 0, "$ = {", []);
	},
	
	_ids: {},
	
	_indent: function(number) {
		var indent = "";
		for (var i = 0; i < number; i++) {
			indent = indent + this.params.indent;
		}
		return indent;
	},

	_expand: function(template, params, value, indent, aggregation) {
		if (Ea.Types.Any.isInstance(value)) {
			if (aggregation == "composite" || aggregation == "shared") {
				this._inspect(value, indent + 1, template + " = {", params);
				return;
			}
			template = template + " = {...}";
		}
		params.push(value);
		info(this._indent(indent + 1) + template, params);
	},
	
	_inspect: function(object, indent, template, params) {
		
		var type = object._class;
		var attributes = Ea._Base.Class.getAttributes(type);
		
		params.push(object);
		info(this._indent(indent) + template, params);

		if (this._ids[object.__id__]) {
			info(this._indent(indent + 1) + "#LOOP#");
		}
		else {
			this._ids[object.__id__] = object;
			for (var ai = 0; ai < attributes.length; ai++) {
				
				var property = attributes[ai];
				var value = property.get(object);
				
				var params = {
					name: property.name.replace(/^_+/, ""),
					_private: property.private,
					aggregation: property.aggregation,
					type: property.type,
					isCollection: value && property.type.isClass && value.instanceOf(Core.Types.Collection)
				};
				params.elementType = params.isCollection ? property.elementType : null;
				params.typeName = params.isCollection ? Core.Output.getString(params.type) + "<" + Core.Output.getString(params.elementType) + ">" : Core.Output.getString(params.type);
				params.template = (params._private ? "-" : "") + (property.derived ? "/" : "") + params.name + " [" + params.typeName + "]";

				if (params.isCollection) {
					if (value.instanceOf(Core.Types.Map)) {
						if (value.isEmpty()) {
							info(this._indent(indent + 1) + "$ = {}", [params.template]);
						}
						else {
							info(this._indent(indent + 1) + "$ = {", [params.template]);
							value.forEach(function(value, key) {
								this._expand("$ = $", [key], value, indent + 1, params.aggregation);
							});
							info(this._indent(indent + 1) + "}");
						}
					}
					else {
						if (value.isEmpty()) {
							info(this._indent(indent + 1) + "$ = []", [params.template]);
						}
						else {
							info(this._indent(indent + 1) + "$ = [", [params.template]);
							value.forEach(function(value, index) {
								this._expand("$", [], value, indent + 1, params.aggregation);
							});
							info(this._indent(indent + 1) + "]");
						}
					}
				}
				else {
					this._expand("$ = $", [params.template], value, indent, params.aggregation);
				}
				
			}
		}
		info(this._indent(indent) + "}");
	}
	
};

Ea._Base.Helper.Target = extend(Core.Target.AbstractTarget, /** @lends Ea._Base.Helper.Target# */ {
	
	_name: null,
	
	create: function(name, debug) {
		_super.create(debug);
		this._name = name;
		Ea.getDefaultApplication().getRepository().showOutput(this._name);
		Ea.getDefaultApplication().getRepository().clearOutput(this._name);
	},
	
	/**
	 * @memberOf Ea._Base.Helper.Target#
	 */
	write: function(message) {
		if (this._type == Core.Target.Type.TREE)
			message = message.replace(/\|/g, "      |").replace(/\-/g, "—").replace(/\+/g, "[•]");
		Ea.getDefaultApplication().getRepository().writeOutput(this._name, message);
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
