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
include("Sys.IO@Sys");
include("Ea@Ea");

Search = {
		
	params: {
		
	},

	file: null,
	application: null,
	xml: "",
	
	initialize: function() {
		this.application = Ea.initializeDefaultApplication();
	},

	execute: function(params) {
		
		if (!this.application)
			this.initialize();

		info("=== START ===");
		
		var _package = (params && params.package) ? params.package : this.application.getRepository().getSelectedPackage();
		
		if (this.params.file) {
			this.file = new Sys.IO.File(this.params.file, Sys.IO.Mode.WRITE);
		}
		else {
			this.file = {
				write: function() {},
				writeLine: function() {}
			};
		}
		
		this.params.selectFn = this.params.select ? new Function("return " + this.params.select) : null;
		
		this.processOutputHead();
		this.processPackage(_package);
		this.processOutputFoot();
		this.application.getRepository().renderSearchResults(this.xml);

		info("=== FINISHED ===");
	},
	
	processOutputHead: function() {
		this.xml = this.xml + "<?xml version=\"1.0\" encoding=\"windows-1250\"?>"; 
		this.xml = this.xml + "<ReportViewData UID=\"ModelSearch\">";
		this.xml = this.xml + "<Fields>";
		this.xml = this.xml + "<Field name=\"CLASSGUID\"/>";
		this.xml = this.xml + "<Field name=\"CLASSTYPE\"/>";
		
		var columns = this.params.output;
		for (var column in columns) {
			this.xml = this.xml + "<Field name=\"" + column + "\"/>";
			this.file.write(column + ";");
			var fnDef = columns[column];
			columns[column] = {
				def: fnDef,
				fn: typeof(fnDef) == "function" ? fnDef : new Function("return " + fnDef + ";")
			};
		}
		this.xml = this.xml + "</Fields>";
		this.file.writeLine("");

		this.xml = this.xml + "<Rows>";
	},
	
	processOutputFoot: function() {
		this.xml = this.xml + "</Rows>";
		this.xml = this.xml + "</ReportViewData>";
	},
	
	processOutputRow: function(element, selected) {
		
		this.xml = this.xml + "<Row>";
		this.xml = this.xml + "<Field name=\"CLASSGUID\" value=\"" + element.getGuid() + "\"/>";
		this.xml = this.xml + "<Field name=\"CLASSTYPE\" value=\"" + element._getType() + "\"/>";

		var columns = this.params.output;
		for (var column in columns) {
			var fn = columns[column].fn;
			var value = (fn.call(selected) || "") + "";
			this.file.write("\"" + value.replace(/"/g, "'") + "\";");
			this.xml = this.xml + "<Field name=\"" + column + "\" value=\"" + value.replace(/"/g, "'").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;") + "\"/>";
		}

		this.xml = this.xml + "</Row>";
		this.file.writeLine("");
	},
	
	processPackage: function(_package) {
		
		Ea.log(_package);
		
		_package.getElements().forEach(function(element) {
			Search.processElement(element);
		});
		
		if (this.params.drill) {
			_package.getPackages().forEach(function(_package) {
				Search.processPackage(_package);
			});
		}
	},
	
	processElement: function(element) {
		
		if (element.match(this.params.filter)) {
			if (Search.params.selectFn) {
				var selection = this.params.selectFn.call(element);
				if (selection) {
					if (Core.Types.Collection.isInstance(selection)) {
						selection.forEach(function(selected) {
							this.processOutputRow(element, selected);
						});
					}
					else {
						this.processOutputRow(element, selection);
					}
				}
			}
			else {
				this.processOutputRow(element, element);
			}
		}
		
		element.getEmbeddedElements().forEach(function(element) {
			Search.processElement(element);
		});
		
	}
	
};
