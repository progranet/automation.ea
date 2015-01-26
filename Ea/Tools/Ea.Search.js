/*
   Copyright 2014 300 D&C

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

Ea.Search = define({
	
	xml: "",
	columns: null,
	appication: null,
	
	create: function(application, columns) {

		_super.create();
		this.application = application;
		
		this.xml = this.xml + "<?xml version=\"1.0\" encoding=\"windows-1250\"?>"; 
		this.xml = this.xml + "<ReportViewData UID=\"ModelSearch\">";
		this.xml = this.xml + "<Fields>";
		this.xml = this.xml + "<Field name=\"CLASSGUID\"/>";
		this.xml = this.xml + "<Field name=\"CLASSTYPE\"/>";
		
		this.columns = columns;
		for (var column in columns) {
			this.xml = this.xml + "<Field name=\"" + column + "\"/>";
			var fnDef = columns[column];
			columns[column] = {
				def: fnDef,
				fn: typeof(fnDef) == "function" ? fnDef : new Function("params", "return " + fnDef + ";")
			};
		}
		this.xml = this.xml + "</Fields>";
		this.xml = this.xml + "<Rows>";
	},

	add: function(element, params) {
		
		this.xml = this.xml + "<Row>";
		this.xml = this.xml + "<Field name=\"CLASSGUID\" value=\"" + element.getGuid() + "\"/>";
		this.xml = this.xml + "<Field name=\"CLASSTYPE\" value=\"" + element._getType() + "\"/>";

		for (var column in this.columns) {
			var fn = this.columns[column].fn;
			var value = (fn.call(element, params) || "") + "";
			this.xml = this.xml + "<Field name=\"" + column + "\" value=\"" + value.replace(/"/g, "'").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "\"/>";
		}

		this.xml = this.xml + "</Row>";

	},
	
	render: function() {
		
		this.xml = this.xml + "</Rows>";
		this.xml = this.xml + "</ReportViewData>";

		this.application.getRepository().renderSearchResults(this.xml);
	}
	
});
