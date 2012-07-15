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

Ea.register("Ea.ConnectorEnd@Ea.Types.Connector", 22);

Ea.Connector = {};

Ea.Connector._Base = extend(Ea.Types.Named, {
	
	_features: null,
	
	_clientAttribute: null,
	_clientMethod: null,
	_supplierAttribute: null,
	_supplierMethod: null,
	
	_getFeatures: function() {
		if (!this._features || Ea.mm) {
			var features = this._features = {
				client: null,
				supplier: null,
				unknown: null
			};
			var _features = this._getStyleEx();
			_features = _features.replace(/LF([SE])P=(\{[0-9a-z\-]+\})([LR]);/gi, function(match, z1, guid, z2, replaced) {
				var direction = (z1 == "E" ? "supplier" : (z1 == "S" ? "client" : "unknown"));
				features[direction] = guid;
				return "";
			});
			if (this._features.client) {
				this._clientAttribute = Ea.getByGuid(Ea.Attribute._Base, this._features.client);
				this._clientMethod = Ea.getByGuid(Ea.Method._Base, this._features.client);
			}
			if (this._features.supplier) {
				this._supplierAttribute = Ea.getByGuid(Ea.Attribute._Base, this._features.supplier);
				this._supplierMethod = Ea.getByGuid(Ea.Method._Base, this._features.supplier);
			}
		}
	},
	
	getClientAttribute: function() {
		this._getFeatures();
		return this._clientAttribute;
	},
	
	getClientMethod: function() {
		this._getFeatures();
		return this._clientMethod;
	},
	
	getSupplierAttribute: function() {
		this._getFeatures();
		return this._supplierAttribute;
	},
	
	getSupplierMethod: function() {
		this._getFeatures();
		return this._supplierMethod;
	},
	
	getRelation: function(client) {
		return null;
	},
	
	_otherEnd: null,
	
	getOtherEnd: function(thisEnd) {
		if (!this._otherEnd || Ea.mm) {
			this._otherEnd = this.getClient() == thisEnd ? this.getSupplier() : this.getClient();
		}
		return this._otherEnd;
	},
	
	_toString: function() {
		var client = this.getClientEnd().getRole();
		client = client ? " (" + client + ")" : "";
		client = this.getClient()._toString() + client;
		
		var supplier = this.getSupplierEnd().getRole();
		supplier = supplier ? " (" + supplier + ")" : "";
		supplier = this.getSupplier()._toString() + supplier;
		
		var connection = "--" + this.getName() + "-->";
		return client + " " + connection + " " + supplier + " [" + this._class + "]";
	}
},
{
	api: "Connector",
	
	_id: attribute({api: "ConnectorID", type: Number}),
	_guid: attribute({api: "ConnectorGUID"}),
	_type: attribute({api: "Type"}),
	
	_alias: attribute({api: "Alias"}),
	_notes: attribute({api: "Notes"}),
	_stereotype: attribute({api: "Stereotype"}),
	_direction: attribute({api: "Direction"}),

	_eventFlags: attribute({api: "EventFlags"}),
	_metaType: attribute({api: "MetaType", private: true}),
	_miscData0: attribute({api: "MiscData", private: true, index: 0}),
	_miscData1: attribute({api: "MiscData", private: true, index: 1}),
	_miscData2: attribute({api: "MiscData", private: true, index: 2}),
	_miscData3: attribute({api: "MiscData", private: true, index: 3}),
	_miscData4: attribute({api: "MiscData", private: true, index: 4}),

	_client: attribute({api: "ClientID", type: "Ea.Element._Base", referenceBy: "id"}),
	_supplier: attribute({api: "SupplierID", type: "Ea.Element._Base", referenceBy: "id"}),
	
	_clientAttribute: derived({getter: "getClientAttribute", type: "Ea.Attribute._Base"}),
	_clientMethod: derived({getter: "getClientMethod", type: "Ea.Method._Base"}),
	_supplierAttribute: derived({getter: "getSupplierAttribute", type: "Ea.Attribute._Base"}),
	_supplierMethod: derived({getter: "getSupplierMethod", type: "Ea.Method._Base"}),
	
	_clientEnd: attribute({api: "ClientEnd", type: "Ea.ConnectorEnd._Base", aggregation: "composite"}),
	_supplierEnd: attribute({api: "SupplierEnd", type: "Ea.ConnectorEnd._Base", aggregation: "composite"}),
	
	_styleEx: attribute({api: "StyleEx", private: true}),

	_guard: attribute({api: "TransitionGuard"}),
	_transitionAction: attribute({api: "TransitionAction"}),
	_transitionEvent: attribute({api: "TransitionEvent"}),
	_virtualInheritance: attribute({api: "VirtualInheritance"}),

	_tags: attribute({api: "TaggedValues", type: "Ea.Collection.Map", elementType: "Ea.ConnectorTag._Base", key: "this.getName()", value: "this", aggregation: "composite"}),
	_constraints: attribute({api: "Constraints", type: "Ea.Collection._Base", elementType: "Ea.ConnectorConstraint._Base", aggregation: "composite"}),
	_customProperties: attribute({api: "CustomProperties", type: "Ea.Collection.Map", elementType: "Ea.CustomProperty._Base", key: "this.getName()", value: "this.getValue()", aggregation: "composite"}),
	_properties: attribute({api: "Properties", type: "Ea.Properties._Base", elementType: "Ea.Property._Base", key: "this.getName()", value: "this", aggregation: "composite"}),

	getType: function(source) {
		return this._deriveType(source, this._type);
	}
});

Ea.Connector.Aggregation = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "composed of" : "part of";
	}
});

Ea.Connector.Assembly = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	}
});

Ea.Connector.Association = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	}
});

Ea.Connector.Connector = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	}
});

Ea.Connector.ControlFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	}
});

Ea.Connector.Delegate = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	}
});

Ea.Connector.Dependency = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "needed by" : "depends on";
	}
});

Ea.Connector.Deployment = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	}
});

Ea.Connector.Generalization = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "supertype of" : "subtype of";
	}
});

Ea.Connector.InformationFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	}
});

Ea.Connector.Manifest = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	}
});

Ea.Connector.Nesting = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "owns" : "owned by";
	}
});

Ea.Connector.ObjectFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	}
});

Ea.Connector.Realisation = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "realized by" : "implements";
	}
});

Ea.Connector.StateFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	}
});

Ea.Connector.UseCase = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	}
});

Ea.Connector.Sequence = extend(Ea.Connector._Base, {},
{
	_sequenceNo: attribute({api: "SequenceNo", type: Number})
});


Ea.Connector.Relationship = define({
	
	_connector: null,
	_relation: null,
	_isClient: null,

	_guard: null,
	_role: null,

	_to: null,
	_toEnd: null,
	_toAttribute: null,
	_toMethod: null,
	
	_from: null,
	_fromEnd: null,
	_fromAttribute: null,
	_fromMethod: null,
	
	_opposite: null,
	
	create: function(params) {
		
		_super.create(params);
		
		this._connector = params.connector;
		this._isClient = params.isClient;
		this._relation = this._connector.getRelation(!this._isClient);
		
		this._guard = this._connector.getGuard();

		this._from = params.from;
		this._fromEnd = params.fromEnd;
		this._to = params.to;
		this._toEnd = params.toEnd;
		
		this._role = this._toEnd.getRole();

		this._fromAttribute = this._isClient ? this._connector.getSupplierAttribute() : this._connector.getClientAttribute();
		this._fromMethod = this._isClient ? this._connector.getSupplierMethod() : this._connector.getClientMethod();
		this._toAttribute = !this._isClient ? this._connector.getSupplierAttribute() : this._connector.getClientAttribute();
		this._toMethod = !this._isClient ? this._connector.getSupplierMethod() : this._connector.getClientMethod();
		
		this._opposite = params.opposite || new Ea.Connector.Relationship({
			from: params.to, 
			fromEnd: params.toEnd,
			connector: params.connector, 
			isClient: !params.isClient, 
			to: params.from, 
			toEnd: params.fromEnd,
			opposite: this
		});
	},
	
	getFrom: function() {
		return this._from;
	},
	
	getFromEnd: function() {
		return this._fromEnd;
	},
	
	getFromAttribute: function() {
		return this._fromAttribute;
	},
	
	getFromMethod: function() {
		return this._fromMethod;
	},
	
	getName: function() {
		if (this._role)
			return this._role;
		var name = this._to.getName();
		return name.substr(0, 1).toLowerCase() + name.substr(1);
	},
	
	getTo: function() {
		return this._to;
	},
	
	getToEnd: function() {
		return this._toEnd;
	},
	
	getToAttribute: function() {
		return this._toAttribute;
	},
	
	getToMethod: function() {
		return this._toMethod;
	},
	
	getRelation: function() {
		return this._relation;
	},
	
	getConnector: function() {
		return this._connector;
	},
	
	isAggregation: function() {
		return this._fromEnd.getAggregation() != 0;
	},
	
	getAggregation: function() {
		return this._fromEnd.getAggregation();
	},
	
	getMultiplicity: function() {
		return this._toEnd.getCardinality();
	},
	
	isNavigable: function() {
		return this._toEnd.getNavigable() != "Non-Navigable";
	},
	
	getNavigability: function() {
		return this._toEnd.getNavigable();
	},
	
	getOpposite: function() {
		return this._opposite;
	},
	
	isClient: function() {
		return this._isClient;
	},
	
	getGuard: function() {
		return this._guard;
	}
});

Ea.register("Ea.ConnectorTag@Ea.Types.Connector", 36);
Ea.register("Ea.ConnectorConstraint@Ea.Types.Connector", 37);
