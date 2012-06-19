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

Translator = {
		
	params: {},
		
	dictionary: {
		"Activity": {
			$: "Aktywno��",
			"Ea.Diagram": "Diagram aktywno�ci"
		},
		"Action": {
			$: "Akcja"
		},
		"Actor" : {
			$: "Aktor"
		},
		"Analysis": {
			"Ea.Diagram": "Diagram proces�w"
		},
		"AssociationClass": {
			$: "Klasa asocjacyjna"
		},
		"Attribute": {
			$: "Atrybut"
		},
		"CallBehaviorAction": {
			$: "Akcja"
		},
		"Class": {
			$: "Klasa"
		},
		"Component": {
			$: "Komponent",
			"Ea.Diagram": "Diagram komponent�w"
		},
		"CompositeStructure": {
			"Ea.Diagram": "Diagram struktury"
		},
		"Custom": {
			"Ea.Diagram": "Diagram wymaga�"
		},
		"DecisionNode": {
			$: "Decyzja"
		},
		"Deployment": {
			"Ea.Diagram": "Diagram rozmieszczenia"
		},
		"Diagram": {
			$: "Diagram"
		},
		"Enumeration": {
			$: "Enumeracja"
		},
		"ExpansionRegion": {
			$: "Obszar rozszerzenia"
		},
		"Interface": {
			$: "Interfejs"
		},
		"LocalFile": {
			"Ea.File": "plik lokalny"
		},
		"Logical": {
			"Ea.Diagram": "Diagram logiczny"
		},
		"Meaning": {
			$: "Znaczenie"
		},
		"MergeNode": {
			$: "Z��czenie"
		},
		"Metaclass": {
			$: "Metaklasa"
		},
		"Object": {
			$: "Obiekt",
			"Ea.Diagram": "Diagram obiekt�w"
		},
		"Package": {
			$: "Pakiet",
			"Ea.Diagram": "Diagram pakiet�w"
		},
		"Requirement": {
			$: "Wymaganie"
		},
		"Sequence": {
			"Ea.Diagram": "Diagram sekwencji"
		},
		"Screen": {
			"Ea.Diagram": "Diagram interfejsu u�ytkownika"
		},
		"Statechart": {
			"Ea.Diagram": "Diagram stan�w"
		},
		"StateMachine": {
			$: "Maszyna stan�w"
		},
		"UseCase": {
			$: "Przypadek u�ycia",
			"Ea.Diagram": "Diagram przypadk�w u�ycia"
		},
		"WebAdress": {
			"Ea.File": "adres internetowy"
		}
	},
		
	translate: function(term, context) {
		var ref = Translator.dictionary[term];
		var translation = null;
		if (ref) {
			translation = ref[context] || ref.$;
		}
		if (!translation) {
			translation = term;
		}
		return translation;
	}
};