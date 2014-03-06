
define(["jquery", 'underscore'], function($, _) {
  var deferred = $.Deferred();

  // TODO: Shim to load data from pre-built JSON.  Later use the RedditParser to get dynamic comment trees.
  //       This JSON file is the transformed output from RedditParser, except for the .parent circular reference.
  $.getJSON('/comment_tree_parsers/example_data/dataisbeautiful_1ty2i3.json')
  .done(function(rootNode) {
    // Crawl through the tree and set the 'parent' links.  Normally RedditParser does this, but we dumped the data to
    // JSON and JSON can't store circular references
    rootNode.parent = null;
    var toVisit = [rootNode];

    while (toVisit.length) {
      var node = toVisit.pop();

      node.children.forEach(function(child) {
        child.parent = node;
        toVisit.push(child);
      });
    }

    deferred.resolve(rootNode);
  })
  .fail(function(err) {
    deferred.reject(err);
  });

  return deferred.promise();
});