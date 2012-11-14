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
	
	echo: function(message) {
		this.script.Echo(message);
	}
		
};

Script.Target = extend(Core.Target.AbstractTarget, {
	
	_name: null,
	
	create: function(name, debug) {
		_super.create(debug);
		this._name = name;
	},
	
	write: function(message) {
		//Script.echo(message);
		WScript.StdErr.WriteLine(message);
	}
});