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
   "meditations/Palette",

   "bootstrap"
   ],
  function($, _, promiseWordNodes, BloomingForceView, MottoView, WordListView, COLOR) {

    // Poor man's CSS (actually, we defined all colors in javascript because D3 can't animate colors defined in styles)
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

    // ain't got time to recompile bootstrap, just add some overrides
    $('#about_modal').css({
      backgroundColor: COLOR.MOTTO
    });
    $('.modal-body').css({
      backgroundColor: COLOR.MOTTO,
      color: COLOR.MEDITATE_ON
    });
    $('.modal-body h3').css({
      color: COLOR.FOCUS
    });
    $('.modal-footer').css({
      color: COLOR.MEDITATE_ON,
      backgroundColor: COLOR.BG,
      borderTop: '1px solid ' + COLOR.BG,
      boxShadow: 'inset 0 1px 0 ' + COLOR.BG,
      '-webkit-box-shadow': 'inset 0 1px 0 ' + COLOR.BG,
      '-moz-box-shadow': 'inset 0 1px 0 ' + COLOR.BG,
    });



    promiseWordNodes
    .done(function(wordNodes, mottos) {

      mottos.forEach(function(m, i) {
        m.id = i;
      });

      window.forceView = new BloomingForceView({
        el: "#force_view",
        wordNodes: wordNodes,
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


      $("#about_modal").modal({backdrop: 'static', keyboard: false});
      $('#about_modal .btn-primary').on('click', function() {
        $('#about_modal .btn-primary').remove();
        d3.select('.modal-body.main-desc').transition().duration(500).style('opacity',0);
        d3.select('.tagout')
        .classed('hide', false)
        .style('opacity', 0)
        .transition().delay(800)
        .each('end', function() {
          d3.select(this)
          .style('opacity', 1)
          .transition().delay(2000).duration(3000)
          .style('opacity', 0)
          .each('end', function() {
            $("#about_modal").modal('hide');
          });
        });
      });


    })
    .fail(function() {
      console.log("Failed mottos");
    });

});
});