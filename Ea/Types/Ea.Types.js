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

Ea.Types = {};

Ea.Types.Any = define({
	
	create: function(api) {
		_super.create();
	},
	
	getXmlGuid: function() {
		return Ea.Application.getApplication().getProject().guidToXml(this.getGuid());
	},
	
	toString: function() {
		return this._toString();
	},
	
	_toString: function() {
		return "[" + this._class + "]";
	}
}, 
{
	getType: function() {
		return this.namespace._Base;
	},
	
	_deriveType: function(source, attribute) {
		var typeName = attribute.get(source).replace(/[-\s]/g,"");
		var type = this.namespace[typeName] || Ea.addType(this.namespace, typeName);
		return type;
	},
	
	init: function() {
		
	},
	
	initialize: function() {
		Ea.Class.registerClass(this);
	}	
});

Ea.Types.Named = extend(Ea.Types.Any, {

	_splitName: function() {
		var name = this.getName();
		var split = new RegExp("^([\\w\\-\\.]+[0-9]+):?\\s+([\\W\\w]+)$").exec(name);
		return split || [name, "", name];
	},
	
	_businessId: null,
	_businessName: null,

	getBusinessName: function() {
		if (!this._businessName || Ea.mm) {
			var split = this._splitName();
			this._businessId = split[1];
			this._businessName = split[2];
		}
		return this._businessName;
	},
	
	getBusinessId: function() {
		if (!this._businessId || Ea.mm) {
			var split = this._splitName();
			this._businessId = split[1];
			this._businessName = split[2];
		}
		return this._businessId;
	},
	
	getParent: function() {
		return null;
	},
	
	hasParent: function(namespace) {
		var parent = this.getParent();
		if (!parent) return false;
		namespace = Ea.ensure(Ea.Package._Base, namespace);
		return (parent == namespace ? namespace : parent.hasParent(namespace));
	},
	
	_toString: function() {
		return this.getName() + " " + _super._toString();
	},
	
	_qualifedName: null,
	getQualifiedName: function() {
		if (!this._qualifedName || Ea.mm) {
			var parent = this.getParent();
			this._qualifedName = (parent ? parent.getQualifiedName() + "." : "") + this.getName();
		}
		return this._qualifedName;
	}
	
},
{
	_name: attribute({api: "Name"}),
	__parent: derived({getter: "getParent", type: "Ea.Types.Namespace"}),
	_qualifiedName: derived({getter: "getQualifiedName"})
});

Ea.Types.Namespace = extend(Ea.Types.Named);
