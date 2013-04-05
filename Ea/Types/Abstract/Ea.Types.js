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

Ea.Types.Any = define({
	
	_init: function() {
		
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
	
	/**
	 * @private
	 * @type {String}
	 */
	_toString: function() {
		return "[" + this._class + "]";
	},
	
	/**
	 * Updates this object after its state change
	 */
	update: function() {
		this._source.api.Update();
		this._source.application.cache(this);
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
	 * Determines EA API type name on creating API object
	 * 
	 * @type {String}
	 */
	determineEaType: function() {
		return this.namespace.name;
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

Ea.Types.Named = extend(Ea.Types.Any, {

	getParent: function() {
		return null;
	},
	
	setParent: function(parent) {
		// TODO: check for covering in specialization tree
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
			ea = this._source.application.getByGuid(type, ea);
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
	/**
	 * Object name
	 */
	_name: property({api: "Name"}),

	/**
	 * Object parent
	 * 
	 * @readOnly
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	_parent: property(),
	
	/**
	 * Object qualified name 
	 * 
	 * @readOnly
	 * @derived
	 */
	_qualifiedName: property()
});

Ea.Types.Namespace = extend(Ea.Types.Named);
