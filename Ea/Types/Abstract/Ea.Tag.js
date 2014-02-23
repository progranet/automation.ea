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
Ea.Tag = {};

Ea.Tag._Base = extend(Ea.Types.NamedElement, {}, {},
{
	/**
	 * Tag value
	 */
	value: {api: "Value"}
});

Ea.Tag._Feature = extend(Ea.Tag._Base, {}, {},
{
	/**
	 * Tag notes
	 */
	notes: {api: "Notes"},

	/**
	 * Tag id
	 * 
	 * @readOnly
	 * @type {Number}
	 */
	id: {api: "TagID"},
	
	/**
	 * Tag guid
	 * 
	 * @readOnly
	 */
	guid: {api: "TagGUID"}
});

Ea.Tag._Extended = extend(Ea.Tag._Base, {}, {},
{
	/**
	 * Tag guid
	 * 
	 * @readOnly
	 */
	guid: {api: "PropertyGUID"},
	
	/**
	 * Tag name
	 */
	name: {api: "Tag"}
});
