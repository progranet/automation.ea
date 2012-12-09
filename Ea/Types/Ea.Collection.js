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

Ea.Collection = {};

Ea.Collection._Base = extend(Core.Types.Collection, {
	create: function(source, params) {
		_super.create(params);
		this._source = source;
		this._init(params);
	},
	_init: function(params) {
		var api = this._source.getApi();
		var repository = this._source.getApplication().getRepository();
		for (var e = 0; e < api.Count; e++) {
			var element = repository.get(params.elementType, api.GetAt(e));
			this.add(element);
		}
	}
},
{
	getType: function() {
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
		this._init(params);
	},
	_init: function(params) {
		var api = this._source.getApi();
		var repository = this._source.getApplication().getRepository();
		for (var e = 0; e < api.Count; e++) {
			var element = repository.get(params.elementType, api.GetAt(e));
			this.add(element);
		}
	}
},
{
	getType: function() {
		return Ea.Collection.Map;
	},
	
	processValue: function(value, params) {
		return value.filter(params[0]);
	}
});
