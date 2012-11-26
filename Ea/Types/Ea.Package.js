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
Ea.Package = {};

Ea.Package._Base = extend(Ea.Types.Namespace, {},
{
	api: "Package",
	
	getType: function(source) {
		if (this._model.get(source))
			type = Ea.Package.Model;
		else
			type = Ea.Package.Package;
		return type;
	},
	
	_id: attribute({api: "PackageID", type: Number, id: "id"}),
	_guid: attribute({api: "PackageGUID", id: "guid"}),

	_alias: attribute({api: "Alias"}),
	_notes: attribute({api: "Notes"}),

	_model: attribute({api: "isModel", private: true, type: Boolean}),
	
	_version: attribute({api: "Version"}),
	_created: attribute({api: "Created", type: Ea.DataTypes.Date}),
	_modified: attribute({api: "Modified", type: Ea.DataTypes.Date}),
	_position: attribute({api: "TreePos", type: Number}),

	_element: attribute({api: "Element", type: "Ea.Element._Base", aggregation: "shared"}),
	_parent: attribute({api: "ParentID", type: "Ea.Package._Base", referenceBy: "id"}),
	_elements: attribute({api: "Elements", type: "Ea.Collection._Base", elementType: "Ea.Element._Base", filter: "this._getParent() == null", aggregation: "composite"}),
	_diagrams: attribute({api: "Diagrams", type: "Ea.Collection._Base", elementType: "Ea.Diagram._Base", filter: "this._getParent() == null", aggregation: "composite"}),
	_packages: attribute({api: "Packages", type: "Ea.Collection._Base", elementType: "Ea.Package._Base", aggregation: "composite"})
});

Ea.Package.Package = extend(Ea.Package._Base);
Ea.Package.Model = extend(Ea.Package._Base);
