/*
   Copyright 2011-2014 300 D&C

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

Word = {
	WdOpenFormat: {
		wdOpenFormatAuto: 0,
		wdOpenFormatDocument: 1,
		wdOpenFormatTemplate: 2,
		wdOpenFormatRTF: 3,
		wdOpenFormatText: 4,
		wdOpenFormatUnicodeText: 5,
		wdOpenFormatAllWord: 6,
		wdOpenFormatWebPages: 7,
		wdOpenFormatXML: 8,
		wdOpenFormatXMLDocument: 9,
		wdOpenFormatXMLDocumentMacroEnabled: 10,
		wdOpenFormatXMLTemplate: 11,
		wdOpenFormatXMLTemplateMacroEnabled: 12,
		wdOpenFormatAllWordTemplates: 13
	},
	WdSaveFormat : {
		wdFormatDocument: 0,
		wdFormatTemplate: 1,
		wdFormatText: 2,
		wdFormatTextLineBreaks: 3,
		wdFormatDOSText: 4,
		wdFormatDOSTextLineBreaks: 5,
		wdFormatRTF: 6,
		wdFormatUnicodeText: 7,
		wdFormatHTML: 8,
		wdFormatWebArchive: 9,
		wdFormatFilteredHTML: 10,
		wdFormatXML: 11,
		wdFormatXMLDocument: 12,
		wdFormatXMLDocumentMacroEnabled: 13,
		wdFormatXMLTemplate: 14,
		wdFormatXMLTemplateMacroEnabled: 15,
		wdFormatDocumentDefault: 16,
		wdFormatPDF: 17,
		wdFormatXPS: 18
	},
	WdViewType: {
		wdNormalView: 1,
		wdOutlineView: 2,
		wdPrintView: 3,
		wdPrintPreview: 4,
		wdMasterView: 5,
		wdWebView: 6,
		wdReadingView: 7
	},
	WdSaveOptions: {
		wdDoNotSaveChanges: 0,
		wdPromptToSaveChanges: -2,
		wdSaveChanges: -1
	},
	
	wordApp: null,

	htmlToDoc: function(params) {
		
		info("Converting output to Office document");
		
		this.open();
		
		var document = new Word.Document(params.template, params.context);
		
		try {
			for (var bookmark in params.embeds) {
				info("Embedding chapter [$] in template", [params.embeds[bookmark]]);
				document.embed(params.outputRoot + params.embeds[bookmark], bookmark);
			}
			
			info("Saving template to output path");
			document.save(params.outputRoot + params.outputFile);
			document.close();
		}
		catch(e) {
			document.close();
			throw e;
		}
	},
	
	open: function() {
		if (!this.wordApp)
			this.wordApp = new ActiveXObject("Word.Application");
	},
	
	close: function() {
		if (this.wordApp)
			this.wordApp.Quit();
		this.wordApp = null;
	},
	
	initialize: function() {
		this.open();
	},
	
	finalize: function() {
		this.close();
	}
};

Word.Document = define({
	
	template: null,
	
	create: function(templatePath, context) {
		this.template = Word.wordApp.Documents.Open(Sys.IO.getPath(templatePath, context), Word.WdOpenFormat.wdOpenFormatAuto, true);
		
	},
	
	embed: function(filePath, bookmark) {
		var embedded = Word.wordApp.Documents.Open(filePath, Word.WdOpenFormat.wdOpenFormatAuto, true);
		//embedded.ActiveWindow.Visible = true;

		for (var si = 0; si < embedded.InlineShapes.Count; si++) {
			var shape = embedded.InlineShapes(si + 1);
			shape.LinkFormat.BreakLink();
		}

		var selection = embedded.ActiveWindow.Selection;
		embedded.Select();
		selection.Copy();
		var embedTo = this.template.ActiveWindow.Selection;
		embedTo.GoTo(-1, 0, 0, bookmark);
		embedTo.Paste();
		
		selection.TypeText(' ');
		embedded.Select();
		selection.Copy();
		embedded.Close(Word.WdSaveOptions.wdDoNotSaveChanges);
	},
	
	insertToc: function(bookmark, upperLevel, lowerLevel) {
		this.template.TablesOfContents.Add(this.template.Bookmarks.Item(bookmark).Range, true, upperLevel, lowerLevel);
	},
	
	save: function(filePath, format) {
		this.template.SaveAs(filePath, format || Word.WdSaveFormat.wdFormatDocumentDefault);
	},
	
	close: function() {
		this.template.Close(Word.WdSaveOptions.wdDoNotSaveChanges);		
	}
	
});
