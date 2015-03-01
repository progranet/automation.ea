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
	
	/**
	 * Constructs Ea.Collection._Base
	 * 
	 * @param {Object} params params.elementType specify class of elements in this collection
	 */
	create: function(params) {
		_super.create(params);
		this._table = [];
		this._elementType = params.elementType;
		this._index = {};
	},

	_init: function() {
		var application = this._source.application;
		for (var e = 0; e < this.getSize(); e++) {
			var element = application.get(this._elementType, this._getAt(e));
			this._add(element);
			this._index[element.__id__] = e;
		}
	},
	
	_add: function(element) {
		this._table.push(element);
		this._size++;
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
		if (index == null)
			return false;
		this._source.api.Delete(index);
		return true;
	},
	
	/**
	 * Refreshes collection after modification
	 */
	refresh: function() {
		this._source.api.Refresh();
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

Ea.Collection.Map = extend([Ea.Collection._Base, Core.Types.AbstractMap], {
	
	/**
	 * Constructs Ea.Collection.Map
	 * 
	 * @param {Object} params params.elementType specify class of elements in this collection
	 */
	create: function(params) {
		_super.create(params);
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
},
{
	_deriveTypeName: function() {
		return "Map";
	}
});
