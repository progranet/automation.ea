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

include("Sys@Sys");
include("Sys.IO@Sys");

/**
 * @namespace
 */
Html.IO = {};

Html.IO.File = extend(Sys.IO.File, /** @lends Html.IO.File# */ {
	
	/**
	 * @constructs
	 * @extends Sys.IO.File
	 * @param {String} path
	 */
	create: function(path) {
		_super.create(path);
	},
	
	/**
	 * Writes string to output HTML according to specified template and provided parameters
	 * 
	 * @memberOf Html.IO.File#
	 * @param {Html.Template} template
	 * @param {Object} params
	 */
	write: function(template, params) {
		if (typeof template == "string") {
			info(template);
			template = Html.templates[template];
		}
		_super.write(template.generate(params));
	}
});

