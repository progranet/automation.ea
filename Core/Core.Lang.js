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
	 * Tests if specified type is a class
	 * 
	 * @param {Function} type
	 * @type {Boolean}
	 */
	isClass: function(type) {
		// TODO remove public feature Core.Types.Object.isClass
		return type.isClass;
	},
	
	/**
	 * Defines new class extending Core.Lang.Object class
	 * 
	 * @memberOf Core.Lang
	 * @param {Object} namespace
	 * @param {String} name
	 * @param {Object} features
	 * @param {?Object} staticFeatures
	 * @param {?Object} properties
	 * @type {Class}
	 */
	define: function(namespace, name, features, staticFeatures, properties) {
		return Core.Lang.extend(namespace, name, Core.Types.Object, features, staticFeatures, properties);
	},
	
	/**
	 * Defines new class extending specified super class
	 * 
	 * @memberOf Core.Lang
	 * @param {Object} namespace
	 * @param {String} name
	 * @param {Class} superClasses
	 * @param {Object} features
	 * @param {?Object} staticFeatures
	 * @param {?Object} properties
	 * @type {Class}
	 */
	extend: function(namespace, name, superClasses, features, staticFeatures, properties) {
		
		if (typeof(namespace) != "string")
			namespace = namespace.qualifiedName;
		
		if (!superClasses) {
			if (namespace != "Core.Types" || name != "Object")
				throw new Error("Undefined super class for " + namespace + "." + name);
			superClasses = [];
		}
		else {
			if (!(superClasses instanceof Array))
				superClasses = [superClasses];
		}
		
		//superClass = superClass || Core.Types.Object;
		features = features || {};
		if (!features.create) {
			var args = Core.parse(superClasses[0].prototype.create).joinedArguments;
			eval("features.create = function(" + args + ") {_super.create(" + args + ");}");
		}
		
		var _class = Core.Lang._define(namespace, name, superClasses, features, staticFeatures, properties);
		
			
		for (var s = 0; s < superClasses.length; s++) {
			var superClass = superClasses[s];
			
			var _fn = function(featureName) {
				var feature = superClass.prototype[featureName];
				if(!(featureName in features)) {
					features[featureName] = feature;
				}
				else if (typeof feature == "function" && featureName.indexOf(".") == -1) {
					if (Core.isNative(features[featureName])) {
						features[featureName] = feature;
					}
					else {
						features["" + superClass.qualifiedName + "." + featureName + ""] = feature;
					}
				}
			};
			
			for (var featureName in superClass.prototype) {
				_fn(featureName);
			}
			
			if (!Core.isNative(superClass.prototype.toString))
				_fn("toString");
			if (!Core.isNative(superClass.prototype.valueOf))
				_fn("valueOf");

			superClass._subClass.push(_class);
		}
		
		return _class;
	},
	
	/**
	 * @private
	 */
	_define: function(namespace, name, superClasses, features, staticFeatures, properties) {
		
		var _class = new Function("this.create.apply(this, arguments);");

		var superClass = superClasses.length != 0 ? superClasses[0] : null;
		for (var featureName in features) {
			var feature = features[featureName];

			if (Core.isMethod(feature, featureName)) {
				var fn = feature.toString();
				fn = fn.replace(/_super\.([a-zA-Z0-9_$]+)\((\)?)/g, function($0, $1, $2) {
					var string = "this[\"" + superClass.qualifiedName + "." + $1 + "\"].call(this" + ($2 ? ")" : ", ");
					return string;
				});
				fn = eval("features." + featureName + " = " + fn);
				Core.enrichMethod(features, featureName, namespace + "." + name + "." + featureName, false);
			}
		}
		Core.Lang._defineStatic(_class, superClasses, namespace, name, features, staticFeatures, properties);
		
		features._class = _class;
		_class.prototype = features;
		
		return _class;
	},
	
	/**
	 * @private
	 */
	_defineStatic: function(_class, superClasses, namespace, name, features, staticFeatures, properties) {
		
		_class.name = name;
		_class.getName = function() {return name;};
		_class.qualifiedName = namespace + "." + name;
		_class.getQualifiedName = function() {return _class.qualifiedName;};
		_class.namespace = eval(namespace);
		if (!_class.namespace._classes)
			_class.namespace._classes = {};
		_class.namespace._classes[name] = _class;
		
		_class.isClass = true;

		_class._super = superClasses;
		_class.isSubclassOf = function(ofClass) {
			if (!ofClass)
				throw new Error(_class.qualifiedName + ".isSubclassOf(<<undefined>>)");
			for (var s = 0; s < superClasses.length; s++) {
				var superClass = superClasses[s];
				if (superClass.conformsTo(ofClass))
					return true;
			}
			return false;
		};
		_class.conformsTo = function(toClass) {
			return _class === toClass || _class.isSubclassOf(toClass);
		};
		_class.isInstance = function(object) {
			return object && object._class && object._class.isClass && object._class.conformsTo(_class);
		};

		_class._subClass = [];
		_class.isAssignableFrom = function(fromClass) {
			if (!fromClass)
				throw new Error(_class.qualifiedName + ".isAssignableFrom(<<undefined>>)");
			if (!fromClass.isClass)
				return false;
			if (_class === fromClass)
				return true;
			for (var s = 0; s < _class._subClass.length; s++) {
				var subClass = _class._subClass[s];
				if (subClass === fromClass || subClass.isAssignableFrom(fromClass))
					return true;
			}
			return false;
		};
		
		_class.ensure = function(params) {
			return _class.isInstance(params) ? params : new _class(params);
		};
		_class.toString = function() {
			return _class.qualifiedName;
		};
		for (var featureName in staticFeatures) {
			//if (!(featureName in _class)) {
				var feature = staticFeatures[featureName];
				_class[featureName] = feature;
				if (Core.isMethod(feature, featureName)) {
					Core.enrichMethod(_class, featureName, namespace + "." + name + "." + featureName, true);
				}
				if (feature && typeof(feature) == "object" && feature.initialize)
					feature.initialize(_class, featureName, features);
			/*}
			else {
				throw new Error("Static feature already exists: " + _class.qualifiedName + "." + featureName);
			}*/
		}
		for (var s = 0; s < superClasses.length; s++) {
			var superClass = superClasses[s];
			for (var featureName in superClass) {
				if (!_class[featureName])
					_class[featureName] = superClass[featureName];
			}
		}

		/*_class._properties = {};
		for (var propertyName in properties) {
			_class._properties[propertyName] = properties[propertyName];
		}
		for (var s = 0; s < superClasses.length; s++) {
			var superClass = superClasses[s];
			for (var propertyName in superClass._properties) {
				_class._properties[propertyName] = _class._properties[propertyName] || superClass._properties[propertyName];
			}
		}*/
		
		// TODO: prevent class initialization before namespace is initialized by loader
		_class.initialize();
	}
};
