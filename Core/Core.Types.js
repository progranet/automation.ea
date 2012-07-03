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

var callback = function(source, namespace, propertyName, qualifiedName, _static) {
	return source.replace(/\.\s*forEach\s*\(/g, ".forEach(this, ");
};

Core.enrichMethodRegister(callback);

Core.Types = {
	_id: 0,
	getId: function() {
		return Core.Types._id++;
	}
};

Core.Types.Object = Core.Lang._define("Core.Types", "Object", null, {
	
	create: function() {
		this._setId();
	},
	
	__id__: null,
	_setId: function() {
		this.__id__ = "#" + Core.Types.getId();
	},
	
	instanceOf: function(_class) {
		return this._class === _class || this._class.isSubclassOf(_class);
	},
	
	match: function(filter) {
		return (Core.Types.Filter.ensure(filter)).check(this);
	},
	
	_toString: function() {
		return " [" + this._class + "]";
	}
},
{
	initialize: function() {

	}
});

Core.Types.Named = define({
	
	_name: null,
	
	create: function(name) {
		_super.create();
		this._name = name;
	},
	
	getName: function() {
		return this._name;
	},
	
	_toString: function() {
		return this.getName() + " [" + this._class + "]";
	}
});

Core.Types.Collection = define({

	_filter: null,
	size: 0,
	_elements: null,
	_table: null,

	create: function(params) {
		params = params || {};
		this._elements = {};
		this._table = [];
		this._filter = Core.Types.Filter.ensure(params.filter);
		this.addAll(params.collection);
	},
	
	add: function(element) {
		if (!element || !Core.Types.Object.isInstance(element))
			return false;
		if (!this._add(element))
			return false;
		if (!this._filter.check(element))
			return false;
		if (element.__id__ in this._elements) {
			debug("Element already exists in collection: $ (object.__id__ = $)", [element, element.__id__]);
			return false;
		}
		this._table.push(element);
		this._elements[element.__id__] = element;
		this.size++;
		this._added(element);
		return true;
	},
	
	_add: function(element) {
		return true;
	},
	
	_added: function(element) {
		
	},
	
	addAll: function(collection) {
		if (!collection) return;
		collection = this._addAll(collection);
		var target = this;
		if (collection instanceof Array) {
			for (var e = 0; e < collection.length; e++) {
				target.add(collection[e]);
			}
		}
		else if(Core.Types.Collection.isInstance(collection)) {
			collection.forEach(function(element) {
				target.add(element);
			});
		}
		else {
			throw new Error("Unknown collection type: " + collection);
		}
	},
	
	_addAll: function(collection) {
		return collection;
	},
	
	forEach: function(context, fn) {
		for (var i = 0; i < this.size; i++) {
			if (fn.call(context, this._table[i], i)) break;
		}
	},
	
	isEmpty: function() {
		return this.size == 0;
	},
	
	notEmpty: function() {
		return this.size > 0;
	},
	
	first: function() {
		if (this.size == 0)
			return null;
		else {
			var element = null;
			for (var id in this._elements) {
				element = this._elements[id];
				break;
			}
			return element;
		}
	},
	
	filter: function(filter) {
		if (!filter) return this;
		var filtered = new Core.Types.Collection({filter: this._filter});
		filter = Core.Types.Filter.ensure(filter);
		this.forEach(function(element) {
			if (filter.check(element)) {
				filtered.add(element);
			}
		});
		return filtered;
	},
	
	getString: function(fn, separator) {
		var string = "";
		fn = (typeof fn == "function" ? fn : new Function("return " + fn + ";"));
		this.forEach(function(element, index) {
			string = string + (separator ? (index == 0 ? "" : separator) : "") + fn.call(element);
		});
		return string;
	}
});

Core.Types.Map = extend(Core.Types.Collection, {
	
	_keyDef: null,
	_keyFn: null,
	_valueDef: null,
	_valueFn: null,
	_map: null,
	
	create: function(params) {
		params = params || {};
		this._keyDef = params.key;
		this._keyFn = new Function("return " + this._keyDef + ";");
		this._valueDef = params.value;
		this._valueFn = this._valueDef ? new Function("return " + this._valueDef + ";") : null;
		this._map = {};
		_super.create(params);
	},
	
	_added: function(element) {
		var key = this._keyFn.call(element);
		if (!key) {
			throw new Error("Key not found for: " + element + ", according to key definition: " + this._keyDef);
		}
		if (this._map[key]) {
			debug("Key already exisis in map: " + key);
		}
		var value = this._valueFn ? this._valueFn.call(element) : element;
		this._map[key] = value;
	},
	
	get: function(key) {
		return key in this._map ? this._map[key] : undefined;
	},

	forEach: function(context, fn) {
		for (var key in this._map) {
			if (fn.call(context, this._map[key], key)) break;
		}
	}
});

Core.Types.Filter = define({
	_filter: null,
	create: function(filter) {
		if (filter) {
			this._filter = filter instanceof Array ? filter : [filter];
		}
	},
	check: function(object) {
		if (!this._filter) return true;
		for (var f = 0; f < this._filter.length; f++) {
			var filter = this._filter[f];
			if (typeof filter  == "function" || typeof filter == "string") {
				filter = {$fn: filter.isClass ? "this.instanceOf(" + filter.qualifiedName + ")" : filter};
			}
			var match = true;
			for (var a in filter) {
				var $and = filter[a];
				$and = $and instanceof Array ? $and : [$and];
				var m = false;
				for (var p = 0; p < $and.length; p++) {
					var $or = $and[p];
					if (a == "$fn") {
						if (typeof $or == "string")
							$or = new Function("return " + $or);
						if ($or.call(object)) {
							m = true;
							break;
						}
					}
					else {
						if (eval("object." + a + " == $or")) {
							m = true;
							break;
						}
					}
				}
				if (!m) {
					match = false;
					break;
				}
			}
			if (match) {
				return true;
			}
		}
		return false;
	}
});

Core.Types.Date = define({
	date: null,
	create: function(value) {
		if (typeof value == "string") {
			var d = Core.Types.Date.re.exec(string);
			this.date = new Date(d[1], new Number(d[2]) - 1, d[3], d[5], d[6], d[7]);
		}
		else {
			this.date = new Date(value);
		}
	},
	valueOf: function() {
		return this.date.valueOf();
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
