/**
 * d3_force example.
 *
 * This main.js loads the NodeForceView bound to some example data and renders it on the page.
 *
 * In your js console, execute go() to start the mock clock that makes the conversation grow.
 */
require(["/sketchbook_config.js"], function() {
require(
  ["jquery",
   "lodash",
   "meditations/promiseWordNodes",
   "meditations/ForceView",
   "meditations/MottoView"
   ],
  function($, _, promiseWordNodes, ForceView, MottoView) {

    promiseWordNodes
    .done(function(wordNodes, mottos) {

      window.forceView = new ForceView({
        el: "#force_view",
        wordNodes: wordNodes
      });
      window.mottoView = new MottoView({
        el: "#motto_view",
        forceView: forceView
      });
      window.mottos = mottos;
      window.wordNodes = wordNodes;

      forceView.on("highlightedMotto", function(fv, motto, wordNode) {
        console.log("Highlighted a motto!", motto, wordNode);
      });

    })
    .fail(function() {
      console.log("Failed mottos");
    });

});
});