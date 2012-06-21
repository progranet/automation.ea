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

Ea.Properties = {};

Ea.Properties._Base = extend(Ea.Collection._Base, {},
{
	getType: function() {
		return Ea.Properties._Base;
	},

	_get: function(api, params) {
		var proxy = Ea.Any._createProxy.call(this, api, params);
		for (var e = 0; e < api.Count; e++) {
			var element = Ea.get(params.elementType, api.Item(e));
			proxy.add(element);
		}
		return proxy;
	}
	
});

Ea.register("Ea.Property@Ea.Types.Element.Property", 49);
