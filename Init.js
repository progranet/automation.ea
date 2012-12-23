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

_logBuffer = {};
_reqisterLogger = function(level) {
	_logBuffer[level] = [];
	return function(message, params) {
		_logBuffer[level].push({message: message, params: params});
	};
};

info = _reqisterLogger("info");
error = _reqisterLogger("error");
warn = _reqisterLogger("warn");
debug = _reqisterLogger("debug");

_treeLogger = _reqisterLogger("_treeLogger");
_quietLogger = _reqisterLogger("_quietLogger");

__exceptionLogger = _reqisterLogger("__exceptionLogger");
__stackLogger = _reqisterLogger("__stackLogger");
