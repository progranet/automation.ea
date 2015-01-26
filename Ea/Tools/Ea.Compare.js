
include("Html@Html");
include("Html.IO@Html");
include("Ea@Ea");
include("Bpmn@Extension.Bpmn");
include("Word@Ms");
load("diff_match_patch_uncompressed@External");

/**
 * @namespace
 */
Ea.Compare = {
	
	params: {
		styleSheet: "style.css",
		template: "template.docx",
		
		idFn: function() {
			if (this.instanceOf(Ea.Diagram._Base))
				return this.getName();
			else
				return this.getAlias() || this.getName();
		},

		diagramMaxWidth: 900,
		diagramMaxHeight: 600,
		reuseDiagrams: false,
		collections: {}
	},
	
	idFn: [
	{
		type: Ea._Base.Relationship,
		fn: [function() {
			var to = this.getTo();
			var toType = to._class.getName();
			var stereotype = this.getConnector().getStereotype();
			var connectorType = this.getConnector()._class.getName();
			
			var desc = "", relationDesc;
			if (relationDesc = Ea.Compare.params.Relations[connectorType]) {
				desc = desc + relationDesc[this.isClient() ? 0 : 1];
			}
			else {
				desc = desc + (stereotype ? "&lt;&lt;" + stereotype + "&gt;&gt; " : "") + "[" + connectorType + "] " + this.getRelation();
			}
			return desc;
		},
		function() {
			var to = this.getTo();
			if (to.instanceOf(Ea.Element.Note)) {
				return to.getNotes();
			}
			else {
				var name = Ea.Compare.params.idFn.call(to);
				return "<a href=\"#" + to.getXmlGuid().substring(5) + "\">" + (name ? name + " " : "") + "[" + to._class.getName() + "]</a>";
			}
		}]
	},
	{
		type: Ea.Tag._Base,
		fn: [function() {
			return this.getName();
		},
		function() {
			return this.getValue();
		}]
	},
	{
		type: Ea.Types.Any,
		fn: function() {
			var desc = " <a href=\"#" + this.getXmlGuid().substring(5) + "\">" + Ea.Compare.params.idFn.call(this) + "</a>";
			return desc;
		}
	}],
	
	
	initialize: function() {
		Html.loadTemplates("template.html", this);
	},
	
	execute: function(params) {

		this.act = Ea.initializeDefaultApplication(params);

		info("=== BEGIN ===");

		this.old = Ea.Application.createApplication({
			path: this.params.old
		});
		this.diff = new diff_match_patch();

		Sys.IO.createFolder(this.params.outputRoot);
		Sys.IO.createFolder(this.params.outputRoot + "/diagrams");
		Sys.IO.copy(this.params.styleSheet, this.params.outputRoot, this);

		for (var name in this.params.dynamic) {
			var colDef = this.params.dynamic[name];
			if (typeof(colDef.select) == "string")
				colDef.select = new Function("return " + colDef.select + ";");
			if (typeof(colDef.name) == "string")
				colDef.name = new Function("element", "return " + colDef.name + ";");
			if (typeof(colDef.value) == "string")
				colDef.value = new Function("element", "return " + colDef.value + ";");
		}
		
		for (var chapter in this.params.chapters) {
			var guid = this.params.chapters[chapter].guid;
			var act;
			if (guid) {
				act = this.act.getRepository().getByGuid(Ea.Package._Base, guid);
			}
			else {
				act = this.act.getRepository().getSelectedPackage();
				guid = act.getGuid();
			}
			var old = this.old.getRepository().getByGuid(Ea.Package._Base, guid);
			var output = new Html.IO.File(this.params.outputRoot + chapter + ".html");
			output.write("html-head", {title: chapter, stylesheet: this.params.styleSheet});
			this.params.columnCount = 0;
			for (var column in this.params.chapters[chapter].columns) {
				var colDef = this.params.chapters[chapter].columns[column];
				if (typeof colDef == "string") {
					if (colDef.charAt(0) != "#") {
						this.params.chapters[chapter].columns[column] = new Function("return " + colDef + ";");
					}
				}
				else if (typeof colDef == "object") {
					for (var row in colDef) {
						var rowDef = colDef[row];
						if (typeof rowDef == "string")
							colDef[row] = new Function("return " + rowDef + ";");
					}
				}
				this.params.lastColumn = column;
				if (this.params.columnCount++ == 0)
					this.params.firstColumn = column;
			}
			var rows;
			if (rows = this.params.chapters[chapter].rows)
				for (var row in rows) {
					var rowDef = this.params.chapters[chapter].rows[row];
					if (typeof rowDef == "string") {
						if (rowDef.charAt(0) != "#") {
							this.params.chapters[chapter].rows[row] = new Function("return " + rowDef + ";");
						}
					}
					else if (typeof rowDef == "object") {
						for (var innerRow in rowDef) {
							var innerRowDef = rowDef[innerRow];
							if (typeof innerRowDef == "string")
								rowDef[innerRow] = new Function("return " + innerRowDef + ";");
						}
					}
					this.params.lastRow = row;
				}
			this.processRw(act, old, 1, output, chapter);
			output.write("html-foot");
			output.close();
		}
		
		info("=== HTML TO DOCX ===");

		var doc = new Word.Document(this.params.template, this);
		for (var chapter in this.params.chapters) {
			doc.embed(this.params.outputRoot + chapter + ".html", chapter);
		}
		doc.insertToc(null, 1, 3);
		doc.save(this.params.outputRoot + this.params.outputFile);
		doc.close();
		Word.close();
		
		info("=== END ===");
	},
	
	processRw: function(actPackage, oldPackage, level, output, chapter) {
		
		var actElements = actPackage ? actPackage.getElements().filter(this.params.chapters[chapter].filter) : new Core.Types.Collection();
		var oldElements = oldPackage ? oldPackage.getElements().filter(this.params.chapters[chapter].filter) : new Core.Types.Collection();
	
		if (actElements.notEmpty() || oldElements.notEmpty()) {

			Ea.log(actPackage || oldPackage);

			//output.write("chapter-head", {name: "<a name=\"" + (actPackage || oldPackage).getXmlGuid().substring(5) + "\">" + Ea.Compare.compareString(actPackage ? actPackage.getName() : "", oldPackage ? oldPackage.getName() : "") + "</a>", level: level});
			//output.write("chapter-notes", {notes: Ea.Compare.compareString(actPackage ? actPackage.getNotes() : "", oldPackage ? oldPackage.getNotes() : "")});

			Ea.Compare._processElement(actPackage, oldPackage, output, chapter, true);
		}
		
		if (actPackage)
			actPackage.getPackages().forEach(function(actPackage) {
				var oldPackage = this.old.getByGuid(Ea.Package._Base, actPackage.getGuid());
				Ea.Compare.processRw(actPackage, oldPackage, level + 1, output, chapter);
			});

		if (oldPackage && !actPackage)
			oldPackage.getPackages().forEach(function(oldPackage) {
				var actPackage = this.old.getByGuid(Ea.Package._Base, oldPackage.getGuid());
				Ea.Compare.processRw(actPackage, oldPackage, level + 1, output, chapter);
			});
	},
	
	_processElement: function(act, old, output, chapter, distinct) {
		
		var ins = (act && !old);
		var del = (old && !act);
		var rows = this.params.chapters[chapter].rows;

		var actElements = act ? act.getElements().filter(this.params.chapters[chapter].filter) : new Core.Types.Collection();
		var oldElements = old ? old.getElements().filter(this.params.chapters[chapter].filter) : new Core.Types.Collection();

		if (distinct) {
			output.write("table-head");
			output.write("table-row-head", {style: ""});
			for (var column in this.params.chapters[chapter].columns) {
				output.write("table-head-cell", {value: column, style: (column == this.params.lastColumn) ? "width:100%;" : ""});
			}
			output.write("table-row-foot");
		}
		
		output.write("table-row-head", {style: ins ? "background:#e6ffe6;color:green;" : (del ? "background:#ffe6e6;color:red;" : "")});
		var index = 0;
		for (var column in this.params.chapters[chapter].columns) {
			var colDef = this.params.chapters[chapter].columns[column];
			this._processProperty(act, old, output, colDef, index++, rows ? false : true, false);
		}
		output.write("table-row-foot");
		
		if (rows) {

			for (var row in rows) {
				
				var rowDef = this.params.chapters[chapter].rows[row];
				if (typeof(rowDef) == "string" && rowDef == "#diagrams" && (!act || act.getDiagrams().isEmpty()))
					continue;
				
				output.write("table-row-head", {style: ins ? "background:#e6ffe6;color:green;" : (del ? "background:#ffe6e6;color:red;" : "")});
				var lastRow = row == (this.params.lastRow);
				output.write("table-inner-head-cell", {value: row, style: (lastRow ? "border-bottom:1px solid black;" : "") + (ins ? "background:#e6ffe6;color:green;" : (del ? "background:#ffe6e6;color:red;" : ""))});
				if (typeof(rowDef) == "string") {
					if (rowDef == "#diagrams") {
						output.write("table-body-cell-span-head", {colspan: this.params.columnCount - 1, style: (lastRow ? "border-bottom:1px solid black;" : "")});
						if (act) {
							var diagrams = act.getDiagrams();
							if (diagrams.notEmpty())
								diagrams.forEach(function(actDiagram) {
									output.write("ref-name", {guid: actDiagram.getXmlGuid().substring(5)});
									var oldDiagram = old ? this.old.getByGuid(Ea.Diagram._Base, actDiagram.getGuid()) : null;
									Ea.Compare.processDiagram(actDiagram, output, function(elementView) {
										return "#" + elementView.getElement().getXmlGuid().substring(5);
									}, Ea.Compare.compareString(actDiagram ? actDiagram.getName() + "<br>" + actDiagram.getNotes() : "", oldDiagram ? oldDiagram.getName() + "<br>" + oldDiagram.getNotes() : ""), 800, 500);
								});
						}
						output.write("table-body-cell-span-foot");
					}
				}
				else {
					this._processProperty(act, old, output, rowDef, -1, lastRow, true);
				}
				output.write("table-row-foot");
			}
		}

		var actMap = {};
		var distincted = [];
		actElements.forEach(function(actElement) {
			var oldElement = this.old.getByGuid(Ea.Element._Base, actElement.getGuid());
			actMap[actElement.getGuid()] = true;
			if (actElement.getElements().notEmpty() || (oldElement && oldElement.getElements().notEmpty())) {
				distincted.push([actElement, oldElement]);
			}
			else {
				Ea.Compare._processElement(actElement, oldElement, output, chapter, false);
			}
		});
	
		oldElements.forEach(function(oldElement) {
			var actElement = this.act.getByGuid(Ea.Element._Base, oldElement.getGuid());
			if (!actElement) {
				if (oldElement.getElements().notEmpty()) {
					distincted.push([actElement, oldElement]);
				}
				else {
					Ea.Compare._processElement(actElement, oldElement, output, chapter, false);
				}
			}
			else if (!actMap[oldElement.getGuid()]) {
				Ea.Compare._processMovedElement(actElement, oldElement, output, chapter);
			}
		});

		if (distinct) {
			output.write("table-foot");
			output.write("spacer");
		}
		
		for (var d = 0; d < distincted.length; d++) {
			Ea.Compare._processElement(distincted[d][0], distincted[d][1], output, chapter, true);
		}
	},
	
	_processProperty: function(act, old, output, def, index, lastRow, inRow) {
		
		if (typeof(def) == "object" || typeof(def) == "string") {
			
			output.write("inner-table-head", {colspan: inRow ? this.params.columnCount - 1 : 1, style: (lastRow ? "border-bottom:1px solid black;" : "")});

			if (typeof(def) == "string") {
				var dynamic = this.params.dynamic[def.substring(1)];
				dynamic.select.call(act || old).forEach(function(element) {
					var row = dynamic.name.apply(act || old, [element]);
					var rowDef = dynamic.value.apply(act || old, [element]);
					var value = Ea.Compare.compare(act, old, rowDef, output, lastRow, inRow);
					output.write("inner-table-row", {name: row, value: value || "&nbsp;", style: ""});
				});
			}
			else {
				for (var row in def) {
					var rowDef = def[row];
					var value = Ea.Compare.compare(act, old, rowDef, output, lastRow, inRow);
					output.write("inner-table-row", {name: row, value: value || "&nbsp;", style: ""});
				}
			}
			
			output.write("inner-table-foot");
		}
		else {
			
			var value = Ea.Compare.compare(act, old, def, output, lastRow, inRow);
			if (value) {
				if (index == 0)
					value = "<a name=\"" + (act || old).getXmlGuid().substring(5) + "\">" + value + "</a>";
				output.write("table-body-cell-span", {value: value, colspan: inRow ? this.params.columnCount - 1 : 1, style: (lastRow ? "border-bottom:1px solid black;" : "")});
			}
		}
	},
	
	_processMovedElement: function(actReq, oldReq, output, chapter) {
		output.write("table-row-head", {style: "background:#ffffa0;color:blue;"});
		var fn = this.params.chapters[chapter].columns[this.params.firstColumn];
		output.write("table-body-cell-span", {value: "<a href=\"#" + (actReq || oldReq).getXmlGuid().substring(5) + "\">" + Ea.Compare.compare(actReq, oldReq, fn) + "</a>", colspan: 1, style: "border-bottom:1px solid black;"});
		output.write("table-body-cell-span", {value: "//Element zostal przeniesiony", colspan: this.params.columnCount - 1, style: "border-bottom:1px solid black;"});
		output.write("table-row-foot");
	},
	
	compare: function(act, old, fn, output, lastRow, inRow) {

		act = this.safeCall(fn, act);
		old = this.safeCall(fn, old);
		
		//info("act=" + (act ? act._class : "") + ";old=" + (old ? old._class : ""));

		if ((Core.Types.AbstractCollection.isInstance(act) || Core.Types.AbstractCollection.isInstance(old))) {

			var actMap = {}, oldMap = {}; 

			if (act)
				act.forEach(function(element) {
					actMap[element.getGuid()] = element;
				});
			
			if (old)
				old.forEach(function(element) {
					oldMap[element.getGuid()] = element;
				});
			
			output.write("inner-table-head", {colspan: inRow ? this.params.columnCount - 1 : 1, style: (lastRow ? "border-bottom:1px solid black;" : "")});
			
			if (act)
				act.forEach(function(element) {
					var actRow = this.getRow(element);
					if (oldMap[element.getGuid()]) {
						var oldRow = this.getRow(oldMap[element.getGuid()]);
						if (actRow instanceof Array)
							output.write("inner-table-row", {name: Ea.Compare.compareString(actRow[0], oldRow[0]) || "&nbsp;", value: Ea.Compare.compareString(actRow[1], oldRow[1]) || "&nbsp;", style: ""});
						else
							output.write("inner-table-row-simple", {value: Ea.Compare.compareString(actRow, oldRow) || "&nbsp;", style: ""});
					}
					else {
						if (actRow instanceof Array)
							output.write("inner-table-row", {name: "<ins>" + actRow[0] + "</ins>", value: "<ins>" + actRow[1] + "</ins>", style: "background:#e6ffe6;color:green;"});
						else
							output.write("inner-table-row-simple", {value: "<ins>" + actRow + "</ins>", style: "background:#e6ffe6;color:green;"});
					}
				});
			
			if (old)
				old.forEach(function(element) {
					if (!actMap[element.getGuid()]) {
						var row = this.getRow(element);
						if (row instanceof Array)
							output.write("inner-table-row", {name: "<del>" + row[0] + "</del>", value: "<del>" + row[1] + "</del>", style: "background:#ffe6e6;color:red;"});
						else
							output.write("inner-table-row-simple", {value: "<del>" + row + "</del>", style: "background:#ffe6e6;color:red;"});
					}
				});
			
			output.write("inner-table-foot");
			return null;
		}
		
		return this.compareString(this.getRow(act), this.getRow(old)) || "&nbsp;";
	},
	
	compareString: function(act, old) {	
		
		if ((act == old) || (!act && !old))
			return act || "";

		if (act && !old)
			return "<ins style=\"background:#e6ffe6;color:green;\">" + act + "</ins>";

		if (old && !act)
			return "<del style=\"background:#ffe6e6;color:red;\">" + old + "</del>";
		
		if (act.indexOf(" ") == -1 && old.indexOf(" ") == -1)
			return "<del style=\"background:#ffe6e6;color:red;\">" + old + "<br></del><ins style=\"background:#e6ffe6;color:green;\">" + act + "</ins>";

		var diff = this.diff.diff_main(old, act);
		//this.diff.diff_cleanupSemantic(diff);
		return this.diff.diff_prettyHtml(diff).replace(/&para;/g, "");

	},
	
	getRow: function(element) {
		
		if (!element || !element._class)
			return element;
		
		var idFn = null;
		for (var t = 0; t < Ea.Compare.idFn.length; t++) {
			if (Ea.Compare.idFn[t].type.isInstance(element)) {
				idFn = Ea.Compare.idFn[t].fn;
				break;
			}
		}
		if (idFn instanceof Array) {
			var row = [];
			for (var i = 0; i < idFn.length; i++) {
				row.push(idFn[i].call(element));
			}
			return row;
		}
		return idFn.call(element) || element.getGuid();
	},
	
	safeCall: function(fn, context) {
		var result = null;
		if (context) {
			if (fn) {
				try {
					result = fn.call(context);
				}
				catch (error) {
	
				}
			}
			else {
				result = context;
			}
		}
		return (typeof result == "string") ? result.replace(/\u25E6/g, "-") : result;
	},
	
	processDiagram: function(diagram, output, elementLinkFn, legend, maxWidth, maxHeight) {

		var diagramFile = "diagram_" + diagram.getXmlGuid() + ".png";
		diagram.saveToFile(this.params.outputRoot + "/diagrams/" + diagramFile);
		
		var dimension = diagram.getDimension();
		var scale = diagram.getScale(maxWidth || this.params.diagramMaxWidth, maxHeight || this.params.diagramMaxHeight);
		var dimImg = " width=\"" + Math.round(dimension.width * scale) + "\" height=\"" + Math.round(dimension.height * scale) + "\"";
		
		output.write("diagram", {
			filePath: "diagrams\\" + diagramFile, 
			id: diagram.getXmlGuid().substring(5), 
			dimension: dimImg
		});
		
		if (legend) {
			output.write("diagram-legend", {
				legend: legend
			});
		}
		
		output.write("map-head", {id: diagram.getXmlGuid().substring(5)});
		diagram.getElementViews().forEach(function(elementView) {
			if (Ea.Element._Base.isInstance(elementView.getElement())) {
				var link = elementLinkFn(elementView);
				output.write("map-area", {
					elementLink: link, 
					elementView: elementView, 
					dimension: elementView.getCorrected(scale).valueOf()
				});
			}
		});
		output.write("map-foot");
		
		diagram.close();
	}
};
