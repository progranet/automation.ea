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

	create: function() {
		_super.create();
	},
	
	_init: function() {
		
	},
	
	/**
	 * Returns GUID of EA object in XML format
	 * 
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
	 * Determines proxy class based on EA API object.
	 * By default as proxy class is taken base class from package (Ea.[PackageName]._Base).
	 * Class can be determined also based on specific EA API properties values (such as Diagram.Type for Ea.Diagram._Base subclass or Package.IsModel for Ea.Package._Base subclass).
	 * 
	 * @param {Object} api
	 * @type {Core.Lang.Class}
	 */
	determineType: function(api) {
		return this.namespace._Base;
	},
	
	/**
	 * Determines EA API type name on creating API object.
	 * In some cases EA API object types require inner type name for creation of new objects (e.g. Element, Diagram, Connector).
	 * Proxy classes wrapping this specific types of EA API objects should be able of "translate" proxy subclass to EA inner type name (e.g. Ea.Element.Class conforms to API Element.Type == "Class").
	 * 
	 * @type {String}
	 */
	determineEaType: function() {
		return this.namespace.name;
	},
	
	_deriveType: function(api, property) {
		var typeName = property.getApiValue(api).replace(/[-\s]/g,"");
		var type = this.namespace[typeName] || this._createType(typeName);
		return type;
	},
	
	_createType: function(typeName) {
		if (typeName in this.namespace)
			throw new Error("Type already exists: $", [this.namespace[typeName]]);
		this.namespace[typeName] = Core.Lang.extend(this.namespace, typeName, this.namespace._Base);
		warn("Not implemented type: $.$", [this.namespace.qualifiedName, typeName]);
		return this.namespace[typeName];
	}
});

Ea.Types.NamedElement = extend(Ea.Types.Any, {

	_toString: function() {
		return this.getName() + " " + _super._toString();
	},
	
	getNamespace: function() {
		return this._namespace;
	},
	
	getQualifiedName: function() {
		var namespace = this.getNamespace();
		qualifiedName = (namespace ? namespace.getQualifiedName() + "." : "") + this.getName();
		return qualifiedName;
	}
}, 
{},
{
	/**
	 * Named element name
	 */
	name: {api: "Name"},

	/**
	 * Named element namespace
	 * 
	 * @readOnly
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},
	
	/**
	 * Named element qualified name 
	 * 
	 * @readOnly
	 * @derived
	 */
	qualifiedName: {}
});

Ea.Types.Namespace = extend(Ea.Types.NamedElement);
