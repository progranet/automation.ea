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

Array.prototype.contains = function(element) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === element) return true;
	}
	return false;
};

String.prototype.lpad = function(pad, length) {
	var s = this;
    while (s.length < length)
        s = pad + s;
    return s;
};

String.prototype.trim = function() {
    return this.replace(/^\s+/g, "").replace(/\s+$/g, "");
};


Core.Helper = {
	
	getNames: function(object) {
		var names = [];
		for (name in object) {
			names.push(name);
		}
		return names;
	},
	
	getValues: function(object) {
		var values = [];
		for (name in object) {
			values.push(object[name]);
		}
		return values;
	}
};
