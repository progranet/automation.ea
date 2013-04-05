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
		var elements = this._getElements().filter("this._getParent() == null");
		return elements.filter(filter);
	},
	
	createElement: function(name, type) {
		return this._createElement(name, type);
	},
	
	deleteElement: function(element) {
		return this._deleteElement(element);
	},
	
	getDiagrams: function(filter) {
		var diagrams = this._getDiagrams().filter("this._getParent() == null");
		return diagrams.filter(filter);
	},
	
	createDiagram: function(name, type) {
		return this._createDiagram(name, type);
	},
	
	deleteDiagram: function(elemediagramnt) {
		return this._deleteDiagram(element);
	},
	
	getParent: function() {
		return this._getParent();
	},
	
	setParent: function(parent) {
		return this._setParent(parent);
	}
},
{
	/**
	 * Determines the class of package based on source attributes values
	 * 
	 * @param {Ea._Base.Source} source
	 * @type {Class}
	 */
	determineType: function(source) {
		if (this._model.get(source))
			type = Ea.Package.Model;
		else
			type = Ea.Package.Package;
		return type;
	},
	
	/**
	 * Package id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	_id: property({api: "PackageID"}),

	/**
	 * Package guid
	 * 
	 * @readOnly
	 */
	_guid: property({api: "PackageGUID"}),

	/**
	 * Package alias
	 * 
	 * @readOnly
	 */
	_alias: property({api: "Alias"}),
	
	/**
	 * Package notes
	 */
	_notes: property({api: "Notes"}),
	
	/**
	 * Package flag properties
	 * 
	 * @private
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_flags: property({api: "Flags"}),

	/**
	 * Package controlled switch value
	 * 
	 * @type {Boolean}
	 */
	_controlled: property({api: "IsControlled"}),
	
	/**
	 * Package namespace switch value
	 * 
	 * @type {Boolean}
	 */
	_namespace: property({api: "IsNamespace"}),
	
	/**
	 * Package protected switch value
	 * 
	 * @type {Boolean}
	 */
	_protected: property({api: "IsProtected"}),
	
	/**
	 * Package version controlled switch value
	 * 
	 * @type {Boolean}
	 */
	_versionControlled: property({api: "IsVersionControlled"}),
	
	/**
	 * Package owner
	 */
	_owner: property({api: "Owner"}),
	
	/**
	 * XML path of package.
	 * Property is used in version control configurations.
	 */
	_xmlPath: property({api: "XMLPath"}),

	/**
	 * Package model switch value
	 * 
	 * @private
	 * @readOnly
	 * @type {Boolean}
	 */
	_model: property({api: "IsModel"}),
	
	/**
	 * Package version
	 */
	_version: property({api: "Version"}),
	
	/**
	 * Package creation date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_created: property({api: "Created"}),
	
	/**
	 * Package modification date
	 * 
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_modified: property({api: "Modified"}),
	
	/**
	 * Package position in tree model of project browser
	 * 
	 * @type {Number}
	 */
	_position: property({api: "TreePos"}),

	/**
	 * Element corresponding to package.
	 * This element is not visible in EA but it's holding almost all package properties .
	 * 
	 * @type {Ea.Element._Base}
	 * @aggregation composite
	 */
	___element: property({api: "Element"}),
	
	/**
	 * Package parent package
	 * 
	 * @private
	 * @type {Ea.Package._Base}
	 */
	__parent: property({api: "ParentID", referenceBy: "id"}),
	
	/**
	 * Package parent
	 * 
	 * @derived
	 * @type {Ea.Package._Base}
	 */
	_parent: property(),
	
	/**
	 * Package all elements
	 * 
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 * @aggregation composite
	 * @private
	 */
	__element: property({api: "Elements"}),
	
	/**
	 * Package elements.
	 * Collection is filtered to only elements owned by package without elements owned by sub-elements of package.
	 * 
	 * @derived
	 * @type {Core.Types.Collection<Ea.Element._Base>}
	 */
	_element: property(),

	/**
	 * Package all diagrams
	 * 
	 * @private
	 * @type {Ea.Collection._Base<Ea.Diagram._Base>}
	 * @aggregation composite
	 */
	__diagram: property({api: "Diagrams"}),
	
	/**
	 * Package diagrams.
	 * Collection is filtered to only diagrams owned by package without diagrams owned by sub-elements of package.
	 * 
	 * @derived
	 * @type {Core.Types.Collection<Ea.Diagram._Base>}
	 */
	_diagram: property(),
	
	/**
	 * Package sub-packages
	 * 
	 * @type {Ea.Collection._Base<Ea.Package._Base>}
	 * @aggregation composite
	 */
	_package: property({api: "Packages"})
});

Ea.Package.Package = extend(Ea.Package._Base);
Ea.Package.Model = extend(Ea.Package._Base);
