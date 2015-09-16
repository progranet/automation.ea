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
	qualifiedName: {},
	
	/**
	 * Element guid in XML form
	 * 
	 * @readOnly
	 * @derived
	 */
	xmlGuid: {}	
});

Ea.Types.Namespace = extend(Ea.Types.NamedElement);
