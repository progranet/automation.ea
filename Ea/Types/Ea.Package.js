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

Ea.Package = {};

Ea.Package._Base = extend(Ea.Namespace, {
	
	// TODO usun¹æ
	_pi: null,
	count: function(pi) {
		pi = pi || 1;
		this._pi = pi;
		Ea.Package.count = Math.max(Ea.Package.count, pi++);
		this.getPackages().forEach(function(package) {
			pi = package.count(pi);
		});
		return pi;
	},
	
	getProgressIndicator: function() {
		return this._pi;
	}
},
{
	api: "Package",
	
	getType: function(source) {
		if (this._model.get(source))
			type = Ea.Package.Model;
		else
			type = Ea.Package.Package;
		return type;
	},
	
	_id: new Ea.Helper.Property({api: "PackageID", type: Number}),
	_guid: new Ea.Helper.Property({api: "PackageGUID"}),
	_model: new Ea.Helper.Property({api: "isModel", private: true, type: Boolean}),
	
	_version: new Ea.Helper.Property({api: "Version"}),
	_created: new Ea.Helper.Property({api: "Created", type: Core.Types.Date}),
	_modified: new Ea.Helper.Property({api: "Modified", type: Core.Types.Date}),

	_element: new Ea.Helper.Reference({api: "Element"}),
	_parent: new Ea.Helper.ReferenceById({api: "ParentID", type: "Ea.Package._Base"}),
	_elements: new Ea.Helper.Collection({api: "Elements", elementType: "Ea.Element._Base", filter: "this._getParent() == null"}),
	_diagrams: new Ea.Helper.Collection({api: "Diagrams", elementType: "Ea.Diagram._Base", filter: "this._getParent() == null"}),
	_packages: new Ea.Helper.Collection({api: "Packages", elementType: "Ea.Package._Base"})
});

Ea.Package.Package = extend(Ea.Package._Base);
Ea.Package.Model = extend(Ea.Package._Base);
