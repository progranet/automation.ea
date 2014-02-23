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

Ea.File = {
		meta: {
			objectType: 13
		}		
};

Ea.File._Base = extend(Ea.Types.NamedElement, {},
{
	determineType: function(api) {
		return this._deriveType(api, this.getProperty("_type"));
	}
},
{
	/**
	 * File notes
	 */
	notes: {api: "Notes"},
	
	/**
	 * File date
	 */
	date: {api: "FileDate"},
	
	/**
	 * File size
	 */
	size: {api: "Size"},
	
	/**
	 * File type
	 * 
	 * @private
	 */
	_type: {api: "Type"}
});

Ea.File.WebAdress = extend(Ea.File._Base);

Ea.File.LocalFile = extend(Ea.File._Base);
