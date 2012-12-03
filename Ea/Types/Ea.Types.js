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
	
	/**
	 * Creates new abstraction layer wrapper for Enterprise Architect API object
	 * 
	 * @constructs
	 * @extends Core.Types.Object
	 * @param {Object} api EA API object
	 */
	create: function(api) {
		_super.create();
	},
	
	/**
	 * Returns GUID of EA object in XML format
	 * 
	 * @memberOf Ea.Types.Any#
	 * @returns {String}
	 */
	getXmlGuid: function() {
		return Ea.Application.getApplication().getProject().guidToXml(this.getGuid());
	},
	
	toString: function() {
		return this._toString();
	},
	
	/**
	 * @private
	 * @returns {String}
	 */
	_toString: function() {
		return "[" + this._class + "]";
	}
}, 
{
	/**
	 * Recognizes class of EA object from source
	 * 
	 * @memberOf Ea.Types.Any
	 * @param {Object} source
	 * @returns {Class}
	 */
	getType: function(source) {
		return this.namespace._Base;
	},
	
	/**
	 * @private
	 */
	_deriveType: function(source, attribute) {
		var typeName = attribute.get(source).replace(/[-\s]/g,"");
		var type = this.namespace[typeName] || Ea.addType(this.namespace, typeName);
		return type;
	},
	
	/**
	 * Initializes EA Class
	 */
	initialize: function() {
		Ea.Class.registerClass(this);
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
	 * @returns {Ea.Types.Namespace}
	 */
	getParent: function() {
		return null;
	},
	
	/**
	 * Checks if named is part of namespace (directly or indirectly)
	 * 
	 * @memberOf Ea.Types.Named#
	 * @param {Ea.Types.Namespace} namespace
	 * @returns {Boolean}
	 */
	hasParent: function(namespace) {
		var parent = this.getParent();
		if (!parent) return false;
		namespace = Ea.ensure(Ea.Package._Base, namespace);
		return (parent == namespace ? namespace : parent.hasParent(namespace));
	},
	
	_toString: function() {
		return this.getName() + " " + _super._toString();
	},
	
	_qualifedName: null,

	/**
	 * Returns qualified name of named including namespace
	 * 
	 * @memberOf Ea.Types.Named#
	 * @returns {String}
	 */
	getQualifiedName: function() {
		if (!this._qualifedName || Ea.mm) {
			var parent = this.getParent();
			this._qualifedName = (parent ? parent.getQualifiedName() + "." : "") + this.getName();
		}
		return this._qualifedName;
	}
	
},
{
	/**
	 * @property {String} _name
	 * @memberOf Ea.Types.Named
	 */
	_name: attribute({api: "Name"}),

	/**
	 * @property {Ea.Types.Namespace} __parent
	 * @memberOf Ea.Types.Named
	 */
	__parent: derived({getter: "getParent", type: "Ea.Types.Namespace"}),
	
	/**
	 * @property {String} _qualifiedName
	 * @memberOf Ea.Types.Named
	 */
	_qualifiedName: derived({getter: "getQualifiedName"})
});

/**
 * @constructor
 * @extends Ea.Types.Named
 */
Ea.Types.Namespace = extend(Ea.Types.Named);
