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

_meta = {
	_class: null
};

Core.Lang = {
		
	_propertyListener: [],
		
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
	 * @param {String} namespace
	 * @param {String} name
	 * @param {Object} features
	 * @param {Object} staticFeatures
	 * @param {Object} properties
	 * @type {Core.Lang.Class}
	 */
	define: function(namespace, name, features, staticFeatures, properties) {
		if (namespace != "Core.Lang")
			return Core.Lang.extend(namespace, name, Core.Types.Object, features, staticFeatures, properties);
		
		var metaClass = new Function("this.create.apply(this, arguments);");
		metaClass.prototype = features;
		if (name == "Class")
			_meta._class = metaClass;
	},
	
	/**
	 * Defines new class extending specified super class
	 * 
	 * @param {String} namespace
	 * @param {String} name
	 * @param {Core.Lang.Class} superClasses
	 * @param {Object} features
	 * @param {Object} staticFeatures
	 * @param {Object} properties
	 * @type {Core.Lang.Class}
	 */
	extend: function(namespace, name, superClasses, features, staticFeatures, properties) {
		
		if (!superClasses) {
			if (namespace != "Core.Types" || name != "Object")
				throw new Error("Undefined super class for " + namespace + "." + name);
			superClasses = [];
		}
		else {
			if (!(superClasses instanceof Array))
				superClasses = [superClasses];
		}
		
		features = features || {};
		if (!features.create) {
			var args = Core.parse(superClasses[0].prototype.create).joinedArguments;
			eval("features.create = function(" + args + ") {_super.create(" + args + ");}");
		}
		
		for (var s = 0; s < superClasses.length; s++) {
			var superClass = superClasses[s];
			
			if (s == 0) {
				for (var featureName in features) {
					var feature = features[featureName];

					if (Core.isMethod(feature, featureName)) {
						var fn = feature.toString();
						fn = fn.replace(/_super\.([a-zA-Z0-9_$]+)\((\)?)/g, function($0, $1, $2) {
							var string = "this[\"" + superClass.qualifiedName + "." + $1 + "\"].call(this" + ($2 ? ")" : ", ");
							return string;
						});
						fn = eval("features." + featureName + " = " + fn);
					}
				}
			}
			
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
		}
		
		return (new _meta._class(superClasses, namespace, name, features, staticFeatures, properties))._class;
	},
	
	/**
	 * Registers listener function that checks if provided property definition satisfies conditions for specified property class  
	 * 
	 * @param {Function} listener
	 * @param {Core.Lang.Class} propertyClass
	 */
	registerPropertyListener: function(listener, propertyClass) {
		this._propertyListener.push({
			listener: listener, 
			propertyClass: propertyClass
		});
	}
};

Core.Lang.Class = define({

	/**
	 * Creates new class
	 * 
	 * @param {Core.Lang.Class} superClasses
	 * @param {String} namespace
	 * @param {String} name
	 * @param {Object} features Map of class instance features - attributes and methods
	 * @param {Object} staticFeatures Map of class static features - attributes and methods
	 * @param {Object} properties Map of class properties
	 */
	create: function (superClasses, namespace, name, features, staticFeatures, properties) {
		
		this.name = name;
		this.qualifiedName = namespace + "." + name;
		this.namespace = eval(namespace);
		this._super = superClasses;
		this._subClass = [];
		this._properties = {};
		
		for (var featureName in staticFeatures) {
			var feature = staticFeatures[featureName];
			this[featureName] = feature;
			if (Core.isMethod(feature, featureName)) {
				Core.enrichMethod(this, featureName, namespace + "." + name + "." + featureName, true);
			}
		}
		
		for (var s = 0; s < superClasses.length; s++) {
			var superClass = superClasses[s];
			for (var featureName in superClass) {
				if (!(featureName in this))
					this[featureName] = superClass[featureName];
			}
		}
		
		for (var s = 0; s < superClasses.length; s++) {
			var superClass = superClasses[s];
			for (var propertyName in superClass._properties) {
				this._properties[propertyName] = superClass._properties[propertyName];
			}
		}
		
		for (var propertyName in properties) {
			var property = properties[propertyName];
			property.name = propertyName;
			for (var l = 0; l < Core.Lang._propertyListener.length; l++) {
				var listener = Core.Lang._propertyListener[l];
				if (listener.listener(this, property)) {
					this._properties[propertyName] = new listener.propertyClass(this, features, property);
					break;
				}
			}
		}
		
		for (var featureName in features) {
			var feature = features[featureName];
			if (Core.isMethod(feature, featureName)) {
				Core.enrichMethod(features, featureName, this.qualifiedName + "." + featureName, false);
			}
		}
		
		// TODO: prevent class initialization before namespace is initialized by loader
		this.initialize();
		
		var _class = new Function("this.create.apply(this, arguments);");

		for (var propertyName in this) {
			_class[propertyName] = this[propertyName];
		}
		_class.toString = this.toString;

		features._class = _class;
		_class.prototype = features;
		
		this._classTemplate = true;
		
		for (var s = 0; s < superClasses.length; s++) {
			var superClass = superClasses[s];
			superClass._subClass.push(_class);
		}
		
		this._class = _class;
	},

		
	_class: null,
	//prototype: null,
	isClass: true,
	
	name: null,
	
	/**
	 * Returns class name
	 * 
	 * @type {String}
	 */
	getName: function() {
		return this.name;
	},
	
	qualifiedName: null,
	
	/**
	 * Returns class qualified name
	 * 
	 * @type {String}
	 */
	getQualifiedName: function() {
		return this.qualifiedName;
	},
	
	namespace: null,
	
	/**
	 * Returns class namespace
	 * 
	 * @type {Object}
	 */
	getNamespace: function() {
		return this.namespace;
	},
	
	_super: null,
	
	_subClass: null,
	
	_properties: null,
	_propertiesCollection: null,
	
	/**
	 * Returns all class properties
	 * 
	 * @type {Core.Types.Collection<Ea._Base.Class._Property>}
	 */
	getProperties: function() {
		var properties = this._properties;
		if (this._propertiesCollection)
			return this._propertiesCollection;
		this._propertiesCollection = new Core.Types.Collection({map: this._properties});
		return this._propertiesCollection;
	},

	/**
	 * Returns property by name
	 * 
	 * @param {String} name
	 * @type {Object}
	 */
	getProperty: function(name) {
		return this._properties[name];
	},
	
	/**
	 * Checks if this class is subclass of specified class
	 * 
	 * @param {Core.Lang.Class} ofClass
	 * @type {Boolean}
	 */
	isSubclassOf: function(ofClass) {
		if (!ofClass)
			throw new Error(this.qualifiedName + ".isSubclassOf(<<undefined>>)");
		for (var s = 0; s < this._super.length; s++) {
			var superClass = this._super[s];
			if (superClass.conformsTo(ofClass))
				return true;
		}
		return false;
	},
	
	/**
	 * Checks if this class conforms to specified class
	 * 
	 * @param {Core.Lang.Class} toClass
	 * @type {Boolean}
	 */
	conformsTo: function(toClass) {
		return this === toClass || this.isSubclassOf(toClass);
	},
	
	/**
	 * Checks if specified object is instance of this class
	 * 
	 * @param {Object} object
	 * @type {Boolean}
	 */
	isInstance: function(object) {
		return object && object._class && Core.Lang.isClass(object._class) && object._class.conformsTo(this);
	},
	
	/**
	 * Checks if this class is assignable from specified class
	 * 
	 * @param {Core.Lang.Class} fromClass
	 * @type {Boolean}
	 */
	isAssignableFrom: function(fromClass) {
		if (!fromClass)
			throw new Error(this.qualifiedName + ".isAssignableFrom(<<undefined>>)");
		if (!Core.Lang.isClass(fromClass))
			return false;
		if (this === fromClass)
			return true;
		for (var s = 0; s < this._subClass.length; s++) {
			var subClass = this._subClass[s];
			if (subClass === fromClass || subClass.isAssignableFrom(fromClass))
				return true;
		}
		return false;
	},
	
	/**
	 * @type {String}
	 */
	toString: function() {
		return this.qualifiedName;
	}
});
