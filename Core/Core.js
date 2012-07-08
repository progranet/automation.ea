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

Core = {
		
	isFunction: function(property, propertyName) {
		return typeof property == "function" && !/^_*[A-Z]/.test(propertyName) && !this.isNative(property);
	},
	
	_fnPattern: new RegExp("^\\s*function\\s*([\\w$]*)\\s*\\(([\\w$,\\s]*)\\)\\s*\\{\\s*([\\w\\W]*)\\s*\\}\\s*$"),
	_nativePattern: new RegExp("\\[native\\s*code\\]", "i"),
	
	parse: function(fn) {
		var parsed = {
			arguments: [],
			joinedArguments: ""
		};
		var pt = this._fnPattern.exec(fn.toString());
		if (pt) {
			parsed.arguments = pt[2].split(",");
			parsed.joinedArguments = pt[2];
			parsed.body = pt[3];
			parsed.name = pt[1];
		}
		return parsed;
	},
	
	isNative: function(fn) {
		return this._nativePattern.test(this.parse(fn).body);
	},
	
	_callbacksMethod: [],
	
	enrichMethodRegister: function(callback) {
		this._callbacksMethod.push(callback);
	},

	enrichMethod: function(namespace, propertyName, qualifiedName, _static) {
		var property = namespace[propertyName];
		if (!this.isFunction(namespace[propertyName], propertyName))
			return;
		var source = property.toString();
		for (var ci = 0; ci < this._callbacksMethod.length; ci++) {
			var callback = this._callbacksMethod[ci];
			source = callback(source, namespace, propertyName, qualifiedName, _static);
		}
		eval("namespace[propertyName] = " + source);
		namespace[propertyName].qualifiedName = qualifiedName;
		namespace[propertyName].static = _static;
	},
	
	enrichNamespace: function(namespace) {
		for (var propertyName in namespace) {
			this.enrichMethod(namespace, propertyName, namespace.qualifiedName + "." + propertyName, true);
		};
	},
	
	_callbackSource: [],
	
	enrichSourceRegister: function(callback) {
		this._callbackSource.push(callback);
	},

	enrichSource: function(qualifiedName, source) {
		for (var ci = 0; ci < this._callbackSource.length; ci++) {
			var callback = this._callbackSource[ci];
			source = callback(qualifiedName, source);
		}
		return source;
	},
	
	merge: function(toObject, object) {
		for (var name in object) {
			if (name in toObject)
				throw new Error("Merge target object " + toObject + " already has property: " + name);
			toObject[name] = object[name];
		}
	}
};
