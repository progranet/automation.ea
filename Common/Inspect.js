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

Inspect = {
	params: {
		
	},
	
	execute: function() {
		
		if (!Ea.Application.isActivated()) {
			Ea.initializeApplication();
			Ea.initializeLogs(Ea.Helper.Target);
		}
		var object = Ea.Application.getRepository().getSelectedObject();
		
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
