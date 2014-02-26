sketchbook
==========

my virtual moleskin: a javascript sketchbook

Sketches
==========
- [meditations/](http://sketchbook.onafloatingrock.com/meditations)
    - An experiment in adding interactivity and build-up to the standard D3 force layout.  Why does every D3 force layout
      example show a fixed number of nodes?  A network should be revealed as it explored, and here we meditate on phrases
      as our interconnected network of hopes and ideals is revealed.
- [oakland-mayor-summary/](http://sketchbook.onafloatingrock.com/oakland-mayor-summary)
    - A hackathon project from Oakland Data Day on visualizing campaign finance public records to provide an empirical,
      data driven alternative perspective on campaigns' structure, priorities, and promises.


==========

Based off boilerplate project [js-sketchbook-boilerplate](http://www.github.com/dlopuch/js-sketchbook-boilerplate):

To setup the sketchbook:
* `$ npm install jam`
* `$ jam install`
* `$ cd public/`
* `$ python -m SimpleHTTPServer`
  * Starts a no-configuration HTTP server to serve directory contents and avoid complications caused by browsers
  restricting what you can do locally (eg XHR requests)
* In your browser, go to `http://localhost:8000/`
  * Navigate to the `_sketch_boilerplate_` directory and see the example sketch in action
  * Explore the files for details, then use `_sketch_boilerplate_` as a template for your sketches!

==========

Released under the GPL v3 license.

    dlopuch/sketchbook: a javascript playground
    Copyright (C) 2014 Dan Lopuch <dlopuch@gmail>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.
