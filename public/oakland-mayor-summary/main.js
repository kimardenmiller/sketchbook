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
    ["jquery",
     "oakland-mayor-summary/candidateData",
     "oakland-mayor-summary/MayoralWaterfall"],
    function($, data, MayoralWaterfall) {

      var views = window.views = [];
      data.forEach(function(candidateData, i) {
        var el = document.createElement('div');
        $('#waterfalls').append(el);
        views.push(new MayoralWaterfall({
          el: el,
          isFirst: i === 0,
          data: candidateData
        }));
      });

      $('.highlight').on('mouseover', function(e) {
        var component = $(e.target).attr('data-highlight');
        views.forEach(function(v) {
          v.highlightComponent(component);
        });
        if (ga) {
          ga('send', 'event','oakland-mayor-summary', 'mouseover info paragraph component', component);
        }
      });
      $('.highlight').on('mouseout', function(e) {
        views.forEach(function(v) {
          v.unhighlightComponent();
        });
      });
    }
  );

});