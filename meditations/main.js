/**
 * d3_force example.
 *
 * This main.js loads the NodeForceView bound to some example data and renders it on the page.
 *
 * In your js console, execute go() to start the mock clock that makes the conversation grow.
 */
require(["/sketchbook/sketchbook_config.js"], function() {
require(
  ["jquery",
   "lodash",
   "meditations/promiseWordNodes",
   "meditations/BloomingForceView",
   "meditations/MottoView",
   "meditations/WordListView",
   "meditations/Palette"
   ],
  function($, _, promiseWordNodes, BloomingForceView, MottoView, WordListView, COLOR) {

    $('body').css({
      'background-color': COLOR.BG,
      'color': COLOR.MOTTO
    });

    $('input').css({
      backgroundColor: COLOR.BG,
      border: '1px solid ' + COLOR.NO_MORE,
      color: COLOR.MORE
    });

    $('.container').show();

    $('#footer .byline').css('color', COLOR.NO_MORE);
    $('#footer').removeClass('hide');

    promiseWordNodes
    .done(function(wordNodes, mottos) {

      mottos.forEach(function(m, i) {
        m.id = i;
      });

      window.forceView = new BloomingForceView({
        el: "#force_view",
        wordNodes: wordNodes
      });

      window.wordListView = new WordListView({
        el: "#word_list_view",
        wordNodes: wordNodes.list
      });

      window.mottoView = new MottoView({
        el: "#motto_view",
        forceView: forceView,
        wordListView: wordListView
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
