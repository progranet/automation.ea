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

Core.Types = {

	_id: 0,
	
	/**
	 * @private
	 */
	_getId: function() {
		return Core.Types._id++;
	}
};

Core.Types.Object = define({
	
	/**
	 * Core.Types.Object constructor
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
	 * @param {Core.Lang.Class} _class
	 * @type {Boolean}
	 */
	instanceOf: function(_class) {
		return this._class.conformsTo(_class);
	},
	
	/**
	 * Checks if this object matches specified filter
	 * 
	 * @see Core.Types.Filter
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
	},
	
	/**
	 * @type {String}
	 */
	toString: function() {
		return this._toString();
	}	
},
{
	_deriveTypeName: function() {
		return "_Base";
	},
	
	/**
	 * Class initialization 
	 */
	initialize: function() {

	}
});

Core.Types.Named = extend(Core.Types.Object, {
	
	_name: null,
	
	/**
	 * Core.Types.Named constructor
	 * 
	 * @param {String} name
	 */
	create: function(name) {
		_super.create();
		this._name = name;
	},
	
	/**
	 * Returns this name
	 * 
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

Core.Types.AbstractCollection = extend(Core.Types.Object, {
	
	_size: 0,
	_table: null,

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
	 * Returns JScript Array object
	 * 
	 *  @type {Array}
	 */
	toArray: function() {
		//var array = [];
		//array.push(this._table);
		return [].concat(this._table);
	},
	
	/**
	 * Finds specified element in this collection and returns its index or -1 if element was not found.
	 * 
	 * @param {Any} element
	 * @type {Number}
	 */
	_find: function(element) {
		var isNative = !Core.Types.Object.isInstance(element);
		for (var i = 0; i < this._size; i++) {
			var e = this._table[i];
			if (Core.Types.Object.isInstance(e)) {
				if (!isNative && e.equals(element))
					return i;
			}
			else {
				if (isNative && e === element)
					return i;
			}
		}
		return -1;
	},
	
	/**
	 * Returns collection size.
	 * 
	 * @type {Number}
	 */
	getSize: function() {
		return this._size;
	},
	
	/**
	 * Checks if this collection is empty
	 * 
	 * @type {Boolean}
	 */
	isEmpty: function() {
		return this._size == 0;
	},
	
	/**
	 * Checks if this collection is not empty
	 * 
	 * @type {Boolean}
	 */
	notEmpty: function() {
		return this._size != 0;
	},
	
	/**
	 * Returns first element of this collection
	 * 
	 * @type {Object}
	 */
	first: function() {
		return (this._size == 0 ? null : this._table[0]);
	},
	
	/**
	 * Returns new collection containing elements from this collection matching specified filter
	 * 
	 * @see Core.Types.Filter
	 * @param {Object} filter
	 * @type {Core.Types.Collection<Core.Types.Object>}
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
	},
	
	/**
	 * Returns new collection containing elements collected from this collection matching specified expression
	 * 
	 * @param {Object} expression
	 * @type {Core.Types.Collection<Core.Types.Object>}
	 */
	collect: function(expression) {
		if (!expression) return this;
		var selected = new Core.Types.Collection();
		if (typeof expression == "string")
			expression = new Function("return " + expression);
		for (var i = 0; i < this._size; i++) {
			var element = this._table[i],
				collected;
			try {
				collected = expression.call(element);
			}
			catch (error) {
				warn(error.message);
			}
			if (collected)
				selected.add(collected);
			else
				warn("Expression evaluated to null for: " + element);
		}
		return selected;
	},
	
	/**
	 * Adds all elements of this collection to specified collection
	 * 
	 * @param {Core.Types.Collection<Core.Types.Object>} collection
	 */
	addAllTo: function(collection) {
		if (!Core.Types.AbstractCollection.isInstance(collection))
			throw new Error("No collection specified or unknown collection type: " + collection);
		for (var i = 0; i < this._size; i++) {
			collection.add(this._table[i]);
		}
	},
	
	/**
	 * Removes all elements of this collection from specified collection
	 * 
	 * @param {Core.Types.Collection<Core.Types.Object>} collection
	 */
	removeAllFrom: function(collection) {
		if (!Core.Types.AbstractCollection.isInstance(collection))
			throw new Error("No collection specified or unknown collection type: " + collection);
		for (var i = 0; i < this._size; i++) {
			collection.remove(this._table[i]);
		}
	}	
});

Core.Types.Collection = extend(Core.Types.AbstractCollection, {

	/**
	 * Core.Types.Collection constructor
	 * 
	 * @param {Object} params Specifies initial parameters: {@link Core.Types.Filter} filter, {@link Core.Types.Collection} collection
	 */
	create: function(params) {
		params = params || {};
		this._table = [];
		
		if (params.collection) {
			this.addAll(params.collection);
		}
		else if (params.array) {
			for (var i = 0; i < params.array.length; i++) {
				this.add(params.array[i]);
			}
		}
		else if (params.map) {
			for (var name in params.map) {
				this.add(params.map[name]);
			}
		}
	},
	
	/**
	 * Adds specified element to this collection
	 * 
	 * @param {Any} element
	 * @type {Boolean}
	 */
	add: function(element) {
		if (!element)
			throw new Error("No element specified");
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
	 * Removes specified element from this collection
	 * 
	 * @param {Any} element
	 * @type {Boolean}
	 */
	remove: function(element) {
		if (!element)
			throw new Error("No element specified");
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
	
	/**
	 * Adds all elements of specified collection to this collection
	 * 
	 * @param {Core.Types.Collection<Core.Types.Object>} collection
	 */
	addAll: function(collection) {
		if (!Core.Types.AbstractCollection.isInstance(collection))
			throw new Error("No collection specified or unknown collection type: " + collection);
		collection.addAllTo(this);
	},
	
	/**
	 * Removes all elements of specified collection from this collection
	 * 
	 * @param {Core.Types.Collection<Core.Types.Object>} collection
	 */
	removeAll: function(collection) {
		if (!Core.Types.AbstractCollection.isInstance(collection))
			throw new Error("No collection specified or unknown collection type: " + collection);
		collection.removeAllFrom(this);
	},
	
	/**
	 * Collection iterator.
	 * 
	 * @param {Object} context
	 * @param {Function} fn Callback function
	 */
	forEach: function(context, fn) {
		for (var i = 0; i < this._size; i++) {
			if (fn.call(context, this._table[i], i)) break;
		}
	}	
});

Core.Types.AbstractMap = extend(Core.Types.AbstractCollection, {
	
	_keyDef: null,
	_keyFn: null,
	_map: null,
	
	/**
	 * Returns an element for specified key
	 * 
	 * @param {Object} key
	 * @type {Object}
	 */
	get: function(key) {
		return key in this._map ? this._map[key] : undefined;
	},
	
	/**
	 * Returns full set of elements in this map regarding that multiple elements can match same key key definition.
	 * 
	 * @type {Core.Types.Collection<Core.Types.Object>}
	 */
	asSet: function() {
		var set = new Core.Types.Collection();
		for (var i = 0; i < this._size; i++) {
			set.add(this._table[i]);
		}
		return set;
	}

});

Core.Types.Map = extend([Core.Types.Collection, Core.Types.AbstractMap], {

	/**
	 * Core.Types.Map constructor
	 * 
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
		if (key in this._map) {
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
		if (!(key in this._map)) {
			debug("Key does not exisis in map: " + key);
		}
		delete this._map[key];
	},
	
	/**
	 * Map iterator.
	 * 
	 * @param {Object} context
	 * @param {Function} fn Callback function
	 */
	forEach: function(context, fn) {
		for (var key in this._map) {
			if (fn.call(context, this._map[key], key)) break;
		}
	}
	
});

Core.Types.Filter = extend(Core.Types.Object, {
	
	_filter: null,

	/**
	 * Creates a new filter based on provided definition.
	 * Definition may be based on:
	 * - class as subclass of Core.Types.Object (e.g. new Filter(Ea.Element.Class)),
	 * - function returning boolean value (e.g. new Filter(function(element) {return element.getName() == 'ABC';})),
	 * - string containing function body (e.g. new Filter("this.getName() == 'ABC'")).
	 * 
	 * @param {Object} filter
	 */
	create: function(filter) {
		_super.create();
		if (filter) {
			if (Core.Lang.isClass(filter))
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
	 * @param {Object} object
	 * @type {Boolean}
	 */
	check: function(object) {
		return this._filter ? this._filter.call(object) : true;
	}
},
{
	/**
	 * Ensures that specified object is instance of Core.Types.Filter, if not creates it based on provided specification (@link Core.Types.Filter.create)
	 * 
	 * @param {Object} object
	 * @type {Core.Types.Filter}
	 */
	ensure: function(object) {
		return this.isInstance(object) ? object : new this(object);
	}	
});
