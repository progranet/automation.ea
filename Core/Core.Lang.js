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

/**
 * @namespace
 */
Core.Lang = {

	/**
	 * Tests if specified type is class
	 * 
	 * @param {Function} type
	 * @returns {Boolean}
	 * @type Boolean
	 * @static
	 */
	isClass: function(type) {
		// TODO remove public property Core.Types.Object.isClass
		return type.isClass;
	},
	
	/**
	 * Defines new class extending Core.Lang.Object class
	 * 
	 * @memberOf Core.Lang
	 * @param {Object} namespace
	 * @param {String} name
	 * @param {Object} properties
	 * @param {?Object} staticProperties
	 * @returns {Class}
	 * @static
	 */
	define: function(namespace, name, properties, staticProperties) {
		return Core.Lang.extend(namespace, name, null, properties, staticProperties);
	},
	
	/**
	 * Defines new class extending super class
	 * 
	 * @memberOf Core.Lang
	 * @param {Object} namespace
	 * @param {String} name
	 * @param {Class} superClass
	 * @param {Object} properties
	 * @param {?Object} staticProperties
	 * @returns {Class}
	 * @static
	 */
	extend: function(namespace, name, superClass, properties, staticProperties) {
		
		if (typeof(namespace) != "string")
			namespace = namespace.qualifiedName;
		
		if (superClass === undefined) {
			throw new Error("Undefined super class for " + namespace + "." + name);
		}
		
		superClass = superClass || Core.Types.Object;
		properties = properties || {};
		if (!properties.create) {
			var args = Core.parse(superClass.prototype.create).joinedArguments;
			eval("properties.create = function(" + args + ") {_super.create(" + args + ");}");
		}
		
		var _class = Core.Lang._define(namespace, name, superClass, properties, staticProperties);
		
		for (var propertyName in superClass.prototype) {
			var property = superClass.prototype[propertyName];
			if(!properties[propertyName]) {
				properties[propertyName] = property;
			}
			else if (typeof property == "function" && propertyName.indexOf(".") == -1) {
				properties["" + superClass.qualifiedName + "." + propertyName + ""] = property;
			}
		}
		
		if (Core.isNative(properties.toString))
			properties.toString = function() {
				return this._toString();
			};
		
		if (superClass) superClass._subClass.push(_class);
		return _class;
	},
	
	/**
	 * @private
	 */
	_define: function(namespace, name, superClass, properties, staticProperties) {
		
		//var args = Core.parse(properties.create).joinedArguments;
		//eval("var _class = function(" + args + ") {this.create.call(this" + (args ? ", " + args : "") + ");}");
		var _class = new Function("this.create.apply(this, arguments);");
		Core.Lang._addStatic(_class, superClass, namespace, name, properties, staticProperties);

		for (var propertyName in properties) {
			var property = properties[propertyName];

			if (Core.isFunction(property, propertyName)) {
				var fn = property.toString();
				fn = fn.replace(/_super\.([a-zA-Z0-9_$]+)\((\)?)/g, function($0, $1, $2) {
					var string = "this[\"" + superClass.qualifiedName + "." + $1 + "\"].call(this" + ($2 ? ")" : ", ");
					return string;
				});
				fn = eval("properties." + propertyName + " = " + fn);
				Core.enrichMethod(properties, propertyName, namespace + "." + name + "." + propertyName, false);
			}
		}
		
		properties._class = _class;
		_class.prototype = properties;
		
		return _class;
	},
	
	/**
	 * @private
	 */
	_addStatic: function(_class, _super, namespace, name, properties, staticProperties) {
		_class.name = name;
		_class.getName = function() {return name;};
		_class.qualifiedName = namespace + "." + name;
		_class.getQualifiedName = function() {return _class.qualifiedName;};
		_class.namespace = eval(namespace);
		if (!_class.namespace._classes)
			_class.namespace._classes = {};
		_class.namespace._classes[name] = _class;
		_class.isClass = true;
		_class._super = _super;
		_class.isSubclassOf = function(ofClass) {
			if (!ofClass) throw new Error(_class.qualifiedName + ".isSubclassOf(<<undefined>>)");
			return (_class._super != null) && ((_super === ofClass || _super.isSubclassOf(ofClass)));
		};
		_class.isInstance = function(object) {
			return object && object._class && object._class.isClass && (object._class === _class || object._class.isSubclassOf(_class));
		};
		_class._subClass = [];
		
		_class.ensure = function(params) {
			return _class.isInstance(params) ? params : new _class(params);
		};
		_class.toString = function() {
			return _class.qualifiedName;
		};
		for (var propertyName in staticProperties) {
			if (!_class[propertyName]) {
				var property = staticProperties[propertyName];
				_class[propertyName] = property;
				if (Core.isFunction(property, propertyName)) {
					Core.enrichMethod(_class, propertyName, namespace + "." + name + "." + propertyName, true);
				}
				if (property && typeof(property) == "object" && property.initialize)
					property.initialize(_class, propertyName, properties);
			}
		}
		if (_super) {
			for (var propertyName in _super) {
				if (!_class[propertyName]) {
					var property = _super[propertyName];
					_class[propertyName] = property;
				}
			}
		}
		
		_class.initialize();
	}
};

var callbackSource = function(qualifiedName, source) {
	return source.replace(/([\s,\.])([A-Z_][A-Za-z0-9_$]*)(\s*[:=]\s*)(extend|define)\s*\(/g, function(whole, prefix, name, assignment, method) {
		var result = prefix + name + assignment + "Core.Lang." + method + "(\"" + qualifiedName + "\", \"" + name + "\", ";
		return result;
	});
};

Core.registerSourceEnrichment(callbackSource);
