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
	
	/**
	 * Returns all elements in this package
	 * 
	 * @param {Core.Types.Filter} filter Optional output collection filter
	 * @type {Core.Types.Collection}
	 */
	getElements: function(filter) {
		var elements = this._getElements().filter("this._getParent() == null");
		return elements.filter(filter);
	},
	
	/**
	 * Creates new element in this package
	 * 
	 * @param {String} name
	 * @param {Class} type
	 * @type {Ea.Types.Any}
	 */
	createElement: function(name, type) {
		var element = this._createElement(name, type);
		return element;
	},
	
	/**
	 * Returns all diagrams in this package
	 * 
	 * @param {Core.Types.Filter} filter Optional output collection filter
	 * @type {Core.Types.Collection}
	 */
	getDiagrams: function(filter) {
		var diagrams = this._getDiagrams().filter("this._getParent() == null");
		return diagrams.filter(filter);
	},
	
	/**
	 * Returns parent of this package - nesting package
	 * 
	 * @type {Ea.Types.Namespace}
	 */
	getParent: function() {
		return this._getParent();
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
	 * @type {Number}
	 */
	_id: property({api: "PackageID"}),

	_guid: property({api: "PackageGUID"}),

	_alias: property({api: "Alias"}),
	
	_notes: property({api: "Notes"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Map}
	 */
	_flags: property({api: "Flags"}),

	/**
	 * @type {Boolean}
	 */
	_controlled: property({api: "IsControlled"}),
	
	/**
	 * @type {Boolean}
	 */
	_namespace: property({api: "IsNamespace"}),
	
	/**
	 * @type {Boolean}
	 */
	_protected: property({api: "IsProtected"}),
	
	/**
	 * @type {Boolean}
	 */
	_versionControlled: property({api: "IsVersionControlled"}),
	
	_owner: property({api: "Owner"}),
	
	_xmlPath: property({api: "XMLPath"}),

	/**
	 * @type {Boolean}
	 * @private
	 */
	_model: property({api: "IsModel"}),
	
	_version: property({api: "Version"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_created: property({api: "Created"}),
	
	/**
	 * @type {Ea._Base.DataTypes.Date}
	 */
	_modified: property({api: "Modified"}),
	
	/**
	 * @type {Number}
	 */
	_position: property({api: "TreePos"}),

	/**
	 * @type {Ea.Element._Base}
	 * @aggregation composite
	 */
	___element: property({api: "Element"}),
	
	/**
	 * @type {Ea.Package._Base}
	 * @private
	 */
	__parent: property({api: "ParentID", referenceBy: "id"}),
	
	/**
	 * @type {Ea.Package._Base}
	 * @derived
	 */
	_parent: property(),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Element._Base>}
	 * @aggregation composite
	 * @private
	 */
	__element: property({api: "Elements"}),
	
	/**
	 * @type {Core.Types.Collection<Ea.Element._Base>}
	 * @derived
	 */
	_element: property(),

	/**
	 * @type {Ea.Collection._Base<Ea.Diagram._Base>}
	 * @aggregation composite
	 * @private
	 */
	__diagram: property({api: "Diagrams"}),
	
	/**
	 * @type {Core.Types.Collection<Ea.Diagram._Base>}
	 * @derived
	 */
	_diagram: property(),
	
	/**
	 * @type {Ea.Collection._Base<Ea.Package._Base>}
	 * @aggregation composite
	 */
	_package: property({api: "Packages"})
});

Ea.Package.Package = extend(Ea.Package._Base);
Ea.Package.Model = extend(Ea.Package._Base);
