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
include("Browser@Ms.IExplorer");

Inspect = {
	params: {
		
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
	
	execute: function() {
		
		var application = Ea.initializeDefaultApplication();

		/*this.ie = new ActiveXObject("InternetExplorer.Application");
		this.ie.Visible = true;
		var r = this.ie.Navigate("C:\\Temp\\KSI\\raport.js\\logs.html");
		Session.Output(">>>" + r);
		for (var i = 0; i < 100000000; i++) {

		}
		this.ie.Document;*/

		var object = application.getRepository().getSelectedObject();
		
		var target = null;
		if (this.params.output) {
			target = new Sys.IO.FileTarget(this.params.output);
			Core.Log.registerTarget("info", target);
		}
		Ea.Helper.inspect(object);
		if (target) {
			target.close();
		}
	}
};
