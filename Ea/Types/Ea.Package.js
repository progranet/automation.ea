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
Ea.Package = {
		meta: {
			id: "PackageID",
			guid: "PackageGUID",
			objectType: 5
		}
};

Ea.Package._Base = extend(Ea.Types.Namespace, {
	
	getElements: function(filter) {
		var elements = this._getElements().filter("this.getParent() == null");
		return elements.filter(filter);
	},
	
	createElement: function(name, type) {
		return this._createElement(name, type);
	},
	
	deleteElement: function(element) {
		return this._deleteElement(element);
	},
	
	getDiagrams: function(filter) {
		var diagrams = this._getDiagrams().filter("this.getParent() == null");
		return diagrams.filter(filter);
	},
	
	createDiagram: function(name, type) {
		return this._createDiagram(name, type);
	},
	
	deleteDiagram: function(elemediagramnt) {
		return this._deleteDiagram(element);
	},
	
	getNamespace: function() {
		return this.getParent();
	},
	
	setNamespace: function(namespace) {
		return this.setParent(namespace);
	}
},
{
	determineType: function(api) {
		if (this.getProperty("_model").getApiValue(api))
			type = Ea.Package.Model;
		else
			type = Ea.Package.Package;
		return type;
	}
},
{
	/**
	 * Package id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	id: {api: "PackageID"},

	/**
	 * Package guid
	 * 
	 * @readOnly
	 */
	guid: {api: "PackageGUID"},

	/**
	 * Package alias
	 * 
	 * @readOnly
	 */
	alias: {api: "Alias"},
	
	/**
	 * Package notes
	 */
	notes: {api: "Notes"},
	
	/**
	 * Package flag properties
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_flags: {api: "Flags"},

	/**
	 * Package controlled switch value
	 * 
	 * @type {Boolean}
	 */
	controlled: {api: "IsControlled"},
	
	/**
	 * Package namespace switch value
	 * 
	 * @private
	 * @type {Boolean}
	 */
	_namespace: {api: "IsNamespace"},
	
	/**
	 * Package protected switch value
	 * 
	 * @type {Boolean}
	 */
	protected: {api: "IsProtected"},
	
	/**
	 * Package version controlled switch value
	 * 
	 * @type {Boolean}
	 */
	versionControlled: {api: "IsVersionControlled"},
	
	/**
	 * Package owner
	 */
	owner: {api: "Owner"},
	
	/**
	 * XML path of package.
	 * Property is used in version control configurations.
	 */
	xmlPath: {api: "XMLPath"},

	/**
	 * Package model switch value
	 * 
	 * @private
	 * @readOnly
	 * @type {Boolean}
	 */
	_model: {api: "IsModel"},
	
	/**
	 * Package version
	 */
	version: {api: "Version"},
	
	/**
	 * Package creation date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	created: {api: "Created"},
	
	/**
	 * Package modification date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	modified: {api: "Modified"},
	
	/**
	 * Package position in tree model of project browser
	 * 
	 * @type {Number}
	 */
	position: {api: "TreePos"},

	/**
	 * Element corresponding to package.
	 * This element is not visible in EA but it's holding almost all package properties .
	 * 
	 * @type {Ea.Element._Base}
	 * @aggregation composite
	 */
	element: {api: "Element"},
	
	/**
	 * Named element namespace
	 * 
	 * @derived
	 * @type {Ea.Types.Namespace}
	 */
	namespace: {},

	/**
	 * Package parent package
	 * 
	 * @type {Ea.Package._Base}
	 */
	parent: {api: "ParentID", referenceBy: "id"},
	
	/**
	 * Package all elements
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 * @aggregation composite
	 */
	_elements: {api: "Elements"},
	
	/**
	 * Package elements.
	 * Collection is filtered to only elements owned by package without elements owned by sub-elements of package.
	 * 
	 * @derived
	 * @type {Core.Types.Collection<Ea.Element._Base>}
	 */
	elements: {},

	/**
	 * Package all diagrams
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.Diagram._Base>}
	 * @aggregation composite
	 */
	_diagrams: {api: "Diagrams"},
	
	/**
	 * Package diagrams.
	 * Collection is filtered to only diagrams owned by package without diagrams owned by sub-elements of package.
	 * 
	 * @derived
	 * @type {Core.Types.Collection<Ea.Diagram._Base>}
	 */
	diagrams: {},
	
	/**
	 * Package sub-packages
	 * 
	 * @type {Ea.Collection._Base<Ea.Package._Base>}
	 * @aggregation composite
	 */
	packages: {api: "Packages"}
});

Ea.Package.Package = extend(Ea.Package._Base);
Ea.Package.Model = extend(Ea.Package._Base);
