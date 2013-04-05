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

Ea.Collection = {
		meta: {
			objectType: 3
		}
};

Ea.Collection._Base = extend([Ea.Types.Any, Core.Types.AbstractCollection], {
	
	_elementType: null,
	_index: null,
	_size: 0,
	_table: null,
	
	/**
	 * Constructs Ea.Collection._Base
	 * 
	 * @param {Object} params params.elementType specify class of elements in this collection
	 */
	create: function(params) {
		_super.create();
		this._table = [];
		this._elementType = params.elementType;
		this._index = {};
	},

	_init: function() {
		var application = this._source.application;
		for (var e = 0; e < this.getSize(); e++) {
			var element = application.get(this._elementType, this._getAt(e));
			this._add(element);
		}
	},
	
	_add: function(element) {
		this._table.push(element);
		this._size++;
		this._index[element.__id__] = e;
		this._added(element);
	},
	
	_added: function(element) {
		
	},
	
	_create: function(name, type) {
		type = type || this._elementType;
		var elementTypeName =  type.determineEaType();
		var api = this._source.api.AddNew(name, elementTypeName);
		var element = this._source.application.createProxy(type, api);
		return element;
	},

	_delete: function(element) {
		var index = this._index[element.__id__];
		this._source.api.Delete(index);
	},
	
	/**
	 * Refreshes collection after modification
	 */
	refresh: function() {
		this._source.api.Refresh();
	},
	
	/**
	 * Adds all elements of this collection to specified collection
	 * 
	 * @param {Core.Types.Collection} collection
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
	 * @param {Core.Types.Collection} collection
	 */
	removeAllFrom: function(collection) {
		if (!Core.Types.AbstractCollection.isInstance(collection))
			throw new Error("No collection specified or unknown collection type: " + collection);
		for (var i = 0; i < this._size; i++) {
			collection.remove(this._table[i]);
		}
	},

	/**
	 * Collection iterator.
	 * 
	 * @param {Object} context
	 * @param {Function} fn
	 */
	forEach: function(context, fn) {
		for (var i = 0; i < this._size; i++) {
			if (fn.call(context, this._table[i], i)) break;
		}
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
	 * @see Core.Types.Filter
	 * 
	 * @param {Core.Types.Filter} filter
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
	},
	
	/**
	 * Returns size of collection
	 * 
	 * @type {Number}
	 */
	getSize: function() {
		return this._source.api.Count;
	},
	
	/**
	 * Returns element at specified index
	 * 
	 * @private
	 * @param {Number} index
	 * @type {Ea.Types.Any}
	 */
	_getAt: function(index) {
		return this._source.api.GetAt(index);
	}
},
{
	/**
	 * Determines the class of collection based on source attributes values
	 * 
	 * @param {Ea._Base.Source} source
	 * @type {Class}
	 */
	determineType: function(source) {
		return Ea.Collection._Base;
	},
	
	/**
	 * Processes original property value
	 * 
	 * @param {Ea.Collection._Base} value
	 * @param {Array} params Parameters (arguments) passed to getter. In this case params[0] specify collection filter
	 * @type {Core.Types.Collection}
	 */
	processValue: function(value, params) {
		return value.filter(params[0]);
	}
});

Ea.Collection.Map = extend([Ea.Collection._Base, Core.Types.AbstractMap], {
	
	_keyDef: null,
	_keyFn: null,
	_map: null,
	
	/**
	 * Constructs Ea.Collection.Map
	 * 
	 * @param {Object} params params.elementType specify class of elements in this collection
	 */
	create: function(params) {
		_super.create(params);
		params = params || {};
		this._keyDef = params.key;
		this._keyFn = new Function("return " + this._keyDef + ";");
		this._map = {};
	},
	
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
	/**
	 * Determines the class of map based on source attributes values
	 * 
	 * @param {Ea._Base.Source} source
	 * @type {Class}
	 */
	determineType: function(source) {
		return Ea.Collection.Map;
	}
});
