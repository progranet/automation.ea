/*
   Copyright 2015 300 D&C

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

load("diff_match_patch_uncompressed@External");

Comparable = {
		
	diff: null,
	
	initialize: function() {
		this.diff = new diff_match_patch();
	},
	
	compareString: function(act, old) {	
		
		if ((act == old) || (!act && !old))
			return act || "";

		if (act && !old)
			return "<ins style=\"background:#e6ffe6;color:green;\">" + act + "</ins>";

		if (old && !act)
			return "<del style=\"background:#ffe6e6;color:red;\">" + old + "</del>";
		
		if (act.indexOf(" ") == -1 && old.indexOf(" ") == -1)
			return "<del style=\"background:#ffe6e6;color:red;\">" + old + "</del><ins style=\"background:#e6ffe6;color:green;\">" + act + "</ins>";

		var diff = Comparable.diff.diff_main(old, act);
		//this.diff.diff_cleanupSemantic(diff);
		return Comparable.diff.diff_prettyHtml(diff).replace(/&para;/g, "");

	}
};

Comparable.Object = define({
	
	$type: null,
	$cur: null,
	$old: null,
	$any: null,
	$guid: null,
	$xmlGuid: null,
	$isAdded: false,
	$isRemoved:false,
	$isMoved: false,
	$_cache: null,
	$curApp: null,
	$oldApp: null,
	
	create: function(type, cur, old, curApp, oldApp) {
		
		_super.create();
		
		this.$cur = cur;
		this.$old = old;
		if (cur && cur._class.isSubclassOf(type))
			type = cur._class;
		if (old && type.isSubclassOf(old._class))
			type = old._class;
		this.$type = type;
		curApp = curApp || cur._source.application;
		if (!curApp)
			throw new Error("Current EA application not reacheable");
		this.$curApp = curApp;
		oldApp = oldApp || old._source.application;
		if (!oldApp)
			throw new Error("Old EA application not reacheable");
		this.$oldApp = oldApp;
		this.$any = cur || old;
		if (this.$any.getGuid)
			this.$guid = this.$any.getGuid();
		if (this.$any.getXmlGuid)
			this.$xmlGuid = this.$any.getXmlGuid();
		this.$isAdded = cur && !old;
		this.$isRemoved = !cur && old;
		this.$isMoved = this.$isRemoved && curApp.getRepository().getByGuid(type, this.$guid);
		this.$_cache = {};

		type.getProperties().forEach(function(property) {
			
			var getterName = property.name.replace(/^_+/g, "");
			getterName = (property.private ? "_" : "") + (property.type == Boolean ? "is" : "get") + getterName.substring(0,1).toUpperCase() + getterName.substring(1);
			
			this[getterName] = function() {
				
				if (getterName in this.$_cache)
					return this.$_cache[getterName];
				
				var isCollection = property._isCollection;
				var curValue = cur ? cur[getterName].call(cur) : (isCollection ? new Core.Types.Collection() : null);
				var oldValue = old ? old[getterName].call(old) : (isCollection ? new Core.Types.Collection() : null);
				var value;
				if (isCollection) {
					var collectionType = property.key ? Comparable.Map : Comparable.Collection;
					value = new collectionType(property.elementType, curValue, oldValue, curApp, oldApp, {key: property.key});
				}
				else {
					if (property.type == String || property.type == Number || property.type == Boolean) {
						value = Comparable.compareString(curValue, oldValue);
					}
					else {
						value = (curValue || oldValue) ? new Comparable.Object(property.type, curValue, oldValue, curApp, oldApp) : null;
					}
				}
				this.$_cache[getterName] = value;
				return value;
			};
			
		});
	},
	
	$is: function(type) {
		return type.isInstance(this.$any);
	},
	
	$compare: function(fnCols, linkCol) {
		var strings = [];
		for (var c = 0; c < fnCols.length; c++) {
			strings.push(fnCols[c].call(element));
		}
		strings[linkCol] = "<a href='#" + element.$xmlGuid.substring(5) + "'>" + strings[linkCol] + "</a>";
		var string = strings.join("&nbsp;") + "<br>";
		if (element.$isAdded)
			string = "<ins>" + string + "</ins>";
		else if (element.$isRemoved)
			string = "<del>" + string + "</del>";
		return string;
	},
	
	$getResult: function(fn, type) {
		var curValue = this.$cur ? fn.call(this.$cur).filter(type) : null;
		var oldValue = this.$old ? fn.call(this.$old).filter(type) : null;
		var comparable;
		if (Core.Types.Collection.isInstance(curValue) || Core.Types.Collection.isInstance(oldValue)) {
			comparable = new Comparable.Collection(type, curValue || new Core.Types.Collection(), oldValue || new Core.Types.Collection(), this.$curApp, this.$oldApp);
		}
		else {
			comparable = new Comparable.Object(type, curValue, oldValue, this.$curApp, this.$oldApp);
		}
		return comparable;
	},
	
	$compareResult: function(fn, type, fnCols, linkCol) {
		var comparable = this.$getResult(fn, type);
		return comparable.$compare(fnCols, linkCol);
	}
});

Comparable.Collection = extend(Core.Types.Collection, {
	
	$type: null,
	
	create: function(type, cur, old, curApp, oldApp) {
		
		_super.create();
		
		this._init(type, cur, old, curApp, oldApp);
	},
	
	_init: function(type, cur, old, curApp, oldApp) {

		this.$type = type;
		
		var getGuid = type.prototype.getGuid;
		if (getGuid) {
			var guids = {};
			cur.forEach(function(curElement) {
				var guid = curElement.getGuid();
				guids[guid] = curElement;
				var oldElement = old.filter("this.getGuid() == '" + guid + "'").first();
				this.add(new Comparable.Object(type, curElement, oldElement, curApp, oldApp));
			});
			old.forEach(function(oldElement) {
				if (!(oldElement.getGuid() in guids)) {
					this.add(new Comparable.Object(type, null, oldElement, curApp, oldApp));
				}
			});
		}
		else {
			cur.forEach(function(curElement) {
				this.add(new Comparable.Object(type, curElement, null, curApp, oldApp));
			});
			old.forEach(function(oldElement) {
				this.add(new Comparable.Object(type, null, oldElement, curApp, oldApp));
			});
		}
	},
	
	$compare: function(fnCols, linkCol) {

		var list = "";
		this.forEach(function(element) {
			list = list + element.$compare(fnCols, linkCol);
		});
		return list;
	}}
);

Comparable.Map = extend([Core.Types.Map, Comparable.Collection], {
	
	create: function(type, cur, old, curApp, oldApp, params) {
		
		_super.create(params);
		
		this._init(type, cur, old, curApp, oldApp);
	}
});
