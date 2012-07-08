
include("Html@Html");
include("Html.IO@Html");
include("Word@Ms");
include("Ea@Ea");

Report = {
	
	params: {
		styleSheet: "style.css",
		diagramMaxWidth: 600,
		diagramMaxHeight: 900,
		reuseDiagrams: false,
		processReferences: true,
		processReport: true,
		depth: 0,
		warningsFile: {
			zus: {
				name: "Uwagi - wersja ZUS",
				label: "Uwagi techniczne - wersja ZUS"
			},
			asseco: {
				name: "Uwagi - wersja Asseco",
				label: "Uwagi techniczne"
			}
		},

		sygatura: "Sygnatura",
		projekt: "MXXXX",
		zglaszajacy: "Grzegorz Brzêczyszczykiewicz",
		data: "2012-06-10",
		zrodlo: "DZI",
		numer: 0,
		
		convertTo: {
			template: "template.docx",
			outputFile: "report",
			embeds: {
				useCase: "useCase.html"
			}
		}
	},
	
	constraints: {
		1: {
				reported: true, 
				kind: "error", 
				category: "alias", 
				description: "Brak identyfikatora",
				message: "$ nie ma identyfikatora"
			},
		2: {
				reported: true, 
				kind: "error", 
				category: "alias", 
				description: "Identyfikator nie jest unikalny",
				message: "$: identyfikator jest taki sam jak dla $ / <u>$</u>"
			},
		3: {
				reported: true, 
				kind: "warning", 
				category: "relation", 
				description: "Niepoprawna relacja pomiêdzy aktorem i przypadkiem u¿ycia",
				message: "Aktor powinien byæ powi¹zany z przypadkiem $ u¿ycia relacj¹ asocjacji (aktor --&gt; przypadek u¿ycia)"
			},
		4: {
				reported: true, 
				kind: "warning", 
				category: "relation", 
				description: "Niepoprawna relacja pomiêdzy przypadkiem u¿ycia i wymaganiem",
				message: "Przypadek u¿ycia powinien byæ powi¹zany z wymaganiem $ relacj¹ realizacji"
			},
		5: {
				reported: false, 
				kind: "warning", 
				category: "relation", 
				description: "Niepoprawna relacja pomiêdzy przypadkiem u¿ycia i zadaniem procesu biznesowego",
				message: "Przypadek u¿ycia powinien byæ powi¹zany z zadaniem procesu biznesowego $ relacj¹ realizacji"
			},
		6: {
				reported: true, 
				kind: "warning", 
				category: "diagram", 
				description: "Zdefiniowano przebiegi, ale brak diagramu aktywnoœci",
				message: "Brak diagramu aktywnoœci"
			},
		7: {
				reported: true, 
				kind: "warning", 
				category: "scenario", 
				description: "Zdefiniowano przebiegi, ale nie zdefiniowano przebiegu podstawowego",
				message: "Brak przebiegu podstawowego"
			},
		8: {
				reported: true, 
				kind: "warning", 
				category: "scenario", 
				description: "Wiêcej ni¿ jeden przebieg podstawowy",
				message: "Wiêcej ni¿ jeden przebieg podstawowy"
			},
		9: {
				reported: true, 
				kind: "warning", 
				category: "relation", 
				description: "Przypadki u¿ycia w³¹czane na poziomie modelu przypadków u¿ycia, nie s¹ w³¹czane w ¿adnym kroku przebiegu",
				message: "Przypadek u¿ycia w³¹cza przypadek $, który nie jest w³¹czany przez ¿aden krok przebiegów"
			},
		10: {
				reported: true, 
				kind: "warning", 
				category: "relation", 
				description: "Przypadki u¿ycia rozszerzaj¹ce na poziomie modelu przypadków u¿ycia, nie rozszerzaj¹ ¿adnego kroku przebiegu",
				message: "Przypadek u¿ycia jest rozszerzeany przez przypadek $, który nie rozszerza ¿adnego kroku przebiegów"
			},
		11: {
				reported: true, 
				kind: "warning", 
				category: "scenario", 
				description: "Brak przebiegów dla przypadku u¿ycia, który nie jest abstrakcyjny i nie jest generalizacj¹",
				message: "Brak przebiegów"
			},
		12: {
				reported: true, 
				kind: "error", 
				category: "scenario", 
				description: "Przebiegi odnosz¹ siê do regu³, które nie zosta³y odnalezione",
				message: "Przebiegi odnosz¹ siê do nieistniej¹cej regu³y [$]"
			},
		13: {
				reported: true, 
				kind: "warning", 
				category: "step", 
				description: "Kroki wskazuj¹ na w³¹czanie/rozszerzanie, natomiast nie odnaleziono w opisie kroków wzorca wskazanych przypadków",
				message: "W kroku [$] przebiegu $ nie odnaleziono wzorca w³¹czanego/rozszerzaj¹cego przypadku u¿ycia"
			},
		14: {
				reported: true, 
				kind: "warning", 
				category: "step", 
				description: "Kroki w³¹czaj¹ przypadki u¿ycia, które nie s¹ w³¹czane na poziomie modelu przypadków u¿ycia",
				message: "Krok [$] przebiegu $ w³¹cza przypadek u¿ycia, który nie jest w³¹czany na poziomie modelu"
			},
		15: {
				reported: true, 
				kind: "error", 
				category: "step", 
				description: "Kroki przebiegów alternatywnych (rozszerzeñ) w³¹czaj¹ przypadki u¿ycia - powinny byæ rozszerzane",
				message: "Krok [$] przebiegu alternatywnego (rozszerzenia) $ nie mo¿e w³¹czaæ przypadku u¿ycia (powinien byæ rozszerzany)"
			},
		16: {
				reported: true, 
				kind: "warning", 
				category: "step", 
				description: "Kroki s¹ rozszerzane przez przypadki u¿ycia, które nie rozszerzaj¹ przypadku na poziomie modelu przypadków u¿ycia",
				message: "Krok [$] przebiegu $ jest rozszerzany przez przypadek u¿ycia, który nie jest rozszerzeniem na poziomie modelu"
			},
		17: {
				reported: true, 
				kind: "warning", 
				category: "step", 
				description: "Kroki przebiegu g³ównego s¹ rozszerzane przez przypadki u¿ycia - powinny w³¹czaæ",
				message: "Krok [$] przebiegu podstawowego nie powinien byæ rozszerzany przez inny przypadek u¿ycia (powinien w³¹czaæ)"
			},
		18: {
				reported: true, 
				kind: "warning", 
				category: "type", 
				description: "Brak powi¹zañ klas wykazanych w krokach przebiegów z modelem dziedziny systemu",
				message: "Klasa [$] u¿yta w kroku [$] przebiegu $ nie zosta³a wskazana w modelu dziedziny systemu"
			},
		19: {
				reported: true, 
				kind: "warning", 
				category: "rule", 
				description: "Niepoprawne regu³y",
				message: "$ nie jest poprawn¹ regu³¹"
			},
		20: {
				reported: true, 
				kind: "error", 
				category: "rule", 
				description: "Numery regu³ s¹ nieunikalne w kontekœcie przypadku u¿ycia",
				message: "Regu³a $ ma taki sam numer jak regu³a $"
			},
		21: {
				reported: true, 
				kind: "warning", 
				category: "rule", 
				description: "Brak powi¹zania regu³ z krokami przebiegów",
				message: "Brak odniesienia w przebiegach do regu³y $"
			},
		22: {
				reported: true, 
				kind: "warning", 
				category: "message", 
				description: "Komunikaty wskazane w regu³ach, nie zosta³y odnalezione w modelu",
				message: "Komunikat '$' nie zosta³ odnaleziony w modelu"
			},
		23: {
				reported: true, 
				kind: "warning", 
				category: "relation", 
				description: "Klasy abstrakcyjne nie posiadaj¹ specjalizacji",
				message: "Klasa jest abstrakcyjna i nie posiada specjalizacji"
			},
		24: {
				reported: true, 
				kind: "warning", 
				category: "scenario", 
				description: "Przypadek, który nie jest abstrakcyjny i nie jest generalizacj¹, nie operuje na danych",
				message: "Brak zdefiniowanych klas wejœciowych/wyjœciowych dla przypadku u¿ycia, który nie jest abstrakcyjny i nie jest generalizacj¹"
			},
		25: {
				reported: true, 
				kind: "warning", 
				category: "relation", 
				description: "Wymaganie nie jest realizowane przez ¿aden przypadek u¿ycia",
				message: "Wymaganie nie jest realizowane przez ¿aden przypadek u¿ycia"
			},
		26: {
				reported: true, 
				kind: "warning", 
				category: "step", 
				description: "Kroki wskazuj¹ w modelu innych wykonawców ni¿ w opisach",
				message: "Krok [$] przebiegu $ wskazuje w modelu innego wykonawcê ni¿ w opisie kroku"
			},
		27: {
				reported: true, 
				kind: "warning", 
				category: "step", 
				description: "Kroki wykonywane przez u¿ytkownika operuj¹ na danych",
				message: "Krok u¿ytkownika [$] przebiegu $ nie mo¿e operowaæ na danych [$ ($)]"
			},
		28: {
				reported: true, 
				kind: "warning", 
				category: "type", 
				description: "Te same kroki przebiegów wielokrotnie operuj¹ na tych samych grupach danych",
				message: "Krok [$] przebiegu $ wielokrotnie operuje na takiej samej grupie danych [$ ($)]"
			},
		29: {
				reported: true, 
				kind: "warning", 
				category: "rule", 
				description: "Niepoprawne warunki pocz¹tkowe",
				message: "$ nie jest poprawnym warunkem pocz¹tkowym"
			},
		30: {
				reported: true, 
				kind: "warning", 
				category: "rule", 
				description: "Niepoprawne warunki koñcowe",
				message: "$ nie jest poprawnym warunkem koñcowym"
			},
		31: {
				reported: true, 
				kind: "warning", 
				category: "step", 
				description: "Kroki odwo³uj¹ siê do przypadków u¿ycia, które na poziomie modelu nie s¹ generalizacj¹, nie rozszerzaj¹, ani nie s¹ w³¹czane",
				message: "W kroku [$] przebiegu $ wystêpuje identyfikator przypadku u¿ycia ($), który nie jest powi¹zany poprawn¹ relacj¹ (nie jest rozszerzeniem, nie jest w³¹czany, nie jest generalizacj¹)"
			},
		32: {
				reported: true, 
				kind: "error", 
				category: "name", 
				description: "Brak nazwy",
				message: "$ nie ma nazwy"
			},
		33: {
				reported: true, 
				kind: "error", 
				category: "notes", 
				description: "Brak opisu",
				message: "$ nie ma opisu"
			},
		34: {
				reported: true, 
				kind: "warning", 
				category: "notes", 
				description: "Opis jest to¿samy z nazw¹",
				message: "$: opis jest taki sam jak nazwa"
			},
		35: {
				reported: true, 
				kind: "warning", 
				category: "type", 
				description: "Kierunki przep³ywu danych (wejœciowe/wyjœciowe) s¹ niepoprawne",
				message: "Niepoprawny rodzaj przesuniêcia ($) dla grupy danych [$] w kroku [$] przebiegu $"},
		36: {
				reported: true, 
				kind: "warning", 
				category: "step", 
				description: "Niepoprawne/zbêdne kroki - brak przypisania regu³, brak przep³ywu danych",
				message: "Krok systemowy [$] przebiegu $ jest niepoprawny lub zbêdny - brak operacji na danych oraz brak powi¹zanych regu³"
			},
		37: {
				reported: true, 
				kind: "warning", 
				category: "type", 
				description: "Puste nazwy klas wykazanych w krokach przebiegów",
				message: "Klasa u¿yta w kroku [$] przebiegu $ ma pust¹ nazwê"
			}
	},
	
	warnings: {},
	
	_depthMax: 0,
	
	elements: {},
	
	types: {
		UseCase: {
			label: "Przypadek u¿ycia",
			title: "Przypadki u¿ycia",
			pattern: "[\\d\\.]+-PU[A-Z]-[\\d]+",
			filter: Ea.Element.UseCase,
			notes: true,
			process: true
		},
		Message: {
			label: "Komunikat",
			title: "Komunikaty",
			pattern: "[\\d\\.]+-KOM-[\\d]+",
			filter: Ea.Element.PrimitiveType,
			process: true
		},
		Type: {
			label: "Typ",
			title: "Typy",
			pattern: "[\\d\\.]+-KL-[\\d]+",
			filter: Ea.Element.Type,
			notes: true,
			process: true
		},
		BusinessTask: {
			label: "Zadanie procesu biznesowego",
			title: "Zadania procesów biznesowych",
			filter: Ea.Element.Activity,
			notes: true,
			process: true
		},
		Actor: {
			label: "Aktor",
			title: "Aktorzy",
			filter: Ea.Element.Actor,
			notes: true,
			process: true
		},
		Requirement: {
			label: "Wymaganie",
			title: "Wymagania",
			filter: Ea.Element.Requirement,
			notes: true,
			process: true
		}
	},

	warning: {
		info: "Informacja",
		question: "Pytanie",
		warning: "Uwaga",
		error: "B³¹d"
	},
	
	category: {
		alias: {
			label: "Identyfikator",
			type: "Element"
		},
		name: {
			label: "Nazwa",
			type: "Element"
		},
		notes: {
			label: "Opis",
			type: "Element"
		},
		relation: {
			label: "Powi¹zania",
			type: "Element"
		},		
		diagram: {
			label: "Diagram aktywnoœci",
			type: "UseCase"
		},
		scenario: {
			label: "Przebieg przypadku u¿ycia",
			type: "UseCase"
		},
		step: {
			label: "Krok przebiegu",
			type: "UseCase"
		},
		type: {
			label: "Grupa danych",
			type: "UseCase"
		},
		rule: {
			label: "Regu³a",
			type: "UseCase"
		},
		message: {
			label: "Komunikat",
			type: "UseCase"
		}
	},
	
	getLink: function(element, label, details) {
		if (details) {
			/*if (this.elements.exists(element)) {
				return "<a href=\"" + element.getXmlGuid() + ".html\">" + label + "</a>";
			}
			return "<span class=\"reference\">" + label + "</span>";*/
			return "<a href=\"" + element.getXmlGuid() + ".html\">" + label + "</a>";
		}
		return "<a href=\"" + element._getPackage().getXmlGuid() + ".html#" + element.getXmlGuid().substring(5) + "\">" + label + "</a>";
	},
	
	format: function(string) {
		if (!string)
			return "";
		string = string.replace(/<(include|extend)>/g, "&lt;$1&gt;");
		//string = string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		string = string.replace(/\[un\d\s?/g, "<span class=\"un\">").replace(/\s?\]un\d/g, "</span>");
		string = string.replace(/\[mn\d\s?/g, "<span class=\"mn\">").replace(/\s?\]mn\d/g, "</span>");
		//TODO: /[mk\d ]mk\d - co to jest?
		string = string.replace(/\[mk\d\s?/g, "<span class=\"mk\">").replace(/\s?\]mk\d/g, "</span>");
		string = string.replace(/\[uk\d\s?/g, "<span class=\"uk\">").replace(/\s?\]uk\d/g, "</span>");
		
		string = string.replace(/^NOWY\d\s*-\s*(.*)$/, "<span class=\"mn\">$1</SPAN>");
		
		string = string.replace(/\[uu\d\s?/g, "<span class=\"uu\">").replace(/\s?\]uu\d/g, "</span>");
		string = string.replace(/\[mu\d\s?/g, "<span class=\"mu\">").replace(/\s?\]mu\d/g, "</span>");
		
		string = string.replace(/^USUNIÊTO\d\s*-\s*(.*)$/, "<span class=\"uu\">$1</SPAN>");
		
		return string;
	},
	
	clear: function(string) {
		if (!string)
			return "";
		//string = string.replace(/[<>]/g, "");
		string = string.replace(/^(NOWY|USUNIÊTO)\d\s*-\s*/, "");
		string = string.replace(/\[un\d\s?/g, "").replace(/\s?\]un\d/g, "");
		string = string.replace(/\[mn\d\s?/g, "").replace(/\s?\]mn\d/g, "");
		string = string.replace(/\[mk\d\s?/g, "").replace(/\s?\]mk\d/g, "");
		string = string.replace(/\[uk\d\s?/g, "").replace(/\s?\]uk\d/g, "");

		string = string.replace(/\[uu\d/g, "<uu>").replace(/\]uu\d/g, "</uu>");
		string = string.replace(/\[mu\d/g, "<mu>").replace(/\]mu\d/g, "</mu>");
		string = string.replace(/\]/g, "&rsb;");
		string = string.replace(/<uu>/g, "[uu0").replace(/<\/uu>/g, "]uu0");
		string = string.replace(/<mu>/g, "[mu0").replace(/<\/mu>/g, "]mu0");
		string = string.replace(/\[uu\d[^\]]*\]uu\d/g, "");
		string = string.replace(/\[mu\d[^\]]*\]mu\d/g, "");
		string = string.replace(/&rsb;/g, "]");
		//string = string.replace(/\s/g, "");
		return string;
	},

	open: function(path, warnings) {
		return (this.params.processReport || warnings) ? new Html.IO.File(path) : null;
	},
	
	write: function(file, template, params) {
		if (file) {
			file.write(template, params);
		}
	},
	
	close: function(file) {
		if (file) {
			file.close();
		}
	},
	
	getLabel: function(param, noLinks) {
		if (Ea.Types.Any.isInstance(param)) {
			var label;
			if (Ea.Types.Named.isInstance(param)) {
				if (Ea.Constraint._Base.isInstance(param)) {
					label = "<i><b>" + param.getName() + "</b> " + param.getNotes() + "</i>";
				}
				else if (Ea.Element._Base.isInstance(param)) {
					if (noLinks)
						label = "<i><b>" + param.getAlias() + "</b> " + param.getName() + "</i>";
					else 
						label = this.getLink(param, "<i><b>" + param.getAlias() + "</b> " + param.getName() + "</i>");
				}
				else {
					label = "<i>" + param.getName() + "</i>";
				}
			}
			else {
				label = "<i>" + param._toString() + "</i>";
			}
			return this.format(label);
		}
		
		if (typeof(param) == "string")
			return this.format(param);
		
		return param;
	},
	
	setStats: function(category, element, stats) {
		var checks = this.elements[element.getGuid()].checks;
		checks[category.name].stats += stats;
	},
	
	addWarning: function(id, element, params) {
		
		//if (id > 30) info("************************************************" + element.getGuid() + " *** " + id);
		var warning = this.warnings[id];
		if (!warning.isReported())
			return;
		var checks = this.elements[element.getGuid()].checks;
		var warnings = checks[warning.getCategory().name];
		if (!warnings.warnings[id]) {
			warnings.warnings[id] = [];
		}
		warnings.warnings[id].push(params || []);
	},
	
	getWarningsStats: function(element) {
		
		var stats = {};
		var _element = this.elements[element.getGuid()];
		var checks = _element.checks;
		var _type = _element.type;
		
		for (var category in checks) {
			
			var type = this.category[category].type;
			if (type != "Element" && this.types[type] != _type)
				continue;
			
			stats[category] = {
					checks: checks[category].stats,
					total: 0,
					warnings: {}
				};
			for (var id in checks[category].warnings) {
				var warnings = checks[category].warnings[id];
				if (!stats[category].warnings[id])
					stats[category].warnings[id] = 0;
				stats[category].warnings[id] += warnings.length;
				stats[category].total += warnings.length;
			}
		}
		return stats;
	},
	
	processWarningsStats: function(element, file) {
		var warningsStats = this.getWarningsStats(element);
		
		var link = "<a href=\"" + this.params.warningsFile.zus.name + ".html#" + element.getXmlGuid().substring(5) + "\">Problemy</a>";
		this.write(file, Html.templates.statsHead, {name: link});
		for (var category in warningsStats) {
			var stats = warningsStats[category];
			this.write(file, Html.templates.statsRow, {category: this.category[category].label, checks: stats.checks, total: stats.total});
			for (var id in stats.warnings) {
				var warning = this.warnings[id];
				var number = stats.warnings[id];
				this.write(file, Html.templates.statsRowId, {warning: warning, number: number});
			}
		}
		this.write(file, Html.templates.statsFoot);
		this.write(file, Html.templates.spacer);
	},
	
	stats: {},
	
	processWarnings: function(element) {
		
		var _element = this.elements[element.getGuid()];
		var checks = _element.checks;
		var _type = _element.type;
		var kinds = {};

		for (var category in checks) {

			if (!this.stats[category]) {
				this.stats[category] = {
						checks: 0,
						total: 0,
						kinds: {},
						warnings: {}
					};
			}
			this.stats[category].checks += checks[category].stats;
			
			var type = this.category[category].type;
			if (type != "Element" && this.types[type] != _type)
				continue;
			
			for (var id in checks[category].warnings) {
				var warning = this.warnings[id];
				
				var kind = warning.getKind();
				if (!this.stats[category].kinds[kind])
					this.stats[category].kinds[kind] = 0;
				if (!this.stats[category].warnings[id])
					this.stats[category].warnings[id] = 0;
				if (!kinds[kind])
					kinds[kind] = {};
				if (!kinds[kind][category])
					kinds[kind][category] = {};
				kinds[kind][category][id] = checks[category].warnings[id];
			}
		}
		
		for (var kind in kinds) {
			this.write(this.files.warningsZus, Html.templates.refName, {guid: element.getXmlGuid().substring(5)});
			this.write(this.files.warningsAsseco, Html.templates.refName, {guid: element.getXmlGuid().substring(5)});
			this.write(this.files.warningsZus, Html.templates.warningHead, {
				number: this.params.numer,
				sygnatura: this.params.sygatura,
				zglaszajacy: this.params.zglaszajacy,
				zrodlo: this.params.zrodlo,
				projekt: this.params.projekt,
				data: this.params.data
			});
			this.write(this.files.warningsAsseco, Html.templates.warningHead, {
				number: this.params.numer,
				sygnatura: this.params.sygatura,
				zglaszajacy: this.params.zglaszajacy,
				zrodlo: this.params.zrodlo,
				projekt: this.params.projekt,
				data: this.params.data
			});
			this.params.numer++;
			this.write(this.files.warningsZus, Html.templates.warningMessagesHead);
			this.write(this.files.warningsAsseco, Html.templates.warningMessagesHead);

			for (var category in kinds[kind]) {
				var messagesLinks = "";
				var messagesNoLinks = "";
				for (var id in kinds[kind][category]) {
					var warning = this.warnings[id];
					var warnings = kinds[kind][category][id];
					this.stats[category].kinds[kind] += warnings.length;
					this.stats[category].warnings[id] += warnings.length;
					this.stats[category].total += warnings.length;
					for (var mi = 0; mi < warnings.length; mi++) {
						var params = warnings[mi];
						var paramsNoLinks = [];
						var paramsLinks = [];
						for (var pi = 0; pi < params.length; pi++) {
							paramsNoLinks.push(this.getLabel(params[pi], true));
							paramsLinks.push(this.getLabel(params[pi]));
						}
						var _messageLinks = warning.getCriteria() + " " + Core.Output.exec(warning.getMessage(), paramsLinks);
						messagesLinks = messagesLinks + "<p class=\"li\">•&nbsp;" + _messageLinks + "</p>";
						var _messageNoLinks = Core.Output.exec(warning.getMessage(), paramsNoLinks);
						messagesNoLinks = messagesNoLinks + "<p class=\"li\">•&nbsp;" + _messageNoLinks + "</p>";
					}
				}
				this.write(this.files.warningsZus, Html.templates.warningMessage, {
					messages: messagesLinks,
					category: this.category[category].label
				});				
				this.write(this.files.warningsAsseco, Html.templates.warningMessage, {
					messages: messagesNoLinks,
					category: this.category[category].label
				});				
			}

			this.write(this.files.warningsZus, Html.templates.warningMessagesFoot);
			this.write(this.files.warningsAsseco, Html.templates.warningMessagesFoot);
			var _package = element.getParent().getQualifiedName();
			this.write(this.files.warningsZus, Html.templates.warningFoot, {
				package: _package,
				context: this.getLabel(element),
				kind: kind
			});
			this.write(this.files.warningsAsseco, Html.templates.warningFoot, {
				package: _package,
				context: this.getLabel(element, true),
				kind: kind
			});
			this.write(this.files.warningsZus, Html.templates.spacer);
			this.write(this.files.warningsAsseco, Html.templates.spacer);
		}
	},
	
	initialize: function() {
		Html.loadTemplates("template.html", this);
		for (var name in this.types) {
			var type = this.types[name];
			type.name = name;
			type.aliases = {};
			type.packages = {};
			if (this.params.processReferences === false) {
				type.process = false;
			}
		}
		for (var name in this.category) {
			this.category[name].name = name;
		}
		
		for (id in this.constraints) {
			new Report.Warning(id, this.constraints[id]);
		}
		
	},
	
	files: {
		warningsZus: null,
		warningsAsseco: null
	},
	
	execute: function() {
		info("=== START ===");

		Core.IO.createFolder(this.params.outputRoot);
		Core.IO.createFolder(this.params.outputRoot + "\\diagrams");
		Core.IO.copy(this.params.styleSheet, this.params.outputRoot, this);

		this.files.warningsZus = this.open(this.params.outputRoot + this.params.warningsFile.zus.name + ".html", true);
		this._warningsFileHead(this.files.warningsZus, this.params.warningsFile.zus.label);
		this.files.warningsAsseco = this.open(this.params.outputRoot + this.params.warningsFile.asseco.name + ".html", true);
		this._warningsFileHead(this.files.warningsAsseco, this.params.warningsFile.asseco.label);

		var _package = Ea.getSelectedObject();
		
		if (_package.instanceOf(Ea.Package._Base)) {
			info("=== Przetwarzam wskazany pakiet: $ ===", [_package.getName()]);
			
			this._processUseCases(_package, 0);

			while(this._packages.length != 0) {
				this._processPackage(this._packages.shift());
			}
		}
		
		this._warningsFileFoot(this.files.warningsZus);
		this.close(this.files.warningsZus);
		this._warningsFileFoot(this.files.warningsAsseco);
		this.close(this.files.warningsAsseco);
		
		/*var convertTo;
		if (convertTo = this.params.convertTo) {
			convertTo.context = this;
			convertTo.outputRoot = this.params.outputRoot;
			Word.htmlToDoc(convertTo);
		}*/

		info("=== KONIEC ===");
	},
	
	_warningsFileHead: function(file, label) {
		this.write(file, Html.templates.htmlHead, {title: label, stylesheet: this.params.styleSheet});
	},
	
	_warningsFileFoot: function(file) {
		this.write(file, Html.templates.statsHead, {name: "Statystyki globalne"});
		for (var category in this.stats) {
			var stats = this.stats[category];
			this.write(file, Html.templates.statsRow, {category: this.category[category].label, checks: stats.checks, total: stats.total});
			for (var id in stats.warnings) {
				var warning = this.warnings[id];
				var number = stats.warnings[id];
				this.write(file, Html.templates.statsRowId, {warning: warning, number: number});
			}
		}
		this.write(file, Html.templates.statsFoot);
		this.write(file, Html.templates.spacer);
		
		this.write(file, Html.templates.htmlFoot);
	},
	
	_processUseCases: function(_package, depth) {
		this.processPackage(this.types.UseCase, _package, depth);
		var packages = _package.getPackages();
		packages.forEach(function(_package) {
			this._processUseCases(_package, depth);
		});
	},
	
	processElement: function(type, element, depth) {
		if (this.params.depth == 0 || depth < this.params.depth)
			this.processPackage(type, element._getPackage(), ++depth);
	},
	
	_packages: [],
	
	processPackage: function(type, _package, depth) {
		
		if (!type.process || type.packages[_package.getGuid()])
			return;

		type.packages[_package.getGuid()] = _package;

		var elements = _package.getElements(type.filter);
		this._packages.push({
			type: type,
			_package: _package,
			depth: depth,
			diagrams: _package.getDiagrams(),
			elements: elements
		});
		
		elements.forEach(function(element) {
			var _element = this.elements[element.getGuid()] = {
				element: element,
				type: type,
				checks: {}
			};
			for (var category in this.category) {
				_element.checks[category] = {
					stats: 0,
					warnings: {}
				};
			}
			
			this.setStats(this.category.alias, element, 1);
			var alias = this.clear(element.getAlias());
			if (!alias) {
				this.addWarning(1, element, [type.label]);
			}
			else {
				if (type.aliases[alias]) {
					this.addWarning(2, element, [type.label, type.aliases[alias].getParent().getQualifiedName(), type.aliases[alias]]);
				}
				type.aliases[alias] = element;
			}

			this.setStats(this.category.name, element, 1);
			if (!element.getName()) {
				this.addWarning(32, element, [type.label]);
			}

			this.setStats(this.category.notes, element, 1);
			if (type.notes && !element.getNotes()) {
				this.addWarning(33, element, [type.label]);
			}
			if (element.getName() && (element.getName() == element.getNotes())) {
				this.addWarning(34, element, [type.label]);
			}
		});
	},
	
	_processPackage: function(_package) {
		var file = this.open(this.params.outputRoot + _package._package.getXmlGuid() + ".html");
		this.write(file, Html.templates.htmlHead, {title: _package.type.title + ": " + _package._package.getName(), stylesheet: this.params.styleSheet});

		_package.diagrams.forEach(function(diagram) {
			this.processDiagram(diagram, file);
		});
		
		_package.elements.forEach(function(element) {
			this.write(file, Html.templates.refName, {guid: element.getXmlGuid().substring(5)});
			Report["process" + _package.type.name](element, ++_package.depth, file);
			this.processWarnings(element);
			this.processWarningsStats(element, file);
		});
		
		this.write(file, Html.templates.htmlFoot);
		this.close(file);
		Ea.Application.getRepository().cacheInfo();
	},
	
	processUseCase: function(useCase, depth, file) {
		Ea.log(useCase);
		
		// ## pocz¹tek tabeli ##
		this.write(file, Html.templates.useCaseHead, {key: this.format(useCase.getAlias()), value: this.format(useCase.getName())});

		/*
		 * Informacje podstawowe
		 */
		this.write(file, Html.templates.useCaseRowPlain, {key: "Stereotyp", value: this.format(useCase.getStereotype())});
		this.write(file, Html.templates.useCaseRowPlain, {key: "Opis", value: this.format(useCase.getNotes())});
		
		/*
		 * Informacje techniczne
		 */
		var list = "";
		list = list + "<li><b>Autor:</b> " + useCase.getAuthor() + "</li>";
		list = list + "<li><b>Data utworzenia:</b> " + useCase.getCreated()._toString() + "</li>";
		list = list + "<li><b>Data ostatniej modyfikacji:</b> " + useCase.getModified()._toString() + "</li>";
		this.write(file, Html.templates.useCaseRowList, {key: "Informacje techniczne", value: "", list: list});

		/*
		 * Informacje szczegó³owe
		 */
		var link = this.getLink(useCase, useCase.getAlias(), true);
		this.write(file, Html.templates.useCaseRowPlain, {key: "Szczegó³y", value: this.format("<b>" + link + "</b> " + useCase.getName())});
		
		// ## koniec tabeli ##
		this.write(file, Html.templates.useCaseFoot);
		this.write(file, Html.templates.spacer);
		
		this._processUseCaseDetails(useCase, depth);
	},
	
	_processUseCaseDetails: function(useCase, depth) {
		Ea.log(useCase);
		
		var file = this.open(this.params.outputRoot + useCase.getXmlGuid() + ".html");
		this.write(file, Html.templates.htmlHead, {title: useCase.getAlias() + " " + useCase.getName(), stylesheet: this.params.styleSheet});

		// ## pocz¹tek tabeli ##
		this.write(file, Html.templates.useCaseHead, {key: this.format(useCase.getAlias()), value: this.format(useCase.getName())});

		/*
		 * Informacje podstawowe
		 */
		this.write(file, Html.templates.useCaseRowPlain, {key: "Stereotyp", value: this.format(useCase.getStereotype())});
		this.write(file, Html.templates.useCaseRowPlain, {key: "Opis", value: this.format(useCase.getNotes())});
		
		/*
		 * Informacje techniczne
		 */
		var list = "";
		list = list + "<li><b>Autor:</b> " + useCase.getAuthor() + "</li>";
		list = list + "<li><b>Data utworzenia:</b> " + useCase.getCreated()._toString() + "</li>";
		list = list + "<li><b>Data ostatniej modyfikacji:</b> " + useCase.getModified()._toString() + "</li>";
		this.write(file, Html.templates.useCaseRowList, {key: "Informacje techniczne", value: "", list: list});
		
		/*
		 * Aktorzy dla przypadku u¿ycia
		 */
		list = "";
		var actors = useCase.getRelationships(null, Ea.Element.Actor);
		actors.forEach(function(property) {
			var ro = "";
			var actor = property.getTo();
			if (property.getRelation() != "links from") {
				// TODO byæ mo¿e w ogóle trzeba odfiltrowaæ inne typy powi¹zañ(?)
			}
			this.processElement(this.types.Actor, actor, depth);
			// TODO aktor jest specjalizacj¹ innego aktora, który równie¿ wystêpuje na liœcie aktorów przypadku u¿ycia
			// TODO jak wy¿ej - dodatkowo mo¿na sprawdziæ w górê hierarchii przypadków u¿ycia
			var link = this.getLink(actor, actor.getAlias());
			ro = ro + "<b>" + link + "</b> " + actor.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.useCaseRowList, {key: "Aktorzy", value: "", list: this.format(list)});

		/*
		 * Wymagania realizowane przez przypadek u¿ycia
		 */
		list = "";
		var requirements = useCase.getRelationships(null, Ea.Element.Requirement);
		this.setStats(this.category.relation, useCase, requirements.size);
		requirements.forEach(function(property) {
			var ro = "";
			var requirement = property.getTo();
			if (property.getRelation() != "implements") {
				this.addWarning(4, useCase, [requirement]);
			}
			this.processElement(this.types.Requirement, requirement, depth);
			var link = this.getLink(requirement, requirement.getAlias());
			ro = ro + "<b>" + link + "</b> " + requirement.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.useCaseRowList, {key: "Realizowane wymagania", value: "", list: this.format(list)});

		/*
		 * Zale¿noœci przypadków u¿ycia pomiêdzy sob¹
		 */
		var useCases = useCase.getRelationships(null, Ea.Element.UseCase);
		var context = {
				useCase: useCase,
				include: {},
				extended: {},
				specializes: {},
				validAliases: {},
				rules: {},
				scenario: {
					include: {},
					extended: {},
					rules: {},
					types: {}
				},
				types: {},
				useCases: {}
			};
		
		// przypadek u¿ycia jest specjalizacj¹
		list="";
		useCases.filter("this.getRelation() == 'subtype of'").forEach(function(property) {
			var ro = "";
			var useCase = property.getTo();
			context.specializes[useCase.getGuid()] = useCase;
			context.validAliases[useCase.getAlias()] = useCase;
			this.processElement(this.types.UseCase, useCase, depth);
			var link = useCase.getAlias();
			link = this.getLink(useCase, link);
			ro = ro + "<b>" + link + "</b> " + useCase.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.useCaseRowList, {key: "Specjalizuje", value: "", list: this.format(list)});
		
		// przypadek u¿ycia jest generalizacj¹
		list="";
		useCases.filter("this.getRelation() == 'supertype of'").forEach(function(property) {
			var ro = "";
			var useCase = property.getTo();
			this.processElement(this.types.UseCase, useCase, depth);
			var link = useCase.getAlias();
			link = this.getLink(useCase, link);
			ro = ro + "<b>" + link + "</b> " + useCase.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.useCaseRowList, {key: "Generalizuje (ma specjalizacje)", value: "", list: this.format(list)});

		// przypadek u¿ycia w³¹cza
		list="";
		var includes = useCases.filter("this.getRelation() == 'links to' && this.getTo().instanceOf(Ea.Element.UseCase) && this.getConnector().getStereotype() == 'include'");
		this.setStats(this.category.relation, useCase, includes.size);
		includes.forEach(function(property) {
			var ro = "";
			var useCase = property.getTo();
			context.include[useCase.getGuid()] = useCase;
			context.validAliases[useCase.getAlias()] = useCase;
			this.processElement(this.types.UseCase, useCase, depth);
			var link = useCase.getAlias();
			link = this.getLink(useCase, link);
			ro = ro + "<b>" + link + "</b> " + useCase.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.useCaseRowList, {key: "W³¹cza<br><span class=\"code\">--&nbsp;include&nbsp;--&gt;</span>", value: "", list: this.format(list)});
		
		// przypadek u¿ycia jest w³¹czany
		list="";
		useCases.filter("this.getRelation() == 'links from' && this.getTo().instanceOf(Ea.Element.UseCase) && this.getConnector().getStereotype() == 'include'").forEach(function(property) {
			var ro = "";
			var useCase = property.getTo();
			this.processElement(this.types.UseCase, useCase, depth);
			var link = useCase.getAlias();
			link = this.getLink(useCase, link);
			ro = ro + "<b>" + link + "</b> " + useCase.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.useCaseRowList, {key: "Jest w³¹czany przez<br><span class=\"code\">&lt;--&nbsp;include&nbsp;--</span>", value: "", list: this.format(list)});

		// przypadek u¿ycia rozszerza
		list="";
		useCases.filter("this.getRelation() == 'links to' && this.getTo().instanceOf(Ea.Element.UseCase) && this.getConnector().getStereotype() == 'extend'").forEach(function(property) {
			var ro = "";
			var useCase = property.getTo();
			this.processElement(this.types.UseCase, useCase, depth);
			var link = useCase.getAlias();
			link = this.getLink(useCase, link);
			ro = ro + "<b>" + link + "</b> " + useCase.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.useCaseRowList, {key: "Rozszerza<br><span class=\"code\">--&nbsp;extend&nbsp;--&gt;</span>", value: "", list: this.format(list)});

		// przypadek u¿ycia jest rozszerzany
		list="";
		var extendeds = useCases.filter("this.getRelation() == 'links from' && this.getTo().instanceOf(Ea.Element.UseCase) && this.getConnector().getStereotype() == 'extend'");
		this.setStats(this.category.relation, useCase, extendeds.size);
		extendeds.forEach(function(property) {
			var ro = "";
			var useCase = property.getTo();
			context.extended[useCase.getGuid()] = useCase;
			context.validAliases[useCase.getAlias()] = useCase;
			this.processElement(this.types.UseCase, useCase, depth);
			var link = useCase.getAlias();
			link = this.getLink(useCase, link);
			ro = ro + "<b>" + link + "</b> " + useCase.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.useCaseRowList, {key: "Jest rozszerzany przez<br><span class=\"code\">&lt;--&nbsp;extend&nbsp;--</span>", value: "", list: this.format(list)});

		/*
		 * Aktywnoœci procesów biznesowych wspierane przez przypadek u¿ycia
		 */
		list = "";
		var processActivities = useCase.getRelationships(null, "this.instanceOf(Ea.Element.Activity) && this.getTaggedValues().get('BPMNVersion')");
		this.setStats(this.category.relation, useCase, processActivities.size);
		var processes = {};
		processActivities.forEach(function(property) {
			var activity = property.getTo();
			this.processElement(this.types.BusinessTask, activity, depth);
			var process = activity.getParent();
			if (!processes[process.getGuid()]) {
				processes[process.getGuid()] = {
					process: process,
					activities: new Core.Types.Collection()
				};
			}
			processes[process.getGuid()].activities.add(property);
		});
		for (guid in processes) {
			var process = processes[guid];
			list = list + "<b>" + process.process.getAlias() + "</b> " + process.process.getName() + ":<ul>";
			process.activities.forEach(function(property) {
				var ro = "";
				var activity = property.getTo();
				if (property.getRelation() != "implements") {
					this.addWarning(5, useCase, [activity]);
				}
				var link = this.getLink(activity, activity.getAlias());
				ro = ro + "<b>" + link + "</b> " + activity.getName();
				list = list + "<li>" + ro + "</li>";
			});
			list = list + "</ul>";
		}
		this.write(file, Html.templates.useCaseRowPlain, {key: "Wspierane procesy biznesowe", value: this.format(list)});
		
		/*
		 * Ograniczenia
		 */
		var conditions = useCase.getConstraints();
		
		// Warunki pocz¹tkowe
		list = "";
		var preconditions = conditions.filter("this.getType() == 'Pre-condition'");
		if (preconditions.notEmpty()) {
			this.setStats(this.category.rule, useCase, preconditions.size);
			if (preconditions.size == 1 && /^(brak|brakwarunk[oó]wpocz[a¹]tkowych)$/i.test(this.clear(preconditions.first().getNotes()).replace(/[\s\.,\-!]/g, ""))) {
				this.addWarning(29, useCase, [preconditions.first()]);
			}
			preconditions.forEach(function(condition) {
				var ro = "";
				ro = ro + "<b>" + condition.getName() + "</b> " + condition.getNotes();
				list = list + "<li>" + ro + "</li>";
			});
			this.write(file, Html.templates.useCaseRowList, {key: "Warunki pocz¹tkowe", value: "", list: this.format(list)});
		}
		
		// Warunki koñcowe
		list = "";
		var postconditions = conditions.filter("this.getType() == 'Post-condition'");
		if (postconditions.notEmpty()) {
			this.setStats(this.category.rule, useCase, postconditions.size);
			if (postconditions.size == 1 && /^(brak|brakwarunk[oó]wko[nñ]cowych)$/i.test(this.clear(postconditions.first().getNotes()).replace(/[\s\.,\-!]/g, ""))) {
				this.addWarning(30, useCase, [postconditions.first()]);
			}
			postconditions.forEach(function(condition) {
				var ro = "";
				ro = ro + "<b>" + condition.getName() + "</b> " + condition.getNotes();
				list = list + "<li>" + ro + "</li>";
			});
			this.write(file, Html.templates.useCaseRowList, {key: "Warunki koñcowe", value: "", list: this.format(list)});
		}

		// ## koniec tabeli ##
		this.write(file, Html.templates.useCaseFoot);

		/*
		 * Diagramy aktywnoœci
		 */
		var diagrams = this.processActivityDiagram(useCase);
		diagrams.forEach(function(diagram) {
			this.processDiagram(diagram, file);
		});
		this.write(file, Html.templates.spacer);
		
		var canEmpty = function() {
			return useCase.getStereotype() == "abstract" || useCase.isAbstract() || useCase.getRelated("supertype of").notEmpty();
		};
		
		/*
		 * Scenariusze
		 */
		var scenarios = useCase.getScenarios();
		this.setStats(this.category.scenario, useCase, 1);

		if (scenarios.notEmpty()) {
			
			var contextReferences = useCase.getContextReferences();
			contextReferences.filter("this.getSupplier().instanceOf(Ea.Element.Type)").forEach(function(reference) {
				context.types[reference.getSupplier().getName().toUpperCase()] = reference.getSupplier();
			});
			contextReferences.filter("this.getSupplier().instanceOf(Ea.Element.UseCase)").forEach(function(reference) {
				context.useCases[reference.getSupplier().getName()] = reference.getSupplier();
			});
			
			// Scenariusz g³ówny
			try {
				var basic = useCase.getBasicScenario();
				this.setStats(this.category.scenario, useCase, 1);
				if (basic)
					this.processScenario(basic, context, null, depth, file);
				else
					this.addWarning(7, useCase);
			}
			catch(e) {
				this.addWarning(8, useCase);
			}
			
			// Rozszerzenia
			var extensions = useCase.getScenarioExtensions();
			this.setStats(this.category.scenario, useCase, extensions.size);
			extensions.forEach(function(extension) {
				this.processScenario(extension.getScenario(), context, extension, depth, file);
			});
			
			// regu³y scenariuszy
			for (var guid in context.include) {
				if (!context.scenario.include[guid]) {
					this.addWarning(9, useCase, [context.include[guid]]);
				}
			}
			for (var guid in context.extended) {
				if (!context.scenario.extended[guid]) {
					this.addWarning(10, useCase, [context.extended[guid]]);
				}
			}
			var typeUsage = {
				reference: 0,
				name: 0,
				total: 0
			};
			for (var typeName in context.scenario.types) {
				typeUsage[context.scenario.types[typeName] ? "reference" : "name"]++;
				typeUsage.total++;
			}
			this.setStats(this.category.scenario, useCase, 1);
			if (typeUsage.total == 0 && !canEmpty()) {
				this.addWarning(24, useCase);
			}
			this.setStats(this.category.diagram, useCase, 1);
			if (diagrams.isEmpty())
				this.addWarning(6, useCase);
		}
		else {
			if (!canEmpty())
				this.addWarning(11, useCase);
		}
		
		/*
		 * Regu³y
		 */
		var rules = conditions.filter("this.getType() == 'Process' || this.getType() == 'Invariant'");
		if (rules.notEmpty()) {
			this.processRules(context, rules, file, depth);
		}
		for (var ruleRef in context.scenario.rules) {
			if (!context.rules[ruleRef]) {
				this.addWarning(12, useCase, [ruleRef]);
			}
		}
		
		/*
		 * Problemy - statystyki
		 */
		this.write(file, Html.templates.spacer);
		this.processWarningsStats(useCase, file);
		
		this.write(file, Html.templates.htmlFoot);
		this.close(file);
	},
	
	_stepType: {
		System: "System",
		Actor: "U¿ytkownik"
	},
	
	//_steps: {},
	
	processScenario: function(scenario, context, extension, depth, file) {
		this.write(file, Html.templates.scenarioHead, {name: this.format(scenario.getName())});
		
		if (extension) {
			this.write(file, Html.templates.scenarioExtension, {value: "Od kroku " + extension.getLevel() + " przebiegu podstawowego"});
		}
		
		var steps = scenario.getSteps();
		this.setStats(this.category.step, context.useCase, steps.size);
		steps.forEach(function(step) {
			
			/*if (this._steps[step.getGuid()]) {
				info("!!! $: $", [step.getGuid(), step.getName()]);
			}
			else {
				this._steps[step.getGuid()] = step;
			}*/
			
			var number = step.getLevel();
			var action = this.format(step.getName());
			var actionRaw = this.clear(step.getName()).trim();
			var business = false;
			actionRaw = actionRaw.replace(/^biz[\s\-]*/i, function() {
				business = true;
				return "";
			});
			var genSpec = false;
			actionRaw = actionRaw.replace(/^\s*\[([^\]]+)\]\s*$/, function(whole, content) {
				genSpec = true;
				return content;
			});
			/*
			 * Wyszukiwanie wzorców w³¹czania/rozszerzania
			 */
			var link = step.getLink();
			var fakeLink = null;
			if (link) {
				if (!/&lt;(include|extend)&gt;/.test(action)) {
					fakeLink = link;
					link = null;
				};
			}
			if (fakeLink) {
				warn("Wykryto przeterminowany link (w³¹czanie/rozszerzanie) na poziomie kroku scenariusza przypadku u¿ycia: $", [context.useCase.getAlias()]);
			}
			var linkString = "";
			var direction = null;
			if (link) {
				this.setStats(this.category.step, context.useCase, 1);
				linkString = this.getLink(link, link.getAlias());
				var regExp = null;
				try {
					regExp = new RegExp("&lt;(include|extend)&gt;\\s*(" + link.getName() + ")?", "i");
				}
				catch (exception) {
					warn("Nazwa w³¹czanego/rozszerzaj¹cego (przez link) przypadku zawiera niedozwolone znaki: $", [link.getName()]);
				}
				action = action.replace(regExp, function(whole, _direction, name) {
					direction = _direction;
					return "&lt;" + _direction + "&gt; (" + linkString + ")" + (name ? " " + name : "");
				});
				if (!direction) {
					this.addWarning(13, context.useCase, [number, scenario]);
				}
			}
			else {
				for (var linkName in context.useCases) {
					var regExp = null;
					try {
						regExp = new RegExp("<(include|extend)>.*(" + linkName + ")", "i");
					}
					catch (exception) {
						warn("Nazwa potencjalnie w³¹czanego/rozszerzaj¹cego przypadku zawiera niedozwolone znaki: $", [linkName]);
					}
					finally {
						actionRaw.replace(regExp, function(whole, dir, name) {
							direction = dir;
							link = context.useCases[linkName];
							linkString = Report.getLink(link, link.getAlias());
							action = action.replace(new RegExp(link.getAlias(), "i"), linkString);
							return "";
						});
					}
					if (direction)
						break;
				}
			}
			if (link) {
				this.setStats(this.category.step, context.useCase, 2);
				if (direction == "include") {
					context.scenario.include[link.getGuid()] = link;
					if (!context.include[link.getGuid()]) {
						this.addWarning(14, context.useCase, [number, scenario]);
					}
					if (extension) {
						this.addWarning(15, context.useCase, [number, scenario]);
					}
				}
				else {
					context.scenario.extended[link.getGuid()] = link;
					if (!context.extended[link.getGuid()]) {
						this.addWarning(16, context.useCase, [number, scenario]);
					}
					if (!extension) {
						this.addWarning(17, context.useCase, [number]);
					}
				}
			}
			
			/*
			 * Wzorce regu³ w kroku scenariusza
			 */
			var rules = {};
			this.clear(step.getName()).replace(/\s/g, "").replace(/[\(\[](R\d[\d\.,R]*)[\)\]]/g, function(whole, match) {
				//match = match.replace(/,/g, ", ");
				var _rules = match.split(",");
				Report.setStats(Report.category.scenario, context.useCase, _rules.length);
				for (var ri = 0; ri < _rules.length; ri++) {
					var rule = _rules[ri];
					context.scenario.rules[rule] = true;
					rules[rule] = "<a href=\"#" + rule + "\">" + rule + "</a>";
				}
				return "";
			});
			
			/*
			 * Przesuwane grupy danych
			 */
			var type = step.getStepType();
			var stepContext = {
				scenario: scenario,
				step: step,
				type: type,
				input: {},
				output: {}
			};
			var input = this.processStepTypes("input", step.getUses(), context, stepContext, depth);
			var output = this.processStepTypes("output", step.getResults(), context, stepContext, depth);
			var _rules = "";
			for (var rule in rules) {
				_rules = _rules + (_rules ? ", " : "") + rules[rule];
			}

			/*
			 * Sprawdzanie regu³ spójnoœci
			 */
			if (type == "Actor") {
				this.setStats(this.category.step, context.useCase, 2);
				if (/^system/i.test(actionRaw)) {
					this.addWarning(26, context.useCase, [number, scenario]);
				}
			}
			else if (type == "System") {
				this.setStats(this.category.step, context.useCase, 2);
				if (/^u[z¿]ytkownik/i.test(actionRaw)) {
					this.addWarning(26, context.useCase, [number, scenario]);
				}
				if (!direction && !genSpec && !input && !output && !_rules) {
					this.addWarning(36, context.useCase, [number, scenario]);
				}
			}
			actionRaw.replace(new RegExp(this.types.UseCase.pattern, "g"), function(alias) {
				Report.setStats(Report.category.step, context.useCase, 1);
				if (!genSpec && !context.validAliases[alias]) {
					Report.addWarning(31, context.useCase, [number, scenario, alias]);
				}
			}); 
			
			/*
			 * Generowanie wyjœcia do raportu
			 */
			this.write(file, Html.templates.scenarioStep, {
				number: number,
				type: this._stepType[type],
				action: action,
				business: business,
				genSpec: genSpec,
				rules: _rules,
				input: input,
				output: output,
				include: direction == "include" ? linkString : "",
				extended: direction == "extend" ? linkString : ""
			});
		});

		if (extension) {
			var join = extension.getJoiningStep();
			if (join)
				this.write(file, Html.templates.scenarioExtension, {value: "Powrót do kroku " + join.getLevel() + " przebiegu podstawowego"});
		}
		
		this.write(file, Html.templates.scenarioFoot);
		this.write(file, Html.templates.spacer);
	},
	
	processStepTypes: function(direction, string, context, stepContext, depth) {

		string = string.trim();
		if (!string)
			return "";
		var types = this.clear(string).replace(/\)\s*,/g, "),").replace(/[<>]/g, "").split("),");
		string = string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		
		this.setStats(this.category.type, context.useCase, types.length);
		for (var t = 0; t < types.length; t++) {
			var typeName = "";
			var moves = [];
			types[t].replace(/^\s*([^\(]+)\(\s*([^\)]+)\)?\s*$/, function(whole, _typeName, _moves) {
				typeName = _typeName.trim();
				_moves = _moves.split(",");
				if (_moves.length > 1) {
					Report.addWarning(28, context.useCase, [stepContext.step.getLevel(), stepContext.scenario, typeName, _moves]);
				}
				for (var mi = 0; mi < _moves.length; mi++) {
					var _move = _moves[mi].replace(/[\s0]/g, "");
					moves.push(_move);
				}
			});
			var type = null;
			if (type = context.types[typeName.toUpperCase()]) {
				this.processElement(this.types.Type, type, depth);
				var typeLink = this.getLink(type, typeName);
				string = string.replace(new RegExp(typeName, "gi"), typeLink);
			}
			else {
				if (!/^parametry?(uruchomieniow[ey])?$/i.test(typeName.replace(/\s/g, ""))) {
					if (!typeName.trim())
						this.addWarning(37, context.useCase, [stepContext.step.getLevel(), stepContext.scenario]);
					else	
						this.addWarning(18, context.useCase, [typeName, stepContext.step.getLevel(), stepContext.scenario]);
				}
			}
			context.scenario.types[typeName] = type;
			/*if (moves.length == 0)
				info("$, {$}, {$}", [moves, types[t], typeName]);*/
			for (var mi = 0; mi < moves.length; mi++) {
				var move = moves[mi];
				if (!stepContext[direction][move])
					stepContext[direction][move] = {};
				stepContext[direction][move][typeName] = type;
				if (!stepContext[direction]._all)
					stepContext[direction]._all = {};
				stepContext[direction]._all[typeName] = type;
				if (stepContext.type == "System") {
					this.setStats(this.category.type, context.useCase, 1);
					if (direction == "input") {
						if (!/^[RE]/.test(move))
							this.addWarning(35, context.useCase, [move, typeName, stepContext.step.getLevel(), stepContext.scenario]);
					}
					else {
						if (!/^[WX]/.test(move))
							this.addWarning(35, context.useCase, [move, typeName, stepContext.step.getLevel(), stepContext.scenario]);
					}
					
					if (stepContext.input._all || stepContext.output._all) {
					}
				}
				else if (stepContext.type == "Actor") {
					if (!/^E/.test(move)) {
						this.addWarning(27, context.useCase, [stepContext.step.getLevel(), stepContext.scenario, typeName, move]);
					}
				}
			}
		}
		string = "<li>" + this.format(string).replace(/\)\s*(<\/span>\s*)?,/g, ")</li><li>") + "</li>";
		return string;
	},
	
	processRules: function(context, rules, file, depth) {
		
		this.setStats(this.category.rule, context.useCase, rules.size);
		var number = rules.size;
		
		if (number == 1 && /^(brak|brakregu³)$/i.test(this.clear(rules.first().getNotes()).replace(/[\s\.,\-!]/g, ""))) {
			this.addWarning(19, context.useCase, [rules.first()]);
			number = 0;
		}
		if (number) {
			this.write(file, Html.templates.rulesHead, {name: "Regu³y"});
			rules.forEach(function(rule) {
				
				// TODO wzorzec klasy, która nie jest uwzglêdniona w krokach odwo³uj¹cych siê do regu³y
				
				var name = rule.getName().replace(/^[\sr]*/i, "").replace(/\s*$/, "");
				var ref = "R" + this.clear(name).replace(/\s/g, "").replace(/[\.\s]+$/, "");
				if (context.rules[ref]) {
					this.addWarning(20, context.useCase, [rule, context.rules[ref]]);
				}
				context.rules[ref] = rule;
				if (!context.scenario.rules[ref]) {
					this.addWarning(21, context.useCase, [rule]);
				}
				var link = "<a name=\"" + ref + "\">" + this.format(name) + "</a>";
				var notes = rule.getNotes();
				
				if (!this.clear(notes)) {
					this.addWarning(19, context.useCase, [rule]);
				}

				var messages = "";
				this.clear(notes).replace(new RegExp(this.types.Message.pattern, "g"), function(messageRef) {
					Report.setStats(Report.category.message, context.useCase, 1);
					if (!Report.types.Message.aliases[messageRef]) {
						var matching = Report._findMessage(messageRef);
						matching.forEach(function(message) {
							Report.processElement(Report.types.Message, message, depth);
						});
					}
					var message = Report.types.Message.aliases[messageRef];
					if (message) {
						var link = Report.getLink(message, messageRef);
						messages = messages + link + "<br>" + message.getName() + "<br>";
						notes = notes.replace(messageRef, link);
					}
					else {
						Report.addWarning(22, context.useCase, [messageRef]);
						messages = messages + messageRef + "<br>";
					}
					
					return "";
				});
				this.write(file, Html.templates.rulesRule, {key: link, value: this.format(notes), messages: this.format(messages)});
			});
		}
		this.write(file, Html.templates.rulesFoot);
	},
	
	_findMessage: function(alias) {
		return Ea.Application.getRepository().getByQuery(Ea.Element._Base, "t_object", "Alias", "\"" + alias + "\"", "Object_ID");
	},
	
	_isAbstract: function(type) {
		return type.isAbstract() || type.getStereotype() == "abstract";
	},
	
	processType: function(type, depth, file) {
		Ea.log(type);

		this.setStats(this.category.relation, type, 1);
		if (this._isAbstract(type) && type.getRelated("supertype of").isEmpty()) {
			this.addWarning(23, type);
		}
		
		// TODO Typ danych - kandydat na enumeracjê
		
		// ## pocz¹tek tabeli ##
		this.write(file, Html.templates.typeHead, {type: type, key: this.format(type.getAlias()), value: this.format(type.getName())});

		/*
		 * Informacje podstawowe
		 */
		this.write(file, Html.templates.typeRowPlain, {key: "Stereotyp", value: this.format(type.getStereotype())});
		this.write(file, Html.templates.typeRowPlain, {key: "Abstrakcyjna", value: this.format(type.isAbstract() ? "Tak" : "Nie")});
		this.write(file, Html.templates.typeRowPlain, {key: "Opis", value: this.format(type.getNotes())});
		
		/*
		 * Informacje techniczne
		 */
		var list = "";
		list = list + "<li><b>Autor:</b> " + type.getAuthor() + "</li>";
		list = list + "<li><b>Data utworzenia:</b> " + type.getCreated()._toString() + "</li>";
		list = list + "<li><b>Data ostatniej modyfikacji:</b> " + type.getModified()._toString() + "</li>";
		this.write(file, Html.templates.typeRowList, {key: "Informacje techniczne", value: "", list: list});

		/*
		 * Hierarchia typów
		 */
		var types = type.getRelationships(null, Ea.Element.Type);

		// generalizacje typu
		list="";
		types.filter("this.getRelation() == 'subtype of'").forEach(function(property) {
			var ro = "";
			var type = property.getTo();
			this.processElement(this.types.Type, type, depth);
			var link = type.getAlias();
			link = this.getLink(type, link);
			ro = ro + "<b>" + link + "</b> " + type.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.typeRowList, {key: "Specjalizuje", value: "", list: this.format(list)});
		
		// spacjalizacje typu
		list="";
		types.filter("this.getRelation() == 'supertype of'").forEach(function(property) {
			var ro = "";
			var type = property.getTo();
			this.processElement(this.types.Type, type, depth);
			var link = type.getAlias();
			link = this.getLink(type, link);
			ro = ro + "<b>" + link + "</b> " + type.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.typeRowList, {key: "Generalizuje", value: "", list: this.format(list)});

		// ## koniec tabeli ##
		this.write(file, Html.templates.typeFoot);

		if (type.instanceOf(Ea.Element.Classifier)) {
			if (type.instanceOf(Ea.Element.Enumeration)) {
				var literals = type.getLiterals();
				if (literals.notEmpty()) {
					this.write(file, Html.templates.literalsHead);
					literals.forEach(function(literal) {
						var name = this.format(literal.getName());
						var notes = this.format(literal.getNotes());
						this.write(file, Html.templates.literal, {name: name, notes: notes});
					});
					this.write(file, Html.templates.literalsFoot);
				}
				else {
					// TODO Enumeracja nie posiada litera³ów
				}
			}
			else {
				var attributes = type.getAttributes();
				if (attributes.notEmpty()) {
					this.write(file, Html.templates.attributesHead);
					attributes.forEach(function(attribute) {
						var name = this.format(attribute.getName());
						var type = attribute.getType();
						var typeName;
						if (type) {
							typeName = this.format(type.getName());
							if (Ea.Element.Class.isInstance(type)) {
								this.processElement(this.types.Type, type, depth);
								typeName = this.getLink(type, typeName);
							}
							else if (Ea.Element.Enumeration.isInstance(type)) {
								this.processElement(this.types.Type, type, depth);
								typeName = this.getLink(type, typeName);
							}
							else {
								// TODO typ jest inny ni¿ jeden ze zdefiniowanych typów prymitywnych
							}
						}
						else
							typeName = "";
						var notes = this.format(attribute.getNotes());
						this.write(file, Html.templates.attribute, {name: name, type: typeName, notes: notes});
					});
					this.write(file, Html.templates.attributesFoot);
				}
				else {
					// TODO Klasa bêd¹ca liœciem nie posiada atrybutów
				}
			}
		}
		
		this.write(file, Html.templates.spacer);
	},
	
	processRequirement: function(requirement, depth, file) {
		Ea.log(requirement);
		
		// ## pocz¹tek tabeli ##
		this.write(file, Html.templates.requirementHead, {key: this.format(requirement.getAlias()), value: this.format(requirement.getName())});

		/*
		 * Informacje podstawowe
		 */
		this.write(file, Html.templates.requirementRowPlain, {key: "Stereotyp", value: this.format(requirement.getStereotype())});
		this.write(file, Html.templates.requirementRowPlain, {key: "Opis", value: this.format(requirement.getNotes())});
		
		/*
		 * Informacje techniczne
		 */
		var list = "";
		list = list + "<li><b>Autor:</b> " + requirement.getAuthor() + "</li>";
		list = list + "<li><b>Data utworzenia:</b> " + requirement.getCreated()._toString() + "</li>";
		list = list + "<li><b>Data ostatniej modyfikacji:</b> " + requirement.getModified()._toString() + "</li>";
		this.write(file, Html.templates.requirementRowList, {key: "Informacje techniczne", value: "", list: list});
		
		/*
		 * Przypadki u¿ycia realizuj¹ce wymaganie
		 */
		list = "";
		var useCases = requirement.getRelationships(null, Ea.Element.UseCase);
		this.setStats(this.category.relation, requirement, 1);
		if (useCases.notEmpty()) {
			useCases.forEach(function(property) {
				var ro = "";
				if (property.getRelation() != "realized by") {
					// TODO b³êdy typ powi¹zania
				}
				var useCase = property.getTo();
				this.processElement(this.types.UseCase, useCase, depth);
				var link = this.getLink(useCase, useCase.getAlias());
				ro = ro + "<b>" + link + "</b> " + useCase.getName();
				list = list + "<li>" + ro + "</li>";
			});
		}
		else {
			this.addWarning(25, requirement);
		}
		this.write(file, Html.templates.requirementRowList, {key: "Realizuj¹ce przypadki u¿ycia", value: "", list: this.format(list)});

		// ## koniec tabeli ##
		this.write(file, Html.templates.requirementFoot);
		this.write(file, Html.templates.spacer);
	},
	
	processMessage: function(message, depth, file) {
		Ea.log(message);
		
		// ## pocz¹tek tabeli ##
		this.write(file, Html.templates.messageHead, {key: this.format(message.getAlias()), value: this.format(message.getName())});

		/*
		 * Informacje podstawowe
		 */
		this.write(file, Html.templates.messageRowPlain, {key: "Stereotyp", value: this.format(message.getStereotype())});
		this.write(file, Html.templates.messageRowPlain, {key: "Opis", value: this.format(message.getNotes())});
		
		/*
		 * Informacje techniczne
		 */
		var list = "";
		list = list + "<li><b>Autor:</b> " + message.getAuthor() + "</li>";
		list = list + "<li><b>Data utworzenia:</b> " + message.getCreated()._toString() + "</li>";
		list = list + "<li><b>Data ostatniej modyfikacji:</b> " + message.getModified()._toString() + "</li>";
		this.write(file, Html.templates.messageRowList, {key: "Informacje techniczne", value: "", list: list});
		
		// ## koniec tabeli ##
		this.write(file, Html.templates.messageFoot);
		this.write(file, Html.templates.spacer);
	},
	
	processActor: function(actor, depth, file) {
		Ea.log(actor);
		
		// ## pocz¹tek tabeli ##
		this.write(file, Html.templates.actorHead, {key: this.format(actor.getAlias()), value: this.format(actor.getName())});

		/*
		 * Informacje podstawowe
		 */
		this.write(file, Html.templates.actorRowPlain, {key: "Stereotyp", value: this.format(actor.getStereotype())});
		this.write(file, Html.templates.actorRowPlain, {key: "Opis", value: this.format(actor.getNotes())});
		
		/*
		 * Informacje techniczne
		 */
		var list = "";
		list = list + "<li><b>Autor:</b> " + actor.getAuthor() + "</li>";
		list = list + "<li><b>Data utworzenia:</b> " + actor.getCreated()._toString() + "</li>";
		list = list + "<li><b>Data ostatniej modyfikacji:</b> " + actor.getModified()._toString() + "</li>";
		this.write(file, Html.templates.actorRowList, {key: "Informacje techniczne", value: "", list: list});
		
		/*
		 * Przypadki u¿ycia
		 */
		list = "";
		var useCases = actor.getRelationships(null, Ea.Element.UseCase);
		this.setStats(this.category.relation, actor, useCases.size);
		useCases.forEach(function(property) {
			var ro = "";
			if (property.getRelation() != "links to") {
				this.addWarning(3, actor, [useCase]);
			}
			var useCase = property.getTo();
			this.processElement(this.types.UseCase, useCase, depth);
			var link = this.getLink(useCase, useCase.getAlias());
			ro = ro + "<b>" + link + "</b> " + useCase.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.actorRowList, {key: "Przypadki u¿ycia", value: "", list: this.format(list)});

		/*
		 * Hierarchia aktorów
		 */
		var actors = actor.getRelationships(null, Ea.Element.Actor);

		// generalizacje aktora
		list="";
		actors.filter("this.getRelation() == 'subtype of'").forEach(function(property) {
			var ro = "";
			var actor = property.getTo();
			this.processElement(this.types.Actor, actor, depth);
			var link = actor.getAlias();
			link = this.getLink(actor, link);
			ro = ro + "<b>" + link + "</b> " + actor.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.actorRowList, {key: "Specjalizuje", value: "", list: this.format(list)});
		
		// spacjalizacje aktora
		list="";
		actors.filter("this.getRelation() == 'supertype of'").forEach(function(property) {
			var ro = "";
			var actor = property.getTo();
			this.processElement(this.types.Actor, actor, depth);
			var link = actor.getAlias();
			link = this.getLink(actor, link);
			ro = ro + "<b>" + link + "</b> " + actor.getName();
			list = list + "<li>" + ro + "</li>";
		});
		this.write(file, Html.templates.actorRowList, {key: "Generalizuje", value: "", list: this.format(list)});

		// ## koniec tabeli ##
		this.write(file, Html.templates.actorFoot);
		this.write(file, Html.templates.spacer);
	},
	
	processBusinessTask: function(activity, depth, file) {

	},
	
	processActivityDiagram: function(useCase) {
		var diagrams = new Core.Types.Collection();
		diagrams.addAll(useCase.getDiagrams(Ea.Diagram.Activity));
		useCase.getElements(Ea.Element.Activity).forEach(function(activity) {
			diagrams.addAll(activity.getDiagrams(Ea.Diagram.Activity));
		});
		return diagrams;
	},
	
	processDiagram: function(diagram, file) {
		if (!file)
			return;
		var elementViews = diagram.getElementViews();
		if (elementViews.notEmpty()) {
			var diagramFile = "diagram_" + diagram.getXmlGuid() + ".png";
			if (diagram.save(this.params.outputRoot + "\\diagrams\\" + diagramFile, this.params.reuseDiagrams)) {
				var dimension = diagram.getCalculated(this.params.diagramMaxWidth, this.params.diagramMaxHeight);
				var dimImg = "";
				if (diagram.scaled) {
					dimImg = " width=\"" + dimension.width + "\" height=\"" + dimension.height + "\"";
				}
				this.write(file, Html.templates.diagram, {filePath: "diagrams\\" + diagramFile, diagram: diagram, dimension: dimImg});
				this.write(file, Html.templates.mapHead, {diagram: diagram});
				elementViews.forEach(function(elementView) {
					if (Ea.Element._Base.isInstance(elementView.getElement())) {
						this.write(file, Html.templates.mapArea, {elementView: elementView, dimension: elementView.getCalculated()});
					}
				});
				this.write(file, Html.templates.mapFoot);
			}
		}
		this.write(file, Html.templates.spacer);
	}
			
};

Report.Warning = define({
	_id: null,
	_constraint: null,
	create: function(id, constraint) {
		this._id = id;
		this._constraint = constraint;
		this._constraint.kind = Report.warning[this._constraint.kind];
		this._constraint.category = Report.category[this._constraint.category];
		Report.warnings[id] = this;
	},
	getId: function() {
		return this._id;
	},
	getCriteria: function() {
		return "{KJ-0000-" + new String(this.getId()).lpad("0", 4) + "}";		
	},
	getDescription: function() {
		return this._constraint.description;
	},
	getMessage: function() {
		return this._constraint.message;
	},
	getCategory: function() {
		return this._constraint.category;
	},
	getKind: function() {
		return this._constraint.kind;
	},
	isReported: function() {
		return this._constraint.reported;
	}
});
