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

Ea.DataTypes = {

};

Ea.DataTypes.List = define({
	
	_string: null,
	_value: null,
	
	create: function(string, params) {
		_super.create();
		this._string = string;
		this._value = string ? string.split(params.separator || ",") : [];
	},
	
	forEach: function(fn) {
		for (var i = 0; i < this._value.length; i++) {
			fn(this._value[i], i);
		}
	},
	
	valueOf: function() {
		return this._value;
	},
	
	_toString: function() {
		return Core.Output.getString(this._value);
	}
});

Ea.DataTypes.Map = define({
	
	_string: null,
	_value: null,
	
	create: function(string) {
		_super.create();
		this._string = string;
		var separator = ";";
		var assigment = "=";
		this._value = {};
		if (string) {
			var tab = string.split(separator);
			for (var t = 0; t < tab.length; t++) {
				var value = tab[t];
				if (value) {
					value = value.split(assigment);
					this._value[value[0]] = value[1];
				}
			}
		}
	},
	
	get: function(key) {
		return this._value[key];
	},
	
	forEach: function(fn) {
		for (var key in this._value) {
			fn(this._value[key], key);
		}
	},
	
	valueOf: function() {
		return this._value;
	},
	
	_toString: function() {
		return Core.Output.getString(this._value);
	}
});

Ea.DataTypes.Date = define({
	date: null,
	create: function(value) {
		if (typeof value == "string") {
			var d = this._class.re.exec(string);
			this.date = new Date(d[1], new Number(d[2]) - 1, d[3], d[5], d[6], d[7]);
		}
		else {
			this.date = new Date(value);
		}
	},
	valueOf: function() {
		return this.date;
	},
	_toString: function() {
		var s = "";
		s = s + this.date.getFullYear() + "-";
		s = s + new String(this.date.getMonth() + 1).lpad("0", 2) + "-";
		s = s + new String(this.date.getDate()).lpad("0", 2);
		return s;
	}
}, {
	re: new RegExp("").compile(new RegExp("^(\\d\\d\\d\\d)-(\\d\\d)-(\\d\\d)( (\\d\\d):(\\d\\d):(\\d\\d))?$"))
});

Ea.DataTypes.PrimitiveType = extend(Core.Types.Named, {},
{
	_primitiveTypes: {},
	getPrimitiveType: function(name) {
		if (!name)
			return null;
		if (!(name in this._primitiveTypes)) {
			this._primitiveTypes[name] = new Ea.DataTypes.PrimitiveType(name);
		}
		return this._primitiveTypes[name];
		
	}
});
