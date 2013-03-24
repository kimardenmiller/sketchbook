js-sketchbook-boilerplate
=========================

Boilerplate best-practice patterns (well, a particular good-practice pattern) for modular front-end javascript
 prototyping ('sketching').

Incorporate JamJS for package management, RequireJS for dependency injection/modularization, and Jasmine for front-end
unit testing.

Useful for rapidly prototyping with jQuery, Backbone, d3, Bootstrap, and anything else in the JamJS repos!  This
example boilerplate brings in some of those frameworks, but you can easily add others with the JamJS settings in
`package.json`.  Or, you can add your own RequireJS modules by editing `public/sketchbook_config.js`.

# What It Isn't
We often understand what patterns are by understanding how they're related to other patterns.  In that respect,
js-sketchbook-boilerplate:
* is NOT a heavyweight production build system
  * Goal is to make experiments using best-practices like modularization, dependency management, and unit testing.
  "Production-ready" build processes like compilation, minification, etc. are out of scope.  For such concerns, look at
  tools like [Grunt](http://gruntjs.com/) or projects like [Backbone Boilerplate](https://github.com/tbranyen/backbone-boilerplate)
  * That being said, the goal is to start developing your prototypes using modularization and unit-testing from the
  beginning so they can be brought into "production-ready" processes.  Therefore, it is an admittingly fuzzy line.
* does NOT concern itself with serverside issues
  * We are starting to see some really amazing front-end-only projects out there.  The goal of js-sketchbook-boilerplate
  is to rapidly experiment with these front-end-only ideas.  Therefore, server-side concerns are out of scope.
* is NOT the only way of doing this stuff
  * Do you really need RequireJS and unit testing for a quick D3 experiment?  Not always.  But if you plan on building
  your sketch into a more full-fledged project, it's helpful.  Decide if your intentions warrent the complexity of
  these patterns.

# Setup
The sketchbook requires [NodeJS](http://nodejs.org/) to install [JamJS](http://jamjs.org/), a javascript package manager
tailored specifically for front-end assets.  Major javascript projects generally tend to have a JamJS package.

To setup the sketchbook:
* `$ npm install jam`
* `$ jam install`

This downloads distributions of major javascript projects that your prototyping code can use:
* jquery: You're probably using it.  If not, you probably should be, or you know enough about it to know why you're not using it.
* Backbone and Lodash (Underscore replacement): MVC library for javascript
* d3: Visualization Fun
* Bootstrap: CSS and UI toolbox

These downloaded files are then accessible through RequireJS modular conventions.  Your favorite dependency can be added
by modifying the `jam.dependencies` attribute of `package.json`.


# Sketches
Point of this project is to get RequireJS-based modularization (with package management) for quick stand-alone
experiments.  Your stand-alone experiments are called "sketches".  A sketch is a subdirectory in `/public/`.  There is
one boilerplate example that demonstrates how to incorporate all the features to set up a new sketch:
`/public/_sketch_boilerplate_`.  To start it up:
* `$ cd public/`
* `$ python -m SimpleHTTPServer`
  * Starts a no-configuration HTTP server to serve directory contents and avoid complications caused by browsers
  restricting what you can do locally (eg XHR requests)
* In your browser, go to `http://localhost:8000/`
  * Navigate to the `_sketch_boilerplate_` directory and see the example sketch in action
  * Explore the files for details, then use `_sketch_boilerplate_` as a template for your sketches!

# Anatomy of a Sketch
The JS Sketchbook Boilerplate is all about establishing patterns to help you get started on your project without setting
up all the best-practices infrastructure.  The following is a description of how each JS Sketchbook Boilerplate
component contributes to this project's particular good-practice pattern:
* `/`: Project root
  * `package.json`: Add any projects you want to incorporate into your sketch in the `jam.dependencies` attribute.  Run
  `$ jam install` from project root to download copies.
  * `/public/`: Sketches live here
    * `/public/lib/`: Jam packages get downloaded here.  Because we use JamJS's RequireJS configuration, any module here
    can be automatically referenced in your require statement (eg `define(["backbone"], function(Backbone) {...})`)
    * `/public/sketchbook_config.js`: Common RequireJS configuration for sketches.  Don't really need to do anything here
    unless you're doing advanced features like aliasing, etc.
    * `/public/_sketch_boilerplate_/`: Example Sketch module -- you will put your sketches into similar `/public/`
    subdirectories
      * `/public/_sketch_boilerplate_/index.html`: Stand-alone sketch HTML.  Note how RequireJS is being loaded here,
      then do the same for your sketches
      * `/public/_sketch_boilerplate_/main.js`: Main RequireJS bootstrapping script for your sketch.  Note how it first
      loads `sketchbook_config.js` before loading your sketch's dependencies and then kicking everything off.
      * `/public/_sketch_boilerplate_/ExampleView.js`: Example sketch contents. Create one JS file or create many,
      whatever you need to implement your idea.  They will all get loaded using main.js or RequireJS's dependency
      management.
  * `/test/`: Jasmine-based Unit Tests live here.  NOTE: To run unit tests, you start a webserver in the project root,
  while to view sketches you start a webserver in `/public/`.  (TODO: Make this less awkward?)
    * `/test/test_config.js': RequireJS file-path correction configuration.  No need to modify.
    * `/test/index.html`: File that runs all unit tests when opened in the browser.  As you add test specs, you add them
    to this file to run them.
    * `/test/_sketch_boilerplate_/`: Example test spec for the example sketch.  Directory naming should mirror your
    sketch naming in `/public/`.



