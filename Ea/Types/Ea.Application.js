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

Ea.Application._Base = extend(Ea.Types.Any, {
	
	_repository: null,
	cacheProperties: null,
	
	create: function(source, params) {
		source.application = this;
		_super.create(source);
		this.cacheProperties = params.cacheProperties === undefined ? true : params.cacheProperties;
		this._repository = Ea.Class.createProxy(this, Ea.Repository._Base, this._source.api.Repository, params);
	},
	
	/**
	 * @memberOf Ea.Application._Base#
	 * @type {Ea.Repository._Base}
	 */
	getRepository: function() {
		return this._repository;
	}
},
{
	meta: {
		api: "App"
	},

	/**
	 * @type {Ea.Project._Base}
	 */
	_project: property({api: "Project"}),

	/**
	 * @type {Boolean}
	 */
	_visible: property({api: "Visible"})
});

include("Ea.Project@Ea.Types");
include("Ea.Repository@Ea.Types");
