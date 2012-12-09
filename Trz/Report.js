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

include("Core@Core");
include("Core.Lang@Core");
include("Core.Types@Core");
include("Html@Html");
include("Ea@Ea");

Report = {
		
	_new: null,
	_old: null,
		
	params: {
		
	},

	initialize: function() {
		this._new = new Ea.Instance();
		this._old = new Ea.Instance({path: "D:\\DOKUMENTY\\EA\\TRZ1.eap"});
	},

	execute: function() {
		info("=== START ===");
		
		var package = this._new.getRepository().getSelectedPackage();
		
		this.processPackage(package);
		
		info("=== FINISHED ===");
	},
	
	processPackage: function(package) {
		package.log();
		var elements = package.getElements();
		elements.forEach(function(element) {
			this.processElement(element);
		});
		var packages = package.getPackages();
		packages.forEach(function(element) {
			this.processPackage(element);
		});
	},
	
	processElement: function(element) {
		var old = this._old.getRepository().getByGuid(Ea.Element._Base, element.getGuid());
		var n1, n2;
		info("$", [n2 = element.getNotes()]);
		info("$", [n1 = old.getNotes()]);
		var dmp = new diff_match_patch();
		//dmp.Diff_Timeout = 1;
		dmp.Diff_EditCost = 4;
		
		var d = dmp.diff_main(n1, n2);
		
		dmp.diff_cleanupEfficiency(d);
		var ds = dmp.diff_prettyHtml(d);

		info("$", [ds]);
	}
};
