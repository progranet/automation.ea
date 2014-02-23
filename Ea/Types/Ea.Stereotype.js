/*
   Copyright 2013 300 D&C

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

Ea.Stereotype = {
		meta: {
			guid: "StereotypeGUID",
			objectType: 29
		}
};

Ea.Stereotype._Base = extend([Ea.Types.NamedElement, Ea._Base.AbstractStereotype], {}, {},
{
	/**
	 * Stereotype guid
	 */
	guid: {api: "StereotypeGUID"},
	
	/**
	 * Stereotype notes
	 */
	notes: {api: "Notes"},
	
	/**
	 * Name of type to witch stereotype applies to 
	 */
	appliesTo: {api: "AppliesTo"},
	
	/**
	 * Stereotype metafile path
	 */
	metafilePath: {api: "MetafileLoadPath"},
	
	/**
	 * Stereotype style
	 */
	style: {api: "Style"},
	
	/**
	 * Stereotype visual style specification
	 * 
	 * @type {Ea._Base.DataTypes.Map}
	 */
	visualType: {api: "VisualType"}
});
