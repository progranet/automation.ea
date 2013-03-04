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

var callback = function(source, namespace) {
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

Core.Types.Object = define(/** @lends Core.Types.Object# */ {
	
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
	 * Checks if this object is an instance of specified class
	 * 
	 * @memberOf Core.Types.Object#
	 * @param {Class} _class
	 * @type {Boolean}
	 */
	instanceOf: function(_class) {
		return this._class.conformsTo(_class);
	},
	
	/**
	 * Checks if this object matches specified filter
	 * 
	 * @see Core.Types.Filter
	 * @memberOf Core.Types.Object#
	 * @param {Object} filter
	 * @type {Boolean}
	 */
	match: function(filter) {
		return (Core.Types.Filter.ensure(filter)).check(this);
	},
	
	/**
	 * Checks if specified object is equal to this.
	 * 
	 * @param {Core.Types.Object} object
	 */
	equals: function(object) {
		return this.__id__ === object.__id__;
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
	 * Returns this name
	 * 
	 * @memberOf Core.Types.Named#
	 * @type {String}
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

	_size: 0,
	_table: null,

	/**
	 * Core.Types.Collection constructor
	 * 
	 * @constructs
	 * @param {Object} params Specifies initial parameters: {@link Core.Types.Filter} filter, {@link Core.Types.Collection} collection
	 */
	create: function(params) {
		params = params || {};
		this._table = [];
		
		if (params.collection)
			this.addAll(params.collection);
	},
	
	/**
	 * Adds specified element to this collection
	 * 
	 * @memberOf Core.Types.Collection#
	 * @param {Core.Types.Object} element
	 * @type {Boolean}
	 */
	add: function(element) {
		if (!element || !Core.Types.Object.isInstance(element))
			throw new Error("No element specified or unexpected element type");
		if (!this._add(element))
			return false;
		if (this.contains(element)) {
			debug("Element already exists in collection: $ (object.__id__ = $)", [element, element.__id__]);
			return false;
		}
		this._table.push(element);
		this._size++;
		this._added(element);
		return true;
	},
	
	/**
	 * Checks if this collection contains element
	 * 
	 * @param {Core.Types.Object} element
	 * @type {Boolean}
	 */
	contains: function(element) {
		return this._find(element) !== -1;
	},
	
	/**
	 * Finds specified element in this collection and returns its index or -1 if element was not found.
	 * 
	 * @param {Core.Types.Object} element
	 * @type {Number}
	 */
	_find: function(element) {
		for (var i = 0; i < this._size; i++) {
			if (this._table[i].equals(element))
				return i;
		}
		return -1;
	},
	
	/**
	 * Removes specified element from this collection
	 * 
	 * @param {Core.Types.Object} element
	 * @type {Boolean}
	 */
	remove: function(element) {
		if (!element || !Core.Types.Object.isInstance(element))
			throw new Error("No element specified or unexpected element type");
		if (!this._remove(element))
			return false;
		var index = this._find(element);
		if (index === -1) {
			debug("Element does not exists in collection: $ (object.__id__ = $)", [element, element.__id__]);
			return false;
		}
		this._table.splice(index, 1);
		this._size--;
		this._removed(element);
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
	_remove: function(element) {
		return true;
	},
	
	/**
	 * @private
	 */
	_added: function(element) {
		
	},
	
	/**
	 * @private
	 */
	_removed: function(element) {
		
	},
	
	_isCollection: function(collection) {
		return (collection && Core.Lang.isClass(collection._class) && collection._class.getCollectionType());
	},
	
	/**
	 * Adds all elements of specified collection to this collection
	 * 
	 * @memberOf Core.Types.Collection#
	 * @param {Core.Types.Collection} collection
	 */
	addAll: function(collection) {
		if (!this._isCollection(collection))
			throw new Error("No collection specified or unknown collection type: " + collection);
		collection.addAllTo(this);
	},
	
	/**
	 * Adds all elements of this collection to specified collection
	 * 
	 * @memberOf Core.Types.Collection#
	 * @param {Core.Types.Collection} collection
	 */
	addAllTo: function(collection) {
		if (!this._isCollection(collection))
			throw new Error("No collection specified or unknown collection type: " + collection);
		for (var i = 0; i < this._size; i++) {
			collection.add(this._table[i]);
		}
	},
	
	/**
	 * Removes all elements of specified collection from this collection
	 * 
	 * @memberOf Core.Types.Collection#
	 * @param {Core.Types.Collection} collection
	 */
	removeAll: function(collection) {
		if (!this._isCollection(collection))
			throw new Error("No collection specified or unknown collection type: " + collection);
		collection.removeAllFrom(this);
	},
	
	/**
	 * Removes all elements of this collection from specified collection
	 * 
	 * @memberOf Core.Types.Collection#
	 * @param {Core.Types.Collection} collection
	 */
	removeAllFrom: function(collection) {
		if (!this._isCollection(collection))
			throw new Error("No collection specified or unknown collection type: " + collection);
		for (var i = 0; i < this._size; i++) {
			collection.remove(this._table[i]);
		}
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
	 * @type {Number}
	 */
	getSize: function() {
		return this._size;
	},
	
	/**
	 * Checks if this collection is empty
	 * 
	 * @memberOf Core.Types.Collection#
	 * @type {Boolean}
	 */
	isEmpty: function() {
		return this._size == 0;
	},
	
	/**
	 * Checks if this collection is not empty
	 * 
	 * @memberOf Core.Types.Collection#
	 * @type {Boolean}
	 */
	notEmpty: function() {
		return this._size != 0;
	},
	
	/**
	 * Returns first element of this collection
	 * 
	 * @memberOf Core.Types.Collection#
	 * @type {Object}
	 */
	first: function() {
		return (this._size == 0 ? null : this._table[0]);
	},
	
	/**
	 * Returns new collection containing elements from this collection matching specified filter
	 * 
	 * @see Core.Types.Filter
	 * @memberOf Core.Types.Collection#
	 * @param {Object} filter
	 * @type {Core.Types.Collection}
	 */
	filter: function(filter) {
		if (!filter) return this;
		var filtered = new Core.Types.Collection();
		filter = Core.Types.Filter.ensure(filter);
		for (var i = 0; i < this._size; i++) {
			var element = this._table[i];
			if (filter.check(element))
				filtered.add(element);
		}
		return filtered;
	}
},
{
	_collectionType: "collection"
});

/**
 * @class
 * @extends Core.Types.Collection
 */
Core.Types.Map = extend(Core.Types.Collection, {
	
	_keyDef: null,
	_keyFn: null,
	_map: null,
	
	/**
	 * Core.Types.Map constructor
	 * 
	 * @constructs
	 * @memberOf Core.Types.Map#
	 * @extends Core.Types.Collection
	 * @param {Object} params Specifies initial parameters: {@link Core.Types.Filter} filter, {@link Core.Types.Collection} collection
	 */
	create: function(params) {
		params = params || {};
		this._keyDef = params.key;
		this._keyFn = new Function("return " + this._keyDef + ";");
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
		this._map[key] = element;
	},
	
	/**
	 * @private
	 */
	_removed: function(element) {
		var key = this._keyFn.call(element);
		if (!key) {
			throw new Error("Key not found for: " + element + ", according to key definition: " + this._keyDef);
		}
		if (!this._map[key]) {
			debug("Key does not exisis in map: " + key);
		}
		delete this._map[key];
	},
	
	/**
	 * Returns an element for specified key
	 * 
	 * @memberOf Core.Types.Map#
	 * @param {Object} key
	 * @type {Object}
	 */
	get: function(key) {
		return key in this._map ? this._map[key] : undefined;
	},
	
	/**
	 * Returns full set of elements in this map regarding that multiple elements can match same key key definition.
	 * 
	 * @type {Core.Types.Collection}
	 */
	asSet: function() {
		var set = new Core.Types.Collection();
		for (var i = 0; i < this._size; i++) {
			set.add(this._table[i]);
		}
		return set;
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
},
{
	_collectionType: "map"
});

Core.Types.Filter = define(/** @lends Core.Types.Filter# */{
	
	_filter: null,

	/**
	 * Creates a new filter based on provided definition.
	 * Definition may be based on:
	 * - class as subclass of Core.Types.Object (e.g. new Filter(Ea.Element.Class)),
	 * - function returning boolean value (e.g. new Filter(function(element) {return element.getName() == 'ABC';})),
	 * - string containing function body (e.g. new Filter("this.getName() == 'ABC'")).
	 * 
	 * @constructs
	 * @param {Object} filter
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
	 * Checks if specified object matches this filter
	 * 
	 * @memberOf Core.Types.Filter#
	 * @param {Object} object
	 * @type {Boolean}
	 */
	check: function(object) {
		return this._filter ? this._filter.call(object) : true;
	}
});
