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
			$: "Aktywnoœæ",
			"Ea.Diagram": "Diagram aktywnoœci"
		},
		"Action": {
			$: "Akcja"
		},
		"Actor" : {
			$: "Aktor"
		},
		"Analysis": {
			"Ea.Diagram": "Diagram procesów"
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
			"Ea.Diagram": "Diagram komponentów"
		},
		"CompositeStructure": {
			"Ea.Diagram": "Diagram struktury"
		},
		"Custom": {
			"Ea.Diagram": "Diagram wymagañ"
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
			$: "Z³¹czenie"
		},
		"Metaclass": {
			$: "Metaklasa"
		},
		"Object": {
			$: "Obiekt",
			"Ea.Diagram": "Diagram obiektów"
		},
		"Package": {
			$: "Pakiet",
			"Ea.Diagram": "Diagram pakietów"
		},
		"Requirement": {
			$: "Wymaganie"
		},
		"Sequence": {
			"Ea.Diagram": "Diagram sekwencji"
		},
		"Screen": {
			"Ea.Diagram": "Diagram interfejsu u¿ytkownika"
		},
		"Statechart": {
			"Ea.Diagram": "Diagram stanów"
		},
		"StateMachine": {
			$: "Maszyna stanów"
		},
		"UseCase": {
			$: "Przypadek u¿ycia",
			"Ea.Diagram": "Diagram przypadków u¿ycia"
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