
require(["/sketchbook_config.js"], function() { // load master configuration

  require(
    ['jquery', 'lodash',
     'fireflies/promiseCommentTree',
     'fireflies/treeToAuthorNodes',

     'fireflies/model/AuthorNodeEmitter',
     'fireflies/view/ForceView',
    ],
    function($, _, promiseCommentTree, treeToAuthorNodes,
             AuthorNodeEmitter,
             ForceView) {
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

        console.log("Ready to go.  Execute: try{ forceView.update() } catch(e) {console.log(e.stack); }");

      })
      .fail(function() {
        console.log("ERROR loading comment trees", arguments);
      });
    }
  );

});