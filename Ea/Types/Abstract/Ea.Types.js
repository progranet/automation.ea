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
Ea.Types = {};

Ea.Types.Any = define(/** @lends Ea.Types.Any# */{
	
	_source: null,
	
	/**
	 * Creates new abstraction layer wrapper for Enterprise Architect API object
	 * 
	 * @constructs
	 * @extends Core.Types.Object
	 * @param {Object} api EA API object
	 */
	create: function(source) {
		_super.create();
		this._source = source;
	},
	
	/**
	 * Returns GUID of EA object in XML format
	 * 
	 * @memberOf Ea.Types.Any#
	 * @type {String}
	 */
	getXmlGuid: function() {
		return this._source.application.getProject().guidToXml(this.getGuid());
	},
	
	toString: function() {
		return this._toString();
	},
	
	/**
	 * @private
	 * @type {String}
	 */
	_toString: function() {
		return "[" + this._class + "]";
	},
	
	update: function() {
		var api = this._source.api;
		api.Update();
	}
	
}, 
{
	/**
	 * Recognizes class of EA object from source
	 * 
	 * @memberOf Ea.Types.Any
	 * @param {Object} source
	 * @type {Class}
	 */
	determineType: function(source) {
		return this.namespace._Base;
	},
	
	/**
	 * @private
	 */
	_deriveType: function(source, attribute) {
		var typeName = attribute.get(source).replace(/[-\s]/g,"");
		var type = this.namespace[typeName] || this._createType(typeName);
		return type;
	},
	
	/**
	 * @private
	 */
	_createType: function(typeName) {
		if (typeName in this.namespace)
			throw new Error("Type already exists: $", [this.namespace[typeName]]);
		this.namespace[typeName] = Core.Lang.extend(this.namespace, typeName, this.namespace._Base);
		warn("Not implemented type: $.$", [this.namespace.qualifiedName, typeName]);
		return this.namespace[typeName];
	},
	
	/**
	 * Initializes EA Class
	 */
	initialize: function() {
		Ea._Base.Class.registerClass(this);
	}
});

/**
 * @constructor
 * @extends Ea.Types.Any
 */
Ea.Types.Named = extend(Ea.Types.Any, {

	/**
	 * Returns namespace of this element
	 * 
	 * @memberOf Ea.Types.Named#
	 * @type {Ea.Types.Namespace}
	 */
	getParent: function() {
		return null;
	},
	
	/**
	 * Checks if named is part of namespace (directly or indirectly)
	 * 
	 * @memberOf Ea.Types.Named#
	 * @param {Ea.Types.Namespace} namespace
	 * @type {Boolean}
	 */
	hasParent: function(namespace) {
		var parent = this.getParent();
		if (!parent) return false;
		namespace = this._ensure(Ea.Package._Base, namespace);
		return (parent == namespace ? namespace : parent.hasParent(namespace));
	},
	
	_ensure: function(type, ea) {
		if (typeof ea == "string" && this.isGuid(ea))
			ea = this._source.application.getRepository().getByGuid(type, ea);
		return ea;
	},
	
	_toString: function() {
		return this.getName() + " " + _super._toString();
	},
	
	/**
	 * Returns qualified name of named including namespace
	 * 
	 * @memberOf Ea.Types.Named#
	 * @type {String}
	 */
	getQualifiedName: function() {
		var parent = this.getParent();
		qualifiedName = (parent ? parent.getQualifiedName() + "." : "") + this.getName();
		return qualifiedName;
	}
	
},
{
	_name: property({api: "Name"}),

	/**
	 * @type {Ea.Types.Namespace}
	 * @derived
	 */
	_parent: property(),
	
	/**
	 * @derived
	 */
	_qualifiedName: property()
});

/**
 * @constructor
 * @extends Ea.Types.Named
 */
Ea.Types.Namespace = extend(Ea.Types.Named);
