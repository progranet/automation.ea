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
	_providerClasses: {},
		
	getProvider: function(name) {
		var provider = this._providers[name];
		if (!provider && (name in this._providerClasses))
			provider = this._providers[name] = new this._providerClasses[name](name);
		if (provider)
			return provider;
		throw new Error("No such data access provider: " + name);
	},
	
	registerProviderClass: function(name, providerClass) {
		this._providerClasses[name] = providerClass;
	}
		
};

DataAccess._Provider = extend(Core.Types.Named, {

	_tables: null,
	
	create: function(name) {
		_super.create(name);
		var tables = this._getTables();
		this._tables = tables;
		for (var tableName in tables) {
			var table = tables[tableName];
			table.nativeColumns = {};
			for (var abstractName in table.columns) {
				var column = table.columns[abstractName];
				column.name = abstractName;
				table.nativeColumns[column.native] = column;
			}
		}
	},
	
	getSelect: function(table) {
		throw new Error("Not implemented method");
	},

	getExpression: function(table, key, value, operator) {
		throw new Error("Not implemented method");
	},

	_getTables: function() {
		throw new Error("Provider._getTables method not implemented for data access provider: " + this.getName());
	},
	
	getColumnByNative: function(table, nativeName) {
		return this._tables[table].nativeColumns[nativeName];
	},
	
	getColumn: function(table, columnName) {
		return this._tables[table].columns[columnName];
	},

	getTable: function(tableName) {
		return this._tables[tableName].meta;
	}
});
