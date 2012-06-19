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

Ea.File = {};

Ea.File._Base = extend(Ea.Named, {},
{
	api: "File",
	getType: function(source) {
		var typeName = this._type.get(source).replace(/\s/g,"");
		var type = this.namespace[typeName];
		if (!type) {
			throw new Error("Not implemented File type: " + typeName);
		}
		return type;
	},
	_type: new Ea.Helper.Property({api: "Type"})
});

Ea.File.WebAdress = extend(Ea.File._Base, {
	getHref: function() {
		var href = this.getName();
		if (!href.indexOf("http")) {
			href = "http://" + href;
		}
		return href;
	}
});

Ea.File.LocalFile = extend(Ea.File._Base, {
	getHref: function() {
		return this.getName();
	}
});
