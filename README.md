js-sketchbook-boilerplate
=========================

Front-end Javascript Prototyping: Boilerplate project incorporating JamJS and RequireJS against many small, connected, one-off experiments ('sketches')

Useful for rapidly prototyping with jQuery, Backbone, d3, Bootstrap, and anything else in the JamJS repos!  This example boilerplate brings in some of those frameworks, but you can easily add others with the JamJS settings in `package.json`.  Or, you can add your own RequireJS modules by editing `public/sketchbook_config.js`.

# To Use:
To use: 
* `$ npm install jam`
* `$ jam install`
* `$ cd public/`
* `$ python -m SimpleHTTPServer`
* In your browser, go to http://localhost:8000/
* Explore files for details:
    * JamJS installs its files to `public/lib` (No need to reference them directly, though, thats why we're using RequireJS!)
    * Use `public/_sketch_boilerplate_/` as an example to get you started with your own sketch
