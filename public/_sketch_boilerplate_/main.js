/**
 * Experiment Boilerplate main.js
 *
 * main.js is intended to bootstrap your experiment/sketch.  That is, every sketch ought to have its own main.js.
 *
 * This boilerplate demonstrates how to:
 *   1) Reference the common sketchbook requireJS configuration
 *   2) Load a JamJS package
 *   3) Load a sketchbook-defined module
 */

/* FIRST: LOAD COMMON CONFIGURATION
 *
 * Each sketch should have its own main.js, but we want to reference common sketchbook configurations or JamJS
 * extensions.  Therefore, we first load the sketchbook_config.js file, which adds additional require.config({...})
 * params.
 */
require(["/sketchbook_config.js"], function() {

  /*
   * The previous require just loaded the master configuration.  We wait for that to complete by nesting this next step
   * in the callback.
   *
   * Now that we have sketchbook-wide configuration, do a normal require() call to load your desired packages and
   * sketch modules:
   *   - "jquery": A JamJS package, defined in the master JamJS configuration.
   *   - "boilerplate/ExampleView": ExampleView.js file in this folder.
   *       Note that we also could have required it as "_sketch_boilerplate_/ExampleView".  The reason why
   *       "boilerplate/ExampleView" works is because we aliased the (intentionally verbose) "_sketch_boilerplate_" as
   *       just "boilerplate" in sketchbook_config.js with the "paths" configuration.
   */
  require(
    ["jquery", "boilerplate/ExampleView"],
    function($, ExampleView) {

      var v1 = new ExampleView({
        el: $("#example-view-el")
      });
      v1.render();
    }
  );

});