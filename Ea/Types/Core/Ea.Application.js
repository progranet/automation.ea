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
	
	_active: null,
	_default: "_default",
	_applications: {},
	
	create: function(params) {
		var name = params.name || this._default;
		var app = params.path ? new ActiveXObject("EA.App") : App;
		this._applications[name] = {
			application: Ea.Class.createProxy(Ea.Application._Base, app),
			project: Ea.Class.createProxy(Ea.Project._Base, app.Project),
			repository: Ea.Class.createProxy(Ea.Repository._Base, app.Repository, {syntax: params.syntax})
		};
		if (params.path)
			this._applications[name].project.load(params.path);
	},
	
	activate: function(name) {
		name = name || this._default;
		this._active = name;
	},
	
	isActivated: function() {
		return this._active != null;
	},
	
	getApplication: function(name) {
		if (name) {
			var application = this._applications[name];
			return application ? application.application : null;
		}
		if (!this.isActivated())
			return null;
		return this._applications[this._active].application;
	},
	
	getRepository: function(name) {
		if (name) {
			var application = this._applications[name];
			return application ? application.repository : null;
		}
		if (!this.isActivated())
			return null;
		return this._applications[this._active].repository;
	},

	getProject: function(name) {
		if (name) {
			var application = this._applications[name];
			return application ? application.project : null;
		}
		if (!this.isActivated())
			return null;
		return this._applications[this._active].project;
	}
};

Ea.Application._Base = extend(Ea.Types.Any, {}, {
	api: "App",
	_project: attribute({api: "Project", type: "Ea.Project._Base"}),
	_repository: attribute({api: "Repository", type: "Ea.Repository._Base"}),
	_visible: attribute({api: "Visible", type: Boolean})
});

Ea.register("Ea.Project@Ea.Types.Core", 1);
Ea.register("Ea.Repository@Ea.Types.Core", 2);
