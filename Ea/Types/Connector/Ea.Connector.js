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

Ea.Connector._Base = extend(Ea.Named, {
	
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
			_features = _features.replace(/LF([SE])P=({[0-9a-z\-]+})([LR]);/gi, function(match, z1, guid, z2, replaced) {
				var direction = z1 == "E" ? "client" : (z1 == "S" ? "supplier" : "unknown");
				features[direction] = guid;
				return replaced;
			});
			if (this._features.client) {
				try {
					this._clientAttribute = Ea.getByGuid(Ea.Attribute._Base, this._features.client);
				}
				catch (e) {
					this._clientMethod = Ea.getByGuid(Ea.Method._Base, this._features.client);
				}
			}
			if (this._features.supplier) {
				try {
					this._supplierAttribute = Ea.getByGuid(Ea.Attribute._Base, this._features.supplier);
				}
				catch (e) {
					this._supplierMethod = Ea.getByGuid(Ea.Method._Base, this._features.supplier);
				}
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
	
	_id: new Ea.Helper.Property({api: "ConnectorID", type: Number}),
	_guid: new Ea.Helper.Property({api: "ConnectorGUID"}),
	_type: new Ea.Helper.Property({api: "Type"}),
	
	_client: new Ea.Helper.ReferenceById({api: "ClientID", type: "Ea.Element._Base"}),
	_supplier: new Ea.Helper.ReferenceById({api: "SupplierID", type: "Ea.Element._Base"}),
	
	_clientAttribute: new Ea.Helper.CustomProperty({get: "getClientAttribute", type: "Ea.Attribute._Base"}),
	_clientMethod: new Ea.Helper.CustomProperty({get: "getClientMethod", type: "Ea.Method._Base"}),
	_supplierAttribute: new Ea.Helper.CustomProperty({get: "getSupplierAttribute", type: "Ea.Attribute._Base"}),
	_supplierMethod: new Ea.Helper.CustomProperty({get: "getSupplierMethod", type: "Ea.Method._Base"}),
	
	_clientEnd: new Ea.Helper.Reference({api: "ClientEnd", type: "Ea.ConnectorEnd._Base"}),
	_supplierEnd: new Ea.Helper.Reference({api: "SupplierEnd", type: "Ea.ConnectorEnd._Base"}),
	
	_styleEx: new Ea.Helper.Property({api: "StyleEx", private: true}),
	_guard: new Ea.Helper.Property({api: "TransitionGuard"}),

	getType: function(source) {
		var typeName = this._type.get(source).replace(/\s/g,"");
		var type = this.namespace[typeName];
		if (!type) {
			throw new Error("Not implemented Connector type: " + typeName);
		}
		return type;
	}
});

Ea.Connector.Aggregation = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "composed of" : "part of";
	},
	composedOf: function() {
		return this.getSupplier();
	},
	partOf: function() {
		return this.getClient();
	}
});

Ea.Connector.Assembly = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	},
	linksFrom: function() {
		return this.getSupplier();
	},
	linksTo: function() {
		return this.getClient();
	}
});

Ea.Connector.Association = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	},
	linksFrom: function() {
		return this.getSupplier();
	},
	linksTo: function() {
		return this.getClient();
	}
});

Ea.Connector.Collaboration = extend(Ea.Connector._Base, {});

Ea.Connector.CommunicationPath = extend(Ea.Connector._Base, {});

Ea.Connector.Connector = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	},
	linksFrom: function() {
		return this.getSupplier();
	},
	linksTo: function() {
		return this.getClient();
	}
});

Ea.Connector.ControlFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	},
	transitionFrom: function() {
		return this.getSupplier();
	},
	transitionTo: function() {
		return this.getClient();
	}
});

Ea.Connector.Delegate = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	},
	linksFrom: function() {
		return this.getSupplier();
	},
	linksTo: function() {
		return this.getClient();
	}
});

Ea.Connector.Dependency = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "needed by" : "depends on";
	},
	neededBy: function() {
		return this.getSupplier();
	},
	dependsOn: function() {
		return this.getClient();
	}
});

Ea.Connector.Deployment = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	},
	linksFrom: function() {
		return this.getSupplier();
	},
	linksTo: function() {
		return this.getClient();
	}
});

Ea.Connector.ERLink = extend(Ea.Connector._Base, {});

Ea.Connector.Generalization = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "supertype of" : "subtype of";
	},
	supertypeOf: function() {
		return this.getSupplier();
	},
	subtypeOf: function() {
		return this.getClient();
	}
});

Ea.Connector.InformationFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	},
	linksFrom: function() {
		return this.getSupplier();
	},
	linksTo: function() {
		return this.getClient();
	}
});

Ea.Connector.Instantiation = extend(Ea.Connector._Base, {});

Ea.Connector.InterruptFlow = extend(Ea.Connector._Base, {});

Ea.Connector.Manifest = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	},
	linksFrom: function() {
		return this.getSupplier();
	},
	linksTo: function() {
		return this.getClient();
	}
});

Ea.Connector.Nesting = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "owns" : "owned by";
	},
	owns: function() {
		return this.getSupplier();
	},
	ownedBy: function() {
		return this.getClient();
	}
});

Ea.Connector.NoteLink = extend(Ea.Connector._Base, {});

Ea.Connector.ObjectFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	},
	transitionFrom: function() {
		return this.getSupplier();
	},
	transitionTo: function() {
		return this.getClient();
	}
});

Ea.Connector.Package = extend(Ea.Connector._Base, {});

Ea.Connector.ProtocolConformance = extend(Ea.Connector._Base, {});

Ea.Connector.ProtocolTransition = extend(Ea.Connector._Base, {});

Ea.Connector.Realisation = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "realized by" : "implements";
	},
	realizedBy: function() {
		return this.getSupplier();
	},
	implements: function() {
		return this.getClient();
	}
});

Ea.Connector.Sequence = extend(Ea.Connector._Base, {});

Ea.Connector.StateFlow = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "transition from" : "transition to";
	},
	transitionFrom: function() {
		return this.getSupplier();
	},
	transitionTo: function() {
		return this.getClient();
	}
});

Ea.Connector.UseCase = extend(Ea.Connector._Base, {
	getRelation: function(client) {
		return client ? "links from" : "links to";
	},
	linksFrom: function() {
		return this.getSupplier();
	},
	linksTo: function() {
		return this.getClient();
	}
});

