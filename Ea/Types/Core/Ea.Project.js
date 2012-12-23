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
Ea.Project = {};

Ea.Project._Base = extend(Ea.Types.Any, /** @lends Ea.Project._Base# */ {
	
	/**
	 * Returns specified GUID converted to XML format
	 * 
	 * @memberOf Ea.Project._Base#
	 * @param {String} guid
	 * @returns {String}
	 */
	guidToXml: function(guid) {
		return guid ? this._source.api.GUIDtoXML(guid) : null;
	},
	
	/**
	 * Saves diagram image to specified path
	 * 
	 * @param {Ea.Diagram._Base} diagram
	 * @param {String} path
	 */
	saveDiagram: function(diagram, path) {
		this._source.api.PutDiagramImageToFile(diagram.getXmlGuid(), path, 1);
	},
	
	/**
	 * Loads project from specified path (file).
	 * For unknown reason Repository interface has OpenFile, OpenFile2 methods, too.
	 * Those methods seems to be more complex (give possibility of specifying connection strings).
	 * 
	 * @see Ea.Repository._Base#open
	 * @param {String} path
	 */
	load: function(path) {
		this._source.api.LoadProject(path);
	}
	
},
{
	api: "Project"
});
