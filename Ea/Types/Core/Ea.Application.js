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
Ea.Application = {};

Ea.Application._Base = extend(Ea.Types.Any, /** @lends Ea.Application._Base# */ {}, {
	api: "App",
	_project: attribute({api: "Project", type: "Ea.Project._Base"}),
	_repository: attribute({api: "Repository", type: "Ea.Repository._Base"}),
	_visible: attribute({api: "Visible", type: Boolean})
});

Ea.register("Ea.Project@Ea.Types.Core", 1);
Ea.register("Ea.Repository@Ea.Types.Core", 2);
