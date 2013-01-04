/*
   Copyright 2012 300 D&C

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

include("Ea@Ea");
include("Sys@Sys");
include("Sys.IO@Sys");
include("Ea._Base.Documentation@Ea.Base");

Documentation = {
		
	params: {
		
	},
	
	execute: function() {
		
		var application = Ea.initializeDefaultApplication();
		
		info("=== START ===");
		
		var root = application.getRepository().getSelectedPackage();
		
		for (var l = 0; l < this.params.libs.length; l++) {
			var lib = this.params.libs[l];
			Ea._Base.Documentation.process(root, lib);
		}

		info("=== FINISHED ===");
	}
};
