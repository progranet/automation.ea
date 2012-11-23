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
Html = {
		
	templates: {
		
	},
	
	params: {
		replace: {
			"\\r\\n": "<br>",
			"\\n\\r": "<br>",
			"<br>\\s*<br>": "<br>",
			"<br>\\s*<ul>": "<ul>",
			"<br>\\s*<li>": "<li>",
			"</li>\\s*<br>": "</li>",
			"</ul>\\s*<br>": "</ul>"
		}
	},
	
	_templateNamePattern: new RegExp("^<\\!--\\s*([\\w]+)\\s*-->\\s*$"),
	
	/**
	 * Initializes namespace
	 * 
	 * @memberOf Html
	 */
	initialize: function() {
		//eval(new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(scriptRoot + "Diff\\diff_match_patch_uncompressed.js", 1).ReadAll());
	},
	
	/**
	 * Loads HTML templates from specified file
	 * 
	 * @memberOf Html
	 * @param {Sys.IO.File|String} file File reference or path to file
	 * @param {?Object} context Namespace containing templates file
	 */
	loadTemplates: function(file, context) {
		if (typeof file == "string") {
			file = new Sys.IO.File(file, Sys.IO.Mode.READ, Sys.IO.Unicode.DEFAULT, context);
		}
		var templateName = null, template = "";
		while (!file.atEnd()) {
			var line = file.readLine();
			var newTemplate = Html._templateNamePattern.exec(line);
			if (newTemplate) {
				if (templateName) {
					Html.templates[templateName] = new Html.Template(templateName, template);
				}
				templateName = newTemplate[1];
				template = "";
			}
			else {
				template = template + "\n" + line;
			}
		}
		if (templateName) {
			Html.templates[templateName] = new Html.Template(templateName, template);
		}
	}
};

Html.Template = extend(Core.Types.Named, /** @lends Html.Template# */ {
	
	_template: null,

	/**
	 * @constructs
	 * @extends Core.Types.Named
	 * @param {String} name
	 * @param {String} template
	 */
	create: function(name, template) {
		_super.create(name);
		this._template = template;
	},
	
	/**
	 * Generates output using provided parameters
	 * 
	 * @memberOf Html.Template#
	 * @param {Object} params
	 * @returns {String}
	 */
	generate: function(params) {
		var generated = Core.Output.exec(this._template, params);
		for (var search in Html.params.replace) {
			var replace = Html.params.replace[search];
			generated = generated.replace(new RegExp(search, "g"), replace);
		}
		return generated;
	}
});
