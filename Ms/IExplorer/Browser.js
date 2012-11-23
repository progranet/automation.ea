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

Browser = {
	
	params: {
		document: null
	},
	
	initialize: function() {
		
	},
	
	getDocument: function() {
		return this.params.document;
	}
};

Browser.Target = extend(Core.Target.AbstractTarget, {
	
	_name: null,
	
	create: function(name, debug) {
		_super.create(debug);
		this._name = name;
	},
	
	write: function(message) {
		var document = Browser.getDocument();
		var log = document.getElementById(this._name);
		if (this._type == Core.Target.Type.TREE)
			message = message.replace(/\|/g, "&nbsp;&nbsp;|").replace(/\-/g, "—").replace(/\+/g, "[+]");
		log.innerHTML = log.innerHTML + message + "<br>";
	}
});