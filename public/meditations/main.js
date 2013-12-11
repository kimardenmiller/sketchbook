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
   "meditations/BloomingForceView",
   "meditations/MottoView"
   ],
  function($, _, promiseWordNodes, BloomingForceView, MottoView) {

    promiseWordNodes
    .done(function(wordNodes, mottos) {

      window.forceView = new BloomingForceView({
        el: "#force_view",
        wordNodes: wordNodes
      });
      window.mottoView = new MottoView({
        el: "#motto_view",
        forceView: forceView
      });
      window.mottos = mottos;
      window.wordNodes = wordNodes;

      console.log("Force view ready.  Try: c = forceView.addMotto(mottos[4], mottos[4].wordNodes[0])");
      console.log("then: c.focusMeditateOn()");
      console.log("then: c.focusAllMottoNodes().releaseNewNodes()");
      console.log("then: c = forceView.addMotto(mottos[5], mottos[5].wordNodes[0])");

      forceView.on("highlightedMotto", function(fv, motto, wordNode) {
        console.log("Highlighted a motto!", motto, wordNode);
      });

    })
    .fail(function() {
      console.log("Failed mottos");
    });

});
});