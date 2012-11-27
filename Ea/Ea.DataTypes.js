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
Ea.DataTypes = {

};

Ea.DataTypes._Type = define({
	
	_source: null,
	
	create: function(source) {
		_super.create();
		this._source = source;
	}
},
{
	create: function(source, params) {
		return new this(source, params);
	}
});

Ea.DataTypes.List = extend(Ea.DataTypes._Type, {
	
	_value: null,
	
	create: function(source, params) {
		_super.create(source);
		this._value = source ? source.split(params.separator || ",") : [];
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

Ea.DataTypes.Map = extend(Ea.DataTypes._Type, {
	
	_value: null,
	
	create: function(source) {
		_super.create(source);
		var separator = ";";
		var assigment = "=";
		this._value = {};
		if (source) {
			var tab = source.split(separator);
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

Ea.DataTypes.Date = extend(Ea.DataTypes._Type, {
	
	date: null,
	
	create: function(source) {
		_super.create(source);
		if (typeof source == "string") {
			var d = this._class.re.exec(string);
			this.date = new Date(d[1], new Number(d[2]) - 1, d[3], d[5], d[6], d[7]);
		}
		else {
			this.date = new Date(source);
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
},
{
	re: new RegExp("").compile(new RegExp("^(\\d\\d\\d\\d)-(\\d\\d)-(\\d\\d)( (\\d\\d):(\\d\\d):(\\d\\d))?$"))
});

Ea.DataTypes.RunState = extend(Ea.DataTypes._Type, {
	
	_value: null,
	
	create: function(source) {
		_super.create(source);
		var rst = source.split("@ENDVAR;");
		this._value = {};
		for (var rsi = 0; rsi < rst.length; rsi++) {
			var rs = rst[rsi];
			if (rs.length > 0) {
				rs = rs.substring(4).replace(/"/g, "'");
				rs = rs.substring(0, rs.length - 1) + "\"";
				rs = rs.replace(/;([^=]+)=/g, function($0, $1) {
					return "\", " + $1.substring(0, 1).toLowerCase() + $1.substring(1) + ": \"";
				});
				rs = rs.substring(3).replace(/\n/g, "\\n").replace(/\r/g, "\\r");
				eval("var rsot = {" + rs + "}");
				this._value[rsot.variable] = rsot;
			}
		}
	},
	
	valueOf: function() {
		return this._value;
	},
	
	_toString: function() {
		return Core.Output.getString(this._value);
	}
});

Ea.DataTypes.Dimension = extend(Ea.DataTypes._Type, {
	
	left: null,
	right: null,
	top: null,
	bottom: null,
	
	create: function(source) {
		_super.create(source);
		this.left = source.left;
		this.right = source.right;
		this.top = source.top;
		this.bottom = source.bottom;
	},

	valueOf: function() {
		return {
			left: this.left,
			top: this.top,
			right: this.right,
			bottom: this.bottom
		};
	},
	
	_toString: function() {
		return Core.Output.getString(this.valueOf());
	}
});


Ea.DataTypes.Appearance = extend(Ea.DataTypes._Type, {
	
	_backColor: null,
	_fontColor: null,
	_borderColor: null,
	_borderStyle: null,
	_borderWidth: null,
	
	create: function(source) {
		_super.create(source);
		this._backColor = new Ea.DataTypes.Color(source.Backcolor);
		this._fontColor = new Ea.DataTypes.Color(source.Fontcolor);
		this._borderColor = new Ea.DataTypes.Color(source.Bordercolor);
		this._borderStyle = source.BorderStyle;
		this._borderWidth = source.BorderWidth;
	},
	
	valueOf: function() {
		return {
			backColor: this._backColor,
			fontColor: this._fontColor,
			borderColor: this._borderColor,
			borderStyle: this._borderStyle,
			borderWidth: this._borderWidth
		};
	},
	
	getBackColor: function() {
		return this._backColor;
	},
	
	getFontColor: function() {
		return this._fontColor;
	},
	
	getBorderColor: function() {
		return this._borderColor;
	},
	
	getBorderStyle: function() {
		return this._borderStyle;
	},
	
	getBorderWidth: function() {
		return this._borderWidth;
	},
	
	_toString: function() {
		return Core.Output.getString(this.valueOf());
	}
	
});

Ea.DataTypes.Color = extend(Ea.DataTypes._Type, {
	
	_red: null,
	_green: null,
	_blue: null,
	_default: false,
	
	create: function(rgb) {
		_super.create(rgb);
		if (rgb == -1) {
			this._default = true;
		}
		else {
			this._red = (rgb >> 16) & 0xFF;;
			this._green = (rgb >> 8) & 0xFF;
			this._blue = rgb & 0xFF;
		}
	},
	
	valueOf: function() {
		return {
			_default: this._default,
			red: this._red,
			green: this._green,
			blue: this._blue
		};
	},
	
	isDefault: function() {
		return this._default;
	},
	
	getRed: function() {
		return this._red;
	},
	
	getGreen: function() {
		return this._green;
	},
	
	getBlue: function() {
		return this._blue;
	},
	
	getHex: function() {
		return new Number(this._source).toString(16);
	},
	
	getColor: function() {
		return this._source;
	},
	
	_toString: function() {
		return Core.Output.getString(this.valueOf());
	}
	
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
		
	},
	
	create: function(source, params) {
		return new this(source, params);
	}
});
