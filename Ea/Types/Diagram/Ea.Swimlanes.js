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

Ea.Swimlanes = {
		meta: {
			objectType: 51
		}
};

Ea.Swimlanes._Base = extend(Ea.Collection.Map, {
	
	/**
	 * Returns element at specified index
	 * 
	 * @private
	 * @param {Number} index
	 * @type {Ea.Types.Any}
	 */
	_getAt: function(index) {
		return this._source.api.Items(index);
	}
},
{
	determineType: function(api) {
		return this.namespace._Base;
	}
});

include("Ea.Swimlane@Ea.Types.Diagram");
