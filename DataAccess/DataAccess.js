/*
   Copyright 2013 300 D&C

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

/**
 * @namespace
 */
DataAccess = {
	
	_providers: {},
		
	getProvider: function(name) {
		var provider = this._providers[name];
		if (provider)
			return provider;
		throw new Error("No such data access provider: " + name);
	},
	
	registerProviderClass: function(name, providerClass) {
		var provider = new providerClass(name);
		this._providers[name] = provider;
	}
		
};

DataAccess._Provider = extend(Core.Types.Named, {

	_tables: null,
	
	getSelect: function(table) {
		throw new Error("Not implemented method");
	},

	getExpression: function(table, key, value, operator) {
		throw new Error("Not implemented method");
	},

	getColumn: function(table, column) {
		throw new Error("Not implemented method");
	}
});
