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
   "meditations/promiseWordNodes"
   ],
  function($, _, promiseWordNodes) {

    promiseWordNodes
    .done(function(wordNodes) {
      window.wordNodes = wordNodes;
      console.log("Got word nodes!", wordNodes);
      wordNodes.list.forEach(function(wn) {
        console.log(wn.count, wn.id);
      });
    })
    .fail(function() {
      console.log("Failed mottos");
    });

});
});