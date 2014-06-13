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
Ea.Application = {
		
	meta: {},
		
	/**
	 * Creates new EA application
	 * 
	 * @param {Object} params Specifies parameters of application: params.path - path in the file system
	 * @type {Ea.Application._Base}
	 */
	createApplication: function(params) {
		var application = new Ea.Application._Base(params);
		// initializes caches with all stereotypes available in project
		application.getRepository().getProjectStereotypes();
		return application;
	}
};

Ea.Application._Base = extend(Ea.Types.Any, {
	
	_repository: null,
	_cacheId: null,
	_cacheGuid: null,
	_cacheStats: null,
	
	/**
	 * Constructs Ea.Application._Base
	 * 
	 * @param {Object} params Specifying params.path allows for automatically open repository file or connection path
	 */
	create: function(params) {
		
		_super.create(params);
		
		params = params || {};

		var api = params.path ? new ActiveXObject("EA.App") : App;
		this._source = new Ea._Base.Class.Source(this, api);
		
		this._cacheId = new Array(Ea.OBJECT_TYPES_NUMBER);
		this._cacheGuid = new Array(Ea.OBJECT_TYPES_NUMBER);
		this._cacheStats = new Array(Ea.OBJECT_TYPES_NUMBER + 1);
		for (var ot = 0; ot <= Ea.OBJECT_TYPES_NUMBER; ot++) {
			if (ot != Ea.OBJECT_TYPES_NUMBER) {
				this._cacheId[ot] = [];
				this._cacheGuid[ot] = {};
			}
			this._cacheStats[ot] = {
					cwi: 0,
					cwg: 0,
					cri: 0,
					crgi: 0,
					crg: 0,
					crgg: 0,
					
					tr: 0,
					trg: 0,
					trgi: 0,
					trgg: 0,
					trgig: 0,
					trggg: 0,
					
					tw: 0,
					twi: 0,
					twg: 0,
					cwi: 0,
					cwg: 0
				};
		}
		
		this._repository = this.wrapProxy(Ea.Repository._Base, this._source.api.Repository, params);
		if (params.path)
			this._repository.open(params.path);
	},
	
	/**
	 * Provides information about cache utilization
	 */
	cacheInfo: function() {
		var stats = {};
		var g = this._cacheStats[Ea.OBJECT_TYPES_NUMBER];
		for (var objectType = 0; objectType <= Ea.OBJECT_TYPES_NUMBER; objectType++) {
			var type = Ea._objectTypes[objectType];
			if (!type && objectType != Ea.OBJECT_TYPES_NUMBER)
				continue;
			var s = this._cacheStats[objectType];
			stats[objectType != Ea.OBJECT_TYPES_NUMBER ? type.namespace : "TOTAL"] = {
					"total read from get": s.trg,
					"total read by id from get": s.trgig,
					"total read by guid from get": s.trggg,
					"total read by id": s.trgi,
					"total read by guid": s.trgg,
					"cache read by id": s.cri,
					"cache read by id from get": s.crgi,
					"cache read by guid": s.crg,
					"cache read by guid from get": s.crgg,
					"cache white by id": s.cwi,
					"cache white by guid": s.cwg
				};
			for (var n in g) {
				g[n] = (objectType != Ea.OBJECT_TYPES_NUMBER) ? (g[n] + s[n]) : 0;
			}
		}
		info("cache stats: $", [JSON.stringify(stats, null, '\t')]);
	},
	
	/**
	 * Wipes proxy object from caches
	 * 
	 * @param {Ea.Types.Any} object
	 */
	wipe: function(object) {
		var type = object._class;
		var meta = type.namespace.meta;
		this._cacheStats[meta.objectType].tw++;
		if (meta.id) {
			this._cacheStats[meta.objectType].twi++;
			var id = object.getId();
			var proxy = this._cacheId[meta.objectType][id];
			if (proxy) {
				this._cacheStats[meta.objectType].cwi++;
				delete this._cacheId[meta.objectType][id];
			}
		}
		if (meta.guid) {
			this._cacheStats[meta.objectType].twg++;
			var guid = object.getGuid();
			var proxy = this._cacheGuid[meta.objectType][guid];
			if (proxy) {
				this._cacheStats[meta.objectType].cwg++;
				delete this._cacheId[meta.objectType][guid];
			}
		}
	},
	
	/**
	 * Returns proxy object for specified type and EA API object
	 * 
	 * @param {Core.Lang.Class} type
	 * @param {Object} api
	 * @param {Object} params Parameters forwarded to proxy constructor
	 * @type {Ea.Types.Any}
	 */
	get: function(type, api, params) {
		var meta = type.namespace.meta;
		this._cacheStats[meta.objectType].trg++;
		if (meta.id) {
			this._cacheStats[meta.objectType].trgig++;
			var id = api[meta.id];
			var proxy = this._cacheId[meta.objectType][id];
			if (proxy) {
				this._cacheStats[meta.objectType].crgi++;
				return proxy;
			}
		}
		else if (meta.guid) {
			this._cacheStats[meta.objectType].trggg++;
			var guid = api[meta.guid];
			var proxy = this._cacheGuid[meta.objectType][guid];
			if (proxy) {
				this._cacheStats[meta.objectType].crgg++;
				return proxy;
			}
		}
		return this.wrapProxy(type, api, params);
	},
	
	/**
	 * Returns proxy object for specified type and id
	 * 
	 * @param {Core.Lang.Class} type
	 * @param {Number} id
	 * @param {Object} params Parameters forwarded to proxy constructor
	 * @type {Ea.Types.Any}
	 */
	getById: function(type, id, params) {
		if (!id || id == 0)
			return null;
		var meta = type.namespace.meta;
		this._cacheStats[meta.objectType].trgi++;
		var proxy = this._cacheId[meta.objectType][id];
		if (proxy) {
			this._cacheStats[meta.objectType].cri++;
			return proxy;
		}
		var method = "Get" + type.namespace.name + "ByID";
		var api;
		// EA ElementID integrity problem
		try {
			api = this._repository._source.api[method](id);
		}
		catch (e) {
			warn("$ not found by Id = $", [type, id]);
			return null;
		}
		return this.wrapProxy(type, api, params);
	},
	
	/**
	 * Returns proxy object for specified type and guid
	 * 
	 * @param {Core.Lang.Class} type
	 * @param {String} guid
	 * @param {Object} params Parameters forwarded to proxy constructor
	 * @param {Boolean} cacheOnly Specify that getter should operate on application cache only without calling EA API Repository.Get...ByGuid method
	 * @type {Ea.Types.Any}
	 */
	getByGuid: function(type, guid, params, cacheOnly) {
		var meta = type.namespace.meta;
		this._cacheStats[meta.objectType].trgg++;
		var proxy = this._cacheGuid[meta.objectType][guid];
		if (proxy) {
			this._cacheStats[meta.objectType].crg++;
			return proxy;
		}
		if (cacheOnly)
			return null;
		var method = "Get" + type.namespace.name + "ByGuid";
		var api = null;
		try {
			var api = this._repository._source.api[method](guid);
		}
		catch (error) {
			warn("$ not found by Guid = $", [type, guid]);
			return null;
		}
		if (!api) {
			warn("$ not found by Guid = $", [type, guid]);
			return null;
		}
		return this.wrapProxy(type, api, params);
	},
	
	/**
	 * Wraps specified EA API object in proxy
	 * 
	 * @param {Core.Lang.Class} baseType
	 * @param {Object} api
	 * @param {Object} params
	 * @type {Ea.Types.Any}
	 */
	wrapProxy: function(baseType, api, params) {
		var type = baseType.determineType(api);
		var proxy = new type(params || {});
		proxy._source = new Ea._Base.Class.Source(this, api);
		proxy._init();
		this._cache(proxy);
		return proxy;
	},
	
	/**
	 * Creates proxy object for newly created EA API object
	 * 
	 * @param {Core.Lang.Class} baseType
	 * @param {Object} api
	 * @type {Ea.Types.Any}
	 */
	createProxy: function(baseType, api) {
		var proxy = new baseType({});
		proxy._source = new Ea._Base.Class.Source(this, api);
		return proxy;
	},
	
	_cache: function(object) {
		var meta = object._class.namespace.meta;
		var api = object._source.api;
		if (meta.id) {
			this._cacheId[meta.objectType][api[meta.id]] = object;
			this._cacheStats[meta.objectType].cwi++;
		}
		if (meta.guid) {
			this._cacheGuid[meta.objectType][api[meta.guid]] = object;
			this._cacheStats[meta.objectType].cwg++;
		}
		return object;
	},

	/**
	 * Caches new proxy object
	 * 
	 * @param {Ea.Types.Any} object
	 */
	cache: function(object) {
		
		if (!object._source._transient)
			return;
		
		if (object._source.creator) {
			object._source.creator.collection.refresh();
			delete object._source.creator;
		}
				
		for (var ti = 0; ti < object._source._transient.length; ti++) {
			var _transient = object._source._transient[ti];
			for (var propertyName in _transient._class._properties) {
				var property = _transient._class.getProperty(propertyName);
				property.refresh(_transient);
			}
		}
		delete object._source._transient;
		
		return this._cache(object);
	},
	
	/**
	 * Returns repository for this application
	 * 
	 * @type {Ea.Repository._Base}
	 */
	getRepository: function() {
		return this._repository;
	}
}, 
{},
{
	/**
	 * Application project
	 * 
	 * @readOnly
	 * @type {Ea.Project._Base}
	 */
	project: {api: "Project"},

	/**
	 * Application repository
	 * 
	 * @readOnly
	 * @derived
	 * @type {Ea.Repository._Base}
	 */
	repository: {},

	/**
	 * Application visibility switch value
	 * 
	 * @type {Boolean}
	 */
	visible: {api: "Visible"}
});

include("Ea.Project@Ea.Types");
include("Ea.Repository@Ea.Types");
