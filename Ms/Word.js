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
		
		if (!this.wordApp)
			this.wordApp = new ActiveXObject("Word.Application");
		
		var template = this.wordApp.Documents.Open(Sys.IO.getPath(params.template, params.context), Word.WdOpenFormat.wdOpenFormatAuto, true);
		
		try {
			for (var mark in params.embeds) {
				info("Embedding chapter [$] in template", [params.embeds[mark]]);
				//debug("Embedding chapter [$] in template", [params.embeds[mark]]);
				var embedTo = template.ActiveWindow.Selection;
				//debug("Searching for bookmark [$] in template", [mark]);
				embedTo.GoTo(-1, 0, 0, mark);
				this._embed(this.wordApp, params.outputRoot, params.embeds[mark], embedTo);
			}
			
			info("Saving template to output path");
			template.SaveAs(params.outputRoot + params.outputFile, params.format || Word.WdSaveFormat.wdFormatDocumentDefault);
			template.Close();
		}
		catch(e) {
			template.Close(Word.WdSaveOptions.wdDoNotSaveChanges);
			throw e;
		}
	},
	
	closeWord: function() {
		if (this.wordApp)
			this.wordApp.Quit();
		this.wordApp = null;
	},
	
	finalize: function() {
		this.closeWord();
	},
	
	_embed: function(wordApp, outputRoot, file, embedTo) {
		//debug(" - opening chapter html file");
		var embedded = wordApp.Documents.Open(outputRoot + file, Word.WdOpenFormat.wdOpenFormatAuto, true);
		//embedded.ActiveWindow.Visible = true;

		var count = embedded.InlineShapes.Count;
		//debug(" - embedding $ shapes in chapter", [count]);
		for (var si = 0; si < count; si++) {
			var shape = embedded.InlineShapes(si + 1);
			shape.LinkFormat.BreakLink();
		}

		//debug(" - embedding chapter in template");
		var selection = embedded.ActiveWindow.Selection;
		embedded.Select();
		selection.Copy();
		embedTo.Paste();
		
		selection.TypeText(' ');
		embedded.Select();
		selection.Copy();
		embedded.Close(0);
	}
};
