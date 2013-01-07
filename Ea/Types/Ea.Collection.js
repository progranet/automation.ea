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

Ea.Collection._Base = extend(Core.Types.Collection, {
	
	_elementType: null,
	//_index: null,
	
	create: function(source, params) {
		_super.create(params);
		this._source = source;
		this._elementType = params.elementType;
		//this._index = {};
		this._init(params);
	},
	
	_init: function(params) {
		var repository = this._source.application.getRepository();
		for (var e = 0; e < this._source.api.Count; e++) {
			var element = repository.get(this._elementType, this._source.api.GetAt(e));
			this.add(element);
			/*if (this.add(element))
				this._index[element.__id__] = e;*/
		}
	},
	
	_create: function(name, type, element) {
		type = type || this._elementType;
		var elementTypeName = type.elementType || type.namespace.meta.api;
		var api = this._source.api.AddNew(name, elementTypeName);
		if (element) {
			api.SupplierID = element.getId();;
		}
		api.Update();
		this._source.api.Refresh();
		var element = this._source.application.getRepository().get(type, api);
		//this.add(element);
		return element;
	},

	_delete: function(element) {
		//var api = element._source.api;
		//var index = this._index[element.__id__];
		this._source.api.Delete(index);
		this._source.api.Refresh();
		//this.remove(element);
	}
},
{
	determineType: function(source) {
		return Ea.Collection._Base;
	},
	
	processValue: function(value, params) {
		return value.filter(params[0]);
	}
});

Ea.Collection.Map = extend(Core.Types.Map, {
	create: function(source, params) {
		_super.create(params);
		this._source = source;
		this._elementType = params.elementType;
		this._init(params);
	},
	_init: function(params) {
		var repository = this._source.application.getRepository();
		for (var e = 0; e < this._source.api.Count; e++) {
			var element = repository.get(params.elementType, this._source.api.GetAt(e));
			this.add(element);
		}
	}
},
{
	determineType: function(source) {
		return Ea.Collection.Map;
	},
	
	processValue: function(value, params) {
		return value.filter(params[0]);
	}
});
