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
   "meditations/ForceView"
   ],
  function($, _, promiseWordNodes, ForceView) {

    promiseWordNodes
    .done(function(wordNodes, mottos) {

      window.forceView = new ForceView({
        el: "#force_view",
        wordNodes: wordNodes
      });
      window.mottos = mottos;
      window.wordNodes = wordNodes;

    })
    .fail(function() {
      console.log("Failed mottos");
    });

});
});