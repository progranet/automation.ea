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
	replace: {
		
	},
	_templateNamePattern: new RegExp("^<\\!--\\s*([\\w]+)\\s*-->\\s*$"),
	
	initialize: function() {
		for (var search in Html.params.replace) {
			Html.replace[search] = Html.params.replace[search];
		}
		//eval(new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(scriptRoot + "Diff\\diff_match_patch_uncompressed.js", 1).ReadAll());
	},
	
	loadTemplates: function(file, context) {
		if (typeof file == "string") {
			file = new Core.IO.File(file, Core.IO.mode.read, Core.IO.unicode._default, context);
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

Html.Template = extend(Core.Types.Named, {
	
	_template: null,

	create: function(name, template) {
		_super.create(name);
		this._template = template;
	},
	
	generate: function(params) {
		var generated = Core.Output.exec(this._template, params);
		for (var search in Html.replace) {
			var replace = Html.replace[search];
			generated = generated.replace(new RegExp(search, "g"), replace);
		}
		return generated;
	}
});
