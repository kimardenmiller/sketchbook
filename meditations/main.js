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

    $('#footer .title').css('color', COLOR.MORE);
    $('#footer .byline').css('color', COLOR.MOTTO);
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

    })
    .fail(function() {
      console.log("Failed mottos");
    });

});
});
