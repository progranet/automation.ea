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

Core.registerMethodEnrichment(callback);

/**
 * @namespace
 */
Core.Types = {
	_id: 0,
	/**
	 * @private
	 */
	_getId: function() {
		return Core.Types._id++;
	}
};

Core.Types.Object = Core.Lang._define("Core.Types", "Object", null, /** @lends Core.Types.Object# */ {
	
	/**
	 * Core.Types.Object constructor
	 * 
	 * @constructs
	 */
	create: function() {
		this._setId();
	},

	__id__: null,
	/**
	 * @private
	 */
	_setId: function() {
		this.__id__ = "#" + Core.Types._getId();
	},
	
	/**
	 * Checks if object is instance of specified class
	 * 
	 * @memberOf Core.Types.Object#
	 * @param {Function} _class
	 * @returns {Boolean}
	 */
	instanceOf: function(_class) {
		return this._class === _class || this._class.isSubclassOf(_class);
	},
	
	/**
	 * Checks if object match specified filter
	 * 
	 * @see Core.Types.Filter
	 * @memberOf Core.Types.Object#
	 * @param {Object} filter
	 * @returns {Boolean}
	 */
	match: function(filter) {
		return (Core.Types.Filter.ensure(filter)).check(this);
	},
	
	/**
	 * @private
	 */
	_toString: function() {
		return " [" + this._class + "]";
	}
},
{
	/**
	 * Class initialization 
	 * 
	 * @memberOf Core.Types.Object
	 * @static
	 */
	initialize: function() {

	}
});

Core.Types.Named = define(/** @lends Core.Types.Named# */{
	
	_name: null,
	
	/**
	 * Core.Types.Named constructor
	 * 
	 * @constructs
	 * @extends Core.Types.Object
	 * @param {String} name
	 */
	create: function(name) {
		_super.create();
		this._name = name;
	},
	
	/**
	 * Returns name
	 * 
	 * @memberOf Core.Types.Named#
	 * @returns {String}
	 */
	getName: function() {
		return this._name;
	},
	
	/**
	 * @private
	 */
	_toString: function() {
		return this.getName() + " [" + this._class + "]";
	}
});

Core.Types.Collection = define(/** @lends Core.Types.Collection# */{

	_filter: null,
	_size: 0,
	_elements: null,
	_table: null,

	/**
	 * Core.Types.Collection constructor
	 * 
	 * @constructs
	 * @extends Core.Types.Object
	 * @param {Object} params Specifies initial parameters: {@link Core.Types.Filter} filter, {@link Core.Types.Collection} collection
	 */
	create: function(params) {
		params = params || {};
		this._elements = {};
		this._table = [];
		this._filter = Core.Types.Filter.ensure(params.filter);
		this.addAll(params.collection);
	},
	
	/**
	 * Adds element to collection
	 * 
	 * @memberOf Core.Types.Collection#
	 * @param {Object} element
	 * @returns {Boolean}
	 */
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
		this._size++;
		this._added(element);
		return true;
	},
	
	/**
	 * @private
	 */
	_add: function(element) {
		return true;
	},
	
	/**
	 * @private
	 */
	_added: function(element) {
		
	},
	
	/**
	 * Adds elements of other to collection
	 * 
	 * @memberOf Core.Types.Collection#
	 * @param {Core.Types.Collection} collection
	 */
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
	
	/**
	 * @private
	 */
	_addAll: function(collection) {
		return collection;
	},
	
	/**
	 * Collection iterator.
	 * 
	 * @memberOf Core.Types.Collection#
	 * @param {Object} context
	 * @param {Function} fn
	 */
	forEach: function(context, fn) {
		for (var i = 0; i < this._size; i++) {
			if (fn.call(context, this._table[i], i)) break;
		}
	},
	
	/**
	 * Returns collection's size.
	 * 
	 * @memberOf Core.Types.Collection#
	 * @returns {Number}
	 */
	getSize: function() {
		return this._size;
	},
	
	/**
	 * Checks if collection is empty
	 * 
	 * @memberOf Core.Types.Collection#
	 * @returns {Boolean}
	 */
	isEmpty: function() {
		return this._size == 0;
	},
	
	/**
	 * Checks if collection is not empty
	 * 
	 * @memberOf Core.Types.Collection#
	 * @returns {Boolean}
	 */
	notEmpty: function() {
		return this._size != 0;
	},
	
	/**
	 * Returns first element of collection
	 * 
	 * @memberOf Core.Types.Collection#
	 * @returns {Object}
	 */
	first: function() {
		if (this._size == 0)
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
	
	/**
	 * Returns new collection containing elements matching specified filter
	 * 
	 * @see Core.Types.Filter
	 * @memberOf Core.Types.Collection#
	 * @param {Object} filter
	 * @returns {Core.Types.Collection}
	 */
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
	}
});

Core.Types.Map = extend(Core.Types.Collection, /** @lends Core.Types.Map# */{
	
	_keyDef: null,
	_keyFn: null,
	_valueDef: null,
	_valueFn: null,
	_map: null,
	
	/**
	 * Core.Types.Map constructor
	 * 
	 * @constructs
	 * @extends Core.Types.Collection
	 * @param {Object} params Specifies initial parameters: {@link Core.Types.Filter} filter, {@link Core.Types.Collection} collection
	 */
	create: function(params) {
		params = params || {};
		this._keyDef = params.key;
		this._keyFn = new Function("return " + this._keyDef + ";");
		this._valueDef = params.value;
		this._valueFn = this._valueDef ? new Function("return " + this._valueDef + ";") : null;
		this._map = {};
		_super.create(params);
	},
	
	/**
	 * @private
	 */
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
	
	/**
	 * Returns element for specified key
	 * 
	 * @memberOf Core.Types.Map#
	 * @param {Object} key
	 * @returns {Object}
	 */
	get: function(key) {
		return key in this._map ? this._map[key] : undefined;
	},

	/**
	 * Map iterator.
	 * 
	 * @memberOf Core.Types.Map#
	 * @param {Object} context
	 * @param {Function} fn
	 */
	forEach: function(context, fn) {
		for (var key in this._map) {
			if (fn.call(context, this._map[key], key)) break;
		}
	}
});

Core.Types.Filter = define(/** @lends Core.Types.Filter# */{
	
	_filter: null,

	/**
	 * Creates new filter
	 * 
	 * @constructs
	 * @extends Core.Types.Object
	 * @param {?(Class|String|Function)} filter
	 */
	create: function(filter) {
		_super.create();
		if (filter) {
			if (filter.isClass)
				filter = "this.instanceOf(" + filter.qualifiedName + ")";
			if (typeof(filter) == "string")
				filter = new Function("return " + filter);
			if (typeof(filter) != "function")
				throw new Error("Unknown filter type: " + filter);
		}
		this._filter = filter;
	},
	
	/**
	 * Checks if object match this filter
	 * 
	 * @memberOf Core.Types.Filter#
	 * @param {Object} object
	 * @returns {Boolean}
	 */
	check: function(object) {
		return this._filter ? this._filter.call(object) : true;
	}
});
