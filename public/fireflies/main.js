
require(["/sketchbook_config.js"], function() { // load master configuration

  require(
    ['jquery', 'lodash',
     'fireflies/promiseCommentTree',
     'fireflies/treeToAuthorNodes',

     'fireflies/model/AuthorNodeEmitter',
     'fireflies/view/ForceView',
     'fireflies/view/SliderView'
    ],
    function($, _, promiseCommentTree, treeToAuthorNodes,
             AuthorNodeEmitter,
             ForceView,

             SliderView) {
      promiseCommentTree.done(function(rootComment) {
        window.rootComment = rootComment;
        console.log('rootComment:', rootComment);
        window.authorNodesEtc = treeToAuthorNodes(rootComment);
        console.log('authorNodesEtc:', authorNodesEtc);

        window.authorNodeEmitter = new AuthorNodeEmitter(authorNodesEtc);

        window.forceView = new ForceView({
          el: '#force_view',
          model: authorNodeEmitter
        });

        window.sliderView = new SliderView({
          authorNodeEmitter: authorNodeEmitter
        });

        console.log("Ready to go.  Execute: try{ forceView.update() } catch(e) {console.log(e.stack); }");

        // experiments in animating
        forceView.on('updateNodesAndLinks', function(fv, enterNodes, nodes, enterLinks, links) {

          // All new links: three step animation
          // 1) Initialize new links to red/transparent
          // 2) Transition, each with its staggered delay (but 0 transition length... just want the delay)
          // 3) When these end, suddenly make transparent, then create a new transition that fades in
          // (Note that transition.transition() doesn't work when the first transition is delayed... overrides it)
          var i=0;
          enterLinks
          .style({stroke: 'red', opacity: 0})
          .transition()
          .delay(function(d) {
            if (d) {
              // In the enter selection, some elements are undefined.  Don't want to use argument[1] as i b/c it still
              // counts the undefineds.  Make our own i counter to get accurate "this is the i-th entering item" counts
              return (i++)*50;
            }
          })
          .duration(0)
          .each('end', function(d) {
            d3.select(this)
            .style({opacity: 1})
            .transition()
            .style({stroke: '#ddd', opacity: 1});
          });
        });
      })
      .fail(function() {
        console.log("ERROR loading comment trees", arguments);
      });
    }
  );

});