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

Ea.Properties = {
		meta: {
			objectType: 48
		}
};

Ea.Properties._Base = extend(Ea.Collection.Map, {
	_init: function(params) {
		var repository = this._source.application.getRepository();
		for (var e = 0; e < this._source.api.Count; e++) {
			var element = repository.get(params.elementType, this._source.api.Item(e));
			this.add(element);
		}
	}
},
{
	determineType: function(source) {
		return Ea.Properties._Base;
	}
});

include("Ea.Property@Ea.Types.Element.Property");
