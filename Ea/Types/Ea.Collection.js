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

Ea.Collection._Base = extend(Core.Types.Collection, {},
{
	getType: function() {
		return Ea.Collection._Base;
	},

	getCollection: function(elementType, value) {
		var collection = new Array();
		for (var e = 0; e < value.Count; e++) {
			var api = value.GetAt(e);
			var proxy = Ea.get(elementType, api);
			collection.push(proxy);
		}
		return collection;
	},
	
	_get: function(api, params) {
		var source = new Ea.Helper.Source(api);
		var type = this.getType(source);
		var proxy = new type(null, params);
		proxy._source = source;
		for (var e = 0; e < api.length; e++) {
			var element = api[e];
			proxy.add(element);
		}
		return proxy;
	}
});

Ea.Collection.Map = extend(Core.Types.Map, {},
{
	getType: function() {
		return Ea.Collection.Map;
	},

	getCollection: function(elementType, value) {
		var collection = new Array();
		for (var e = 0; e < value.Count; e++) {
			var api = value.GetAt(e);
			var proxy = Ea.get(elementType, api);
			collection.push(proxy);
		}
		return collection;
	},
	
	_get: function(api, params) {
		var source = new Ea.Helper.Source(api);
		var type = this.getType(source);
		var proxy = new type(null, params);
		proxy._source = source;
		for (var e = 0; e < api.length; e++) {
			var element = api[e];
			proxy.add(element);
		}
		return proxy;
	}
});
