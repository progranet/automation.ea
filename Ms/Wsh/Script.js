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

Script = {
	
	script: null,
	
	initialize: function() {
		this.script = WScript;
	},
	
	info: function(message) {
		this.script.Echo(message);
		//console.log(message);
	},
	
	error: function(message) {
		this.script.StdErr.WriteLine(message);
	}	
};

Script.Target = extend(Core.Target.AbstractTarget, {
	
	_name: null,
	
	create: function(debug, params) {
		_super.create(debug);
		params = params || {};
		this._name = params.name;
	},
	
	write: function(message) {
		if (this._type == Core.Target.Type.TREE)
			message = message.replace(/\|/g, " \u2502").replace(/\u2502\-\+/, "\u251C\u2500\u25D8").replace(/\-\+/, " \u25D8");
		Script.info(message);
	}
});