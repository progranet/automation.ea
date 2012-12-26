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

/**
 * @namespace
 */
Ea.Application = {};

Ea.Application._Base = extend(Ea.Types.Any, /** @lends Ea.Application._Base# */ {
	
	_repository: null,
	
	create: function(source, params) {
		source.application = this;
		_super.create(source);
		var cacheObjects = params.cacheObjects === undefined ? true : params.cacheObjects;
		var cacheProperties = cacheObjects ? (params.cacheProperties === undefined ? true : params.cacheProperties) : false;
		this._repository = Ea.Class.createProxy(this, Ea.Repository._Base, this._source.api.Repository, {
			cacheObjects: cacheObjects,
			cacheProperties: cacheProperties
		});
	},
	
	getRepository: function() {
		return this._repository;
	}
},
{
	api: "App",

	_repository: derived({getter: "getRepository", type: "Ea.Repository._Base"}),
	
	_project: attribute({api: "Project", type: "Ea.Project._Base"}),
	_visible: attribute({api: "Visible", type: Boolean})
});

Ea.register("Ea.Project@Ea.Types.Core", 1);
Ea.register("Ea.Repository@Ea.Types.Core", 2);
