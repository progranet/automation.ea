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


include("Sys@Sys");
include("Sys.Utils@Sys");
include("Ea@Ea");
include("Browser@Ms.IExplorer");

Inspect = {
	params: {
		object: null,
		indent: "      "
	},
	
	/*fn: function() {
		include("Browser@Ms.IExplorer", {
			document: document
		});
		include("Report@Ksi", {
			outputRoot: "C:\\Temp\\KSI\\3.5.12.wsh\\",
			numer: 1
		});
		Ea.initializeApplication({path: openFileDialog.FileName});
		Ea.initializeLogs(Browser.Target);
	},*/
	
	execute: function(params) {
		
		var application = Ea.initializeDefaultApplication(params);

		/*this.ie = new ActiveXObject("InternetExplorer.Application");
		this.ie.Visible = true;
		this.ie.Navigate("C:\\Temp\\KSI\\raport.js\\logs.html");*/

		var object = this.params.object || application.getRepository().getSelectedObject();
		
		var target = null;
		if (this.params.output) {
			target = new Sys.Utils.FileTarget(this.params.output);
			Core.Log.registerTarget("info", target);
		}
		this.inspect(object);
		if (target) {
			target.close();
		}
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
		var properties = Ea._Base.Class.getAttributes(type);
		
		params.push(object);
		info(this._indent(indent) + template, params);

		if (this._ids[object.__id__]) {
			info(this._indent(indent + 1) + "#LOOP#");
		}
		else {
			this._ids[object.__id__] = object;
			for (var ai = 0; ai < properties.length; ai++) {
				
				var property = properties[ai];
				var value = property.get(object);
				
				var params = {
					name: property.name.replace(/^_+/, ""),
					_private: property.private,
					aggregation: property.aggregation,
					type: property.type,
					collectionType: (value && property.type.isClass) ? property.type.getCollectionType() : null //value.instanceOf(Core.Types.Collection)
				};
				params.elementType = params.collectionType ? property.elementType : null;
				params.typeName = params.collectionType ? Core.Output.getString(params.type) + "<" + Core.Output.getString(params.elementType) + ">" : Core.Output.getString(params.type);
				params.template = (params._private ? "-" : "") + (property.derived ? "/" : "") + params.name + " [" + params.typeName + "]";

				if (params.collectionType) {
					if (params.collectionType == "map") {
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
