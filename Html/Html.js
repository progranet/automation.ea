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
	
	_templateNamePattern: new RegExp("^<\\!--\\s*([\\w\\-]+)\\s*-->\\s*$"),

	_dom: null,
	
	/**
	 * Initializes namespace
	 */
	initialize: function() {
		//eval(new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(scriptRoot + "Diff\\diff_match_patch_uncompressed.js", 1).ReadAll());
		this._dom = new ActiveXObject("MSXML2.DOMDocument");
		this._dom.validateOnParse = false;
		this._dom.async = false;
		var xml = "<node></node>";
		var parsed = this._dom.loadXML(xml);
		if (!parsed)
			throw new Error("Error parsing XHTML file " + xml + ":" + this._dom.parseError.reason);
	},
	
	/**
	 * Loads HTML templates from specified file
	 * 
	 * @param {Sys.IO.File} file File reference or path to file (string)
	 * @param {Object} context Namespace containing templates file
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
					Html.templates[templateName] = new Html.Template(templateName, template.replace(/[\r\n]+$/, "").replace(/^[\r\n]+/, ""));
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
	},
	
	/**
	 * Loads XHTML templates from specified file
	 * 
	 * @param {Sys.IO.File} file File reference or path to file (string)
	 * @param {Object} context Namespace containing templates file
	 * @param {Map<String, Function>} extensions
	 */
	loadXTemplates: function(file, context, extensions) {
		if (typeof file == "string") {
			file = new Sys.IO.File(file, Sys.IO.Mode.READ, Sys.IO.Unicode.DEFAULT, context);
		}
		var xml = file.readAll();
		var dom = new ActiveXObject("MSXML2.DOMDocument");
		dom.validateOnParse = false;
		dom.async = false;
		var parsed = dom.loadXML(xml);
		if (!parsed)
			throw new Error("Error parsing XHTML file " + file.getName() + ":" + dom.parseError.reason);
		
		var template = new Html.XTemplate("", dom, null, extensions);
		file.close();
		return template;
	}
};

Html.Template = extend(Core.Types.Named, {
	
	_template: null,

	/**
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
	 * @param {Object} params
	 * @type {String}
	 */
	generate: function(params) {
		var generated = Core.Output.exec(this._template, params, Html.templates);
		for (var search in Html.params.replace) {
			var replace = Html.params.replace[search];
			generated = generated.replace(new RegExp(search, "g"), replace);
		}
		return generated;
	}
});

Html.XTemplate = extend(Core.Types.Named, {
	
	_dom: null,
	_extensions: null,
	parent: null,
	name: null,
	context: null,
	templates: null,
	
	/**
	 * @param {IXMLDOMElement} dom XHTML DOM element defining this template
	 * @param {Html.XTemplate} parent parent template if any
	 * @param {Map<String, Function>} extensions template extensions
	 */	
	create: function(name, dom, parent, extensions) {
		
		this._dom = dom;
		this._extensions = extensions || {};
		this.parent = parent;
		this.name = name;

		_super.create(name);
		
		this.context = {
			$: (parent ? parent.context : null)
		};
		this.templates = {};
		
		var template = this;
		var findTemplates = function(node) {
			var children = node.childNodes;
			var templateNodes = [];
			for (var n = 0; n < children.length; n++) {
				var child = children[n];
				if (child.nodeTypeString == "element") {
					if (child.nodeName == "ea:template") {
						var attributes = template._prepareAttributes(child.attributes, "ea");
						var name = attributes.ea.name;
						var childTemplate = new Html.XTemplate(name, child, template);
						template.templates[name] = childTemplate;
						templateNodes.push(child);
					}
					else {
						findTemplates(child);
					}
				}					
			}
			for (var t = 0; t < templateNodes.length; t++) {
				node.removeChild(templateNodes[t]);
			}
		};
		findTemplates(dom);
	},
	
	_prepareAttributes: function(attributes, tagNs) {
		var attrs = {
			ea: {}
		};
		for (var a = 0; a < attributes.length; a++) {
			var name = attributes[a].name;
			var ns = tagNs || "_default";
			var parts = name.split(":");
			if (parts.length == 2) {
				name = parts[1];
				ns = parts[0];
			}
			if (!(ns in attrs))
				attrs[ns] = {};
			attrs[ns][name] = unescape(attributes[a].value);
		}
		return attrs;
	},
	
	/**
	 * @param {String} name
	 * @type {Function}
	 */
	_findExtension: function(name) {
		var extension = this._extensions[name];
		if (!extension) {
			if (this.parent)
				extension = this.parent._findExtension(name);
			else
				extension = null;
		}
		return extension;
	},
	
	/**
	 * @param {Sting} name Template name
	 * @type {Html.XTemplate}
	 */
	findTemplate: function(name) {
		var template = this.templates[name];
		if (!template) {
			if (this.parent)
				template = this.parent.findTemplate(name);
			else
				template = null;
		}
		return template;
	},
	
	/**
	 * Generates output using provided parameters
	 * 
	 * @param {Object} params
	 * @param {Html.IO.File} output
	 * @type {String}
	 */
	generate: function(params, output) {
		
		params = params || [];
		var generated = "";
		
		var generate = function(string, mode) {
			var isContect = (mode == Html.IO.ProcessContentMode.CONTENT);
			if (isContect) {
				if (output.processing.trimContent)
					string = string.trim();
				mode = output.processing.processContentAs;
			}
			switch (mode) {
			case Html.IO.ProcessContentMode.RAW:
				break;
			case Html.IO.ProcessContentMode.XML:
				var textNode = Html._dom.createTextNode(string);
				string = textNode.xml;
				break;
			case Html.IO.ProcessContentMode.ATTRIBUTE:
				var attribute = Html._dom.createAttribute("a");
				attribute.value = string;
				var xml = attribute.xml;
				string = xml.substring(3, xml.length - 1);
				break;
			case Html.IO.ProcessContentMode.HTML:
				var dom = new ActiveXObject("MSXML2.DOMDocument");
				dom.validateOnParse = false;
				dom.async = false;
				var xml = "<html xmlns=\"http://www.w3.org/TR/REC-html40\">" + string + "</html>";
				var parsed = dom.loadXML(xml);
				if (!parsed)
					throw new Error("Error parsing XHTML file " + xml + ":" + dom.parseError.reason);
				var content = dom.documentElement.childNodes;
				xml = dom.documentElement.xml;
				xml = xml.substring(xml.indexOf(">") + 1, xml.lastIndexOf("<"));
				string = xml;
				break;
			default:
				throw new Error("Unsupported mode: " + mode);
			}
			if (isContect && string) {
				var filter = output.processing.filterContent;
				if (filter) {
					for (var f = 0; f < filter.length; f++)
						string = filter[f].call(string);
				}
			}
			output.writeString(string);
		};
		
		var template = this;
		var buildRt = function(context) {
			var rt = {};
			var ct2rt = function(ct) {
				for (var name in ct) {
					if (name != "$" && !(name in rt))
						rt[name] = ct[name];
				}
				if (ct.$ != null) {
					ct2rt(ct.$);
				}
			};
			ct2rt(context);
			return rt;
		};
		var unescape = function(text) {
			return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
		};
		var processScript = function(script, context) {
			var rt = buildRt(context);
			eval("var fn = function(" + Core.Utils.getNames(rt).join(", ") + ") {return " + script + ";}");
			var result;
			try {
				result = fn.apply(null, Core.Utils.getValues(rt));
			}
			catch (error) {
				throw new Error("Evaluation error: '" + error.message + "', script: '" + script + "'");
			}
			return result;
		};
		var processText = function(text, context) {
			var s = text.indexOf("{{");
			var e = text.indexOf("}}");
			if (s != -1 && e != -1) {
				return text.substring(0, s) + processScript(text.substring(s + 2, e), context) + processText(text.substring(e + 2), context);
			}
			else {
				return text;
			}
		};
		var generateAttributes = function(attributes, ns, context) {
			for (var name in attributes) {
				var qName = (ns ? ns + ":" : "") + name;
				if (qName != "xmlns:ea") {
					var value = processText(attributes[name], context);
					generate(" " + qName + "=\"", Html.IO.ProcessContentMode.RAW);
					generate(value, Html.IO.ProcessContentMode.ATTRIBUTE);
					generate("\"", Html.IO.ProcessContentMode.RAW);
				}
			}
		};
		var SCRIPT = 0,
			IGNORE = 1,
			NAME = 2,
			TEMPLATE = 3,
			EXTENSION = 4;
		var prepareAttributes = function(attributes, tag, context, types) {
			var result = {};
			for (var name in attributes) {
				if (name in types) {
					var type = types[name];
					switch (type) {
					case IGNORE:
						break;
					case SCRIPT:
						result[name] = processScript(attributes[name], context);
						break;
					case NAME:
						result[name] = attributes[name];
						break;
					case TEMPLATE:
						var included = template.findTemplate(attributes[name]);
						if (!included)
							throw new Error("Unknown template: " + attributes[name]);
						result[name] = included;
						break;
					case EXTENSION:
						var extension = template._findExtension(attributes[name]);
						result[name] = extension;
						break;
					default:
						throw new Error("Unknown attribute type: " + type);
					}
				}
				else
					throw new Error("Unknown attribute: " + name + " for tag: " + tag);
			}
			return result;
		};
		var findContext = function(context, name) {
			if (name in context)
				return context;
			if (context.$)
				return findContext(context.$, name);
			return null;
		};
		var generateNodes = function(nodes, context, contextTag, constraints, params) {
			for (var n = 0; n < nodes.length; n++) {
				var node = nodes[n];
				generateNode(node, context, contextTag, constraints, params);
			}
		};
		var generateNode = function(node, context, contextTag, constraints, params) {
			var nodeType = node.nodeTypeString;
			switch (nodeType) {
			case "element":
				var name = node.nodeName;
				var qName = name;
				if (constraints) {
					if (constraints.allow.indexOf(qName) == -1)
						throw new Error("Tag: " + qName + " is not allowed in context of: " + contextTag);
					if (constraints.process.indexOf(qName) == -1)
						return;
				}
				var ns = "";
				var parts = name.split(":");
				if (parts.length == 2) {
					name = parts[1];
					ns = parts[0];
				}
				var attributes = template._prepareAttributes(node.attributes, ns);
				var rendered = attributes.ea.rendered;
				if (!rendered) {
					rendered = true;
				}
				else {
					rendered = processScript(rendered, context);
					if (typeof(result) == "string")
						result = (result.toLowerCase() == "true");
				}
				if (rendered) {
					var children = node.childNodes;
					if (ns == "ea") {
						switch (name) {
						case "template":
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								name: IGNORE,
								rendered: IGNORE
							});
							generateNodes(children, context, qName);
							break;
						case "include":
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								template: TEMPLATE,
								rendered: IGNORE
							});
							var included = attrs.template;
							var includeParams = {};
							generateNodes(children, context, qName, {allow:["ea:param"],process:["ea:param"]}, includeParams);
							output.write(included, includeParams);
							break;
						case "param":
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								name: NAME,
								value: SCRIPT,
								rendered: IGNORE
							});
							if (params) {
								params[attrs.name] = attrs.value;
							}
							else {
								throw new Error("Param tag used in wrong context: " + contextTag || "root");
							}
							break;
						case "extension":
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								name: EXTENSION,
								rendered: IGNORE
							});
							var extensionParams = {};
							generateNodes(children, context, qName, {allow:["ea:param"],process:["ea:param"]}, extensionParams);
							var passedParams = {};
							for (var name in extensionParams) {
								passedParams[name] = extensionParams[name];
							}
							attrs.name.call(null, output, template, extensionParams);
							for (var name in passedParams) {
								var value = extensionParams[name];
								context[name] = value;
							}
							break;
						case "var":
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								name: NAME,
								value: SCRIPT,
								rendered: IGNORE
							});
							context[attrs.name] = attrs.value;
							break;
						case "for":
							context = {
								$: context
							};
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								"var": NAME,
								"in": SCRIPT,
								index: NAME,
								key: NAME,
								rendered: IGNORE
							});
							var collection = attrs["in"];
							var variableName = attrs["var"];
							var indexName = attrs.index;
							var keyName = attrs.key;
							if (typeof(collection) == "object") {
								if (collection instanceof Array) {
									for (var index = 0; index < collection.length; index++) {
										if (variableName)
											context[variableName] = collection[index];
										if (indexName)
											context[indexName] = index;
										generateNodes(children, context, qName);
									}
								}
								else if (Core.Types.AbstractCollection.isInstance(collection)) {
									var index = 0;
									collection.forEach(function(element) {
										if (variableName)
											context[variableName] = element;
										if (indexName)
											context[indexName] = index;
										generateNodes(children, context, qName);
										index++;
									});
								}
								else {
									var index = 0;
									for (var key in collection) {
										if (variableName)
											context[variableName] = collection[key];
										if (indexName)
											context[indexName] = index;
										if (keyName)
											context[keyName] = key;
										generateNodes(children, context, qName);
										index++;
									}
								}
							}
							else {
								throw new Error(collection + " is not a collection: " + typeof(collection));
							}
							break;
						case "html":
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								content: SCRIPT,
								rendered: IGNORE
							});
							generate(attrs.content, Html.IO.ProcessContentMode.HTML);
							break;
						case "raw":
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								content: SCRIPT,
								rendered: IGNORE
							});
							generate(attrs.content, Html.IO.ProcessContentMode.RAW);
							break;
						case "tag":
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								name: SCRIPT,
								rendered: IGNORE
							});
							generate("<" + attrs.name, Html.IO.ProcessContentMode.RAW);
							generateNodes(children, context, qName, {allow:["ea:attribute", "ea:content"],process:["ea:attribute"]});
							generate(">", Html.IO.ProcessContentMode.RAW);
							generateNodes(children, context, qName, {allow:["ea:attribute", "ea:content"],process:["ea:content"]});
							generate("</" + attrs.name + ">", Html.IO.ProcessContentMode.RAW);
							break;
						case "attribute":
							if (contextTag != "ea:tag")
								throw new Error("Tag: " + qName + " used in wrong context: " + contextTag || "root");
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								name: SCRIPT,
								value: SCRIPT,
								rendered: IGNORE
							});
							generate(" " + attrs.name + "=\"", Html.IO.ProcessContentMode.RAW);
							generate(attrs.value, Html.IO.ProcessContentMode.ATTRIBUTE);
							generate("\"", Html.IO.ProcessContentMode.RAW);
							break;
						case "content":
							context = {
								$: context
							};
							var attrs = prepareAttributes(attributes.ea, qName, context, {
								rendered: IGNORE
							});
							generateNodes(children, context, qName);
							break;
						default:
							throw new Error("Unknown EA tag: " + name);
						}
					}
					else {
						generate("<" + qName, Html.IO.ProcessContentMode.RAW);
						for (var ns in attributes) {
							if (ns != "ea") {
								generateAttributes(attributes[ns], (ns == "_default" ? null : ns), context);
							}
						}
						if (children.length == 0 && ["br"].indexOf(qName) != -1) {
							generate("/>", Html.IO.ProcessContentMode.RAW);
						}
						else {
							generate(">", Html.IO.ProcessContentMode.RAW);
							generateNodes(children, context, qName);
							generate("</" + qName + ">", Html.IO.ProcessContentMode.RAW);
						}
					}
				}
				break;
			case "document":
				var children = node.childNodes;
				generateNodes(children, context);
				break;
			case "processinginstruction":
				if (node.nodeName == "ea") {
					var rest = node.text.replace(/\s*([a-z_][a-z0-9_\-]*)="([^"]*)\s*"/gi, function(whole, name, value) {
						switch (name) {
						case "process-content-as":
							var processContentAs = Html.IO.ProcessContentMode[value.toUpperCase()];
							if (processContentAs == null)
								throw new Error("Unsupported content processing mode: " + value.toUpperCase());
							output.processing.processContentAs = processContentAs;
							break;
						case "trim-content":
							output.processing.trimContent = (value.toLowerCase() == "true");
							break;
						case "filter-content":
							if (value) {
								value = new Function("return " + value + ";");
								if (!output.processing.filterContent)
									output.processing.filterContent = [];
								output.processing.filterContent.push(value);
							}
							else {
								output.processing.filterContent = null;
							}
							break;
						default:
							throw new Error("Unsupported processing instruction: " + name);
						}
					});
					if (rest)
						throw new Error("Syntax error in processing instruction at: " + rest);
				}
				else {
					generate("<?" + node.nodeName + " " + node.text + "?>", Html.IO.ProcessContentMode.RAW);
				}
				break;
			case "documenttype":
				generate(node.xml, Html.IO.ProcessContentMode.RAW);
				break;
			case "comment":
				generate(processText(node.xml, context), Html.IO.ProcessContentMode.RAW);
				break;
			case "cdatasection":
				generate(processText(node.xml, context), Html.IO.ProcessContentMode.RAW);
				break;
			case "text":
				generate(processText(unescape(node.nodeValue), context), Html.IO.ProcessContentMode.CONTENT);
				break;
			default:
				throw new Error("Unsupported tag type: " + nodeType);
			}
		};
		var h = {};
		for (var name in params) {
			h[name] = this.context[name];
			this.context[name] = params[name];
		}
		generateNode(this._dom, this.context);
		for (var name in params) {
			this.context[name] = h[name];
		}		
		return generated;
	}
});
