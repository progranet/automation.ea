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

Ea.DiagramLink = {};

Ea.DiagramLink._Base = extend(Ea.View, {

	getDimension: function() {
		if (!this._dimension || Ea.mm) {
			var coords = this._getPath();
			if (coords) {
				var dimension = this._dimension = {
					right: 0,
					bottom: 0
				};
				var coordst = coords.split(";");
				for (var c = 0; c < coordst.length; c++) {
					if (coordst[c]) {
						var coord = coordst[c].split(":");
						dimension.left = dimension.left !== undefined ? Math.min(dimension.left, coord[0]) : coord[0];
						dimension.top = dimension.top !== undefined ? Math.min(dimension.top, -coord[1]) : -coord[1];
						dimension.right = Math.max(this.right, coord[0]);
						dimension.bottom = Math.max(this.bottom, -coord[1]);
					}
				}
			}
		}
		return this._dimension;
	}
},
{
	api: "DiagramLink",
	
	_id: new Ea.Helper.Property({api: "InstanceID", type: Number}),

	//_diagram: new Ea.Helper.ReferenceById({api: "DiagramID", type: "Ea.Diagram._Base"}),
	_connector: new Ea.Helper.ReferenceById({api: "ConnectorID", type: "Ea.Connector._Base"}),
	_path: new Ea.Helper.Property({api: "Path", private: true})
});
