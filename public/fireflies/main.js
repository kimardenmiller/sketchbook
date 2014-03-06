
require(["/sketchbook_config.js"], function() { // load master configuration

  require(
    ['jquery', 'lodash',
     'fireflies/promiseCommentTree',
     'fireflies/treeToAuthorNodes'],
    function($, _, promiseCommentTree, treeToAuthorNodes) {
      promiseCommentTree.done(function(rootComment) {
        window.rootComment = rootComment;
        console.log('rootComment:', rootComment);
        window.authorNodesEtc = treeToAuthorNodes(rootComment);
        console.log('authorNodesEtc:', authorNodesEtc);
      })
      .fail(function() {
        console.log("ERROR loading comment trees", arguments);
      });
    }
  );

});