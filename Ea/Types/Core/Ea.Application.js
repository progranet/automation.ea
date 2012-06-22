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

Ea.Application = {
	
	_default: "_default",
	_active: null,
	_applications: {},
	
	create: function(name, path) {
		var app = path ? new ActiveXObject("EA.App") : App;
		this._applications[name] = {
			application: Ea.Application._Base._get(app),
			project: Ea.Project._Base._get(app.Project),
			repository: Ea.Repository._Base._get(app.Repository)
		};
		if (path)
			this._applications[name].project.load(path);
	},
	
	activate: function(name) {
		this._active = name;
	},
	
	activateDefault: function() {
		this.activate(this._default);
	},
	
	initializeDefault: function() {
		this.create(this._default);
		this.activateDefault();
	},
	
	getApplication: function() {
		return this._applications[this._active].application;
	},
	
	getRepository: function() {
		return this._applications[this._active].repository;
	},

	getProject: function() {
		return this._applications[this._active].project;
	}
};

Ea.Application._Base = extend(Ea.Any, {}, {
	api: "App",
	_project: new Ea.Helper.Reference({api: "Project", type: "Ea.Project._Base"}),
	_repository: new Ea.Helper.Reference({api: "Repository", type: "Ea.Repository._Base"}),
	_visible: new Ea.Helper.Property({api: "Visible", type: Boolean})
});

Ea.register("Ea.Project@Ea.Types.Core", 1);
Ea.register("Ea.Repository@Ea.Types.Core", 2);
