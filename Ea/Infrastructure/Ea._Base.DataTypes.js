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

/**
 * @namespace
 */
Ea._Base.DataTypes = {};

Ea._Base.DataTypes.DataType = define({
	
	_source: null,
	_value: null,
	
	create: function(source) {
		_super.create();
		this._source = source;
	},

	valueOf: function() {
		return this._value;
	},
	
	_toString: function() {
		return Core.Output.getString(this._value);
	}
});

Ea._Base.DataTypes.List = extend(Ea._Base.DataTypes.DataType, {
	
	_separator: null,
	
	create: function(source, params) {
		_super.create(source);
		this._separator = params.separator || ";";
		this._value = source ? source.split(this._separator) : [];
	},
	
	getArray: function() {
		return this._value;
	},
	
	valueOf: function() {
		var value = "";
		for (var i = 0; i < this._value.length; i++) {
			var element = this._value[i];
			if (element != "")
				value = value + element + this._separator;
		}
		return value;
	}
});

Ea._Base.DataTypes.Map = extend(Ea._Base.DataTypes.DataType, {
	
	_separator: null,
	_assigment: null,
	
	create: function(source, params) {
		_super.create(source);
		this._separator = params.separator || ";";
		this._assigment = params.assigment || "=";
		this._value = {};
		if (source) {
			var tab = source.split(this._separator);
			for (var t = 0; t < tab.length; t++) {
				var value = tab[t];
				if (value) {
					value = value.split(this._assigment);
					this._value[value[0]] = value[1];
				}
			}
		}
	},
	
	get: function(key) {
		return this._value[key];
	},
	
	set: function(key, value) {
		this._value[key] = value;
	},
	
	getMap: function() {
		return this._value;
	},
	
	valueOf: function() {
		var value = "";
		var i = 0;
		for (var key in this._value) {
			value = value + (0 != i++ ? this._separator : "") + key + this._assigment + this._value[key];
		}
		return value;
	}
});

Ea._Base.DataTypes.ObjectList = extend(Ea._Base.DataTypes.DataType, {
	
	_name: null,
	
	create: function(source) {
		_super.create(source);
		this._value = [];
		if (source) {
			this._name = source.substr(1, source.indexOf(";") - 1);
			var strings = source.split("@END" + this._name + ";");
			for (var s = 0; s < strings.length; s++) {
				var string = strings[s];
				if (!string)
					continue;
				string = string.substr(this._name.length + 1, string.length - (this._name.length + 2));
				//info("string:$", [string]);
				var object = {};
				while(string) {
					var name = string.substr(1, string.indexOf("=") - 1);
					string = string.substr(name.length + 2);
					//info(" name:$|string:$", [name, string]);
					
					string.replace(/(;[a-z_0-9]+=.*|)$/i, function(whole, _string) {
						var value = string.substr(0, string.length - _string.length);
						object[name] = value;
						string = _string;
					});
					
				}
				this._value.push(object);
			}
		}
	},

	getList: function() {
		return this._value;
	}

});

Ea._Base.DataTypes.ObjectMap = extend(Ea._Base.DataTypes.ObjectList, {
	
	_key: null,
	_list: null,
	
	create: function(source, params) {
		_super.create(source);
		this._key = params.key;
		this._list = this._value;
		this._value = {};
		for (var o = 0; o < this._list.length; o++) {
			var object = this._list[o];
			this._value[object[this._key]] = object;
		}
	},
	
	getList: function() {
		return this._list;
	},
	
	getMap: function() {
		return this._value;
	}

});

Ea._Base.DataTypes.Properties = extend(Ea._Base.DataTypes.DataType, {

	create: function(source) {
		_super.create(source);
		this._value = {};
		if (source) {
			var strings = source.split("@ENDPROP;");
			for (var s = 0; s < strings.length; s++) {
				var string = strings[s];
				if (!string)
					continue;
				var object = null;
				string.replace(/@NAME=(.+)@ENDNAME;@TYPE=(.+)@ENDTYPE;@VALU=(.*)@ENDVALU;@PRMT=(.*)@ENDPRMT;/, function(whole, name, type, value, param) {
					object = {
						name: name,
						type: type,
						value: value,
						param: param
					};
				});
				if (object)
					this._value[object.name] = object;
			}
		}
	}
});

Ea._Base.DataTypes.Dimension = extend(Ea._Base.DataTypes.DataType, {
	create: function(source) {
		_super.create(source);
		this._value = {
			left: source.left,
			right: source.right,
			top: source.top,
			bottom: source.bottom
		};
	}
});

Ea._Base.DataTypes.Date = extend(Ea._Base.DataTypes.DataType, {
	
	create: function(source) {
		_super.create(source);
		if (typeof source == "string") {
			var d = this._class.re.exec(string);
			this._value = new Date(d[1], new Number(d[2]) - 1, d[3], d[5], d[6], d[7]);
		}
		else {
			this._value = new Date(source);
		}
	},
	
	_toString: function() {
		var s = "";
		s = s + this._value.getFullYear() + "-";
		s = s + new String(this._value.getMonth() + 1).lpad("0", 2) + "-";
		s = s + new String(this._value.getDate()).lpad("0", 2);
		return s;
	}
},
{
	re: new RegExp("").compile(new RegExp("^(\\d\\d\\d\\d)-(\\d\\d)-(\\d\\d)( (\\d\\d):(\\d\\d):(\\d\\d))?$"))
});

Ea._Base.DataTypes.Appearance = extend(Ea._Base.DataTypes.DataType, {
	
	create: function(source) {
		_super.create(source);
		this._value = {
			backColor: new Ea._Base.DataTypes.Color(source.backColor),
			fontColor: new Ea._Base.DataTypes.Color(source.fontColor),
			borderColor: new Ea._Base.DataTypes.Color(source.borderColor),
			borderStyle: source.borderStyle,
			borderWidth: source.borderWidth
		};
	},
	
	getBackColor: function() {
		return this._value.backColor;
	},
	
	getFontColor: function() {
		return this._value.fontColor;
	},
	
	getBorderColor: function() {
		return this._value.borderColor;
	},
	
	getBorderStyle: function() {
		return this._value.borderStyle;
	},
	
	getBorderWidth: function() {
		return this._value.borderWidth;
	}
});

Ea._Base.DataTypes.Color = extend(Ea._Base.DataTypes.DataType, {
	
	create: function(rgb) {
		_super.create(rgb);
		var _default = rgb == -1;
		this._value = {
			_default: _default,
			red: _default ? null : (rgb >> 16) & 0xFF,
			green: _default ? null : (rgb >> 8) & 0xFF,
			blue: _default ? null : rgb & 0xFF
		};
	},
	
	isDefault: function() {
		return this._value._default;
	},
	
	getRed: function() {
		return this._value.red;
	},
	
	getGreen: function() {
		return this._value.green;
	},
	
	getBlue: function() {
		return this._value.blue;
	},
	
	getHex: function() {
		return this.isDefault() ? null : new Number(this._source).toString(16);
	},
	
	getColor: function() {
		return this._source;
	}
});

