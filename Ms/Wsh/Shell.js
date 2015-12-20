/*
   Copyright 2012 300 D&C

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

Shell = {
	
	shell: null,
	
	initialize: function() {
		this.shell = new ActiveXObject("WScript.Shell");
	},
	
	Action: {
		ok: 0,
		okCancel: 1,
		abortRetryIgnore: 2,
		yesNoCancel: 3,
		yesNo: 4,
		retryCancel: 5,
		cancelTryAgainContinue: 6
	},
	Icon: {
		none: 0,
		stop: 16,
		question: 32,
		exclamation: 48,
		information: 64
	},
	Result: {
		timeout: 0,
		ok: 1,
		cancel: 2,
		abort: 3,
		retry: 4,
		ignore: 5,
		yes: 6,
		no: 7,
		tryAgain: 10,
		"continue": 11
	},
	
	/**
	 * 
	 * @param {String} title
	 * @param {String} content
	 * @param {Shell.Action} actions
	 * @param {Shell.Icon} icon
	 * @param {Boolean} onTop
	 * @type {Shell.Result}
	 */
	popup: function(title, content, actions, icon, onTop) {
		return this.shell.Popup(content, 0, title, (actions || Shell.Action.ok) + (icon || Shell.Icon.none) + (onTop ? 4096 : 0));
	}
};
