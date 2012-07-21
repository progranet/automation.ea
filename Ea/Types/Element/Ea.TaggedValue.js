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

Ea.TaggedValue = {};

Ea.TaggedValue._Base = extend(Ea.Tag._Base, {},
{
	api: "TaggedValue",
	_notes: attribute({api: "Notes"}),
	_id: attribute({api: "PropertyID", type: Number, id: "id"}),
	_guid: attribute({api: "PropertyGUID", id: "guid"}),
	_parent: attribute({api: "ElementID", type: "Ea.Element._Base", referenceBy: "id", private: true})
});
