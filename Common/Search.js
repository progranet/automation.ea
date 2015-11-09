/*
   Copyright 2015 300 D&C

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

include("Html@Html");
include("Html.IO@Html");
include("Ea@Ea");
include("Bpmn@Extension.Bpmn");

Search = {
		
	params: {
		template: "ea.xml",
		file: "results.xml",
		br: "&#10;",
		folder: ""
	},

	application: null,
	template: null,
	templateName: null,
	rowTemplate: null,
	pkg: null,
	output: null,
	
	initialize: function() {
		this.application = Ea.initializeDefaultApplication();
		this.templateName = this.params.template;
		this.template = Html.loadXTemplates(this.templateName, this, {
			rows: Search.processRows
		});
	},

	execute: function(params) {
		
		if (!this.application)
			this.initialize();

		info("=== START ===");
		
		this.pkg = (params && params.package) ? params.package : this.application.getRepository().getSelectedPackage();
		
		this.params.selectFn = this.params.select ? new Function("return " + this.params.select) : null;
		
		var columns = this.params.output;
		var columnsCount = 0;
		for (var column in columns) {
			var fnDef = columns[column];
			columns[column] = {
				def: fnDef,
				fn: typeof(fnDef) == "function" ? fnDef : new Function("return " + fnDef + ";")
			};
			columnsCount++;
		}

//		Sys.IO.createFolder(this.params.folder);
		this.output = new Html.IO.File(this.params.folder + this.params.file);
		if (!this.params.folder)
			warn("No output folder specified. Writing to default location: " + this.output.getPath());
		this.output.write(this.template, {
			columns: columns,
			columnsCount: columnsCount
		});
		this.output.close();
		
		if (this.templateName == "ea.xml") {
			var file = new Sys.IO.File(this.params.folder + this.params.file, Sys.IO.Mode.READ, Sys.IO.Unicode.DEFAULT);
			var xml = file.readAll();
			this.application.getRepository().renderSearchResults(xml);
		}
		
		info("=== FINISHED ===");
	},
	
	processRows: function(output, template, params) {
		Search.rowTemplate = template.templates.row;
		Search.processPackage.apply(Search, [Search.pkg]);
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
					if (Core.Types.AbstractCollection.isInstance(selection)) {
						selection.forEach(function(selected) {
							Search.processRow(element, selected);
						});
					}
					else {
						Search.processRow(element, selection);
					}
				}
			}
			else {
				Search.processRow(element, element);
			}
		}
		
		element.getElements().forEach(function(element) {
			Search.processElement(element);
		});
		
	},
	
	processRow: function(element, selected) {
		this.output.write(this.rowTemplate, {
			element: element,
			selected: selected
		});
	}
};
