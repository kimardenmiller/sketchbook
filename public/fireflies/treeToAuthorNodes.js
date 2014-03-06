/**
 * Parses a comment tree to make a list of AuthorNodes
 */
define(['lodash', 'fireflies/model/AuthorNode'], function(_, AuthorNode) {

  return function(rootNode) {
    var authorDataByAuthor = {},
        allLinks = [],
        toVisit = [rootNode];

    while (toVisit.length) {
      var comment = toVisit.pop();

      comment.children.forEach(function(c) {
        toVisit.push(c);
      });

      if (!authorDataByAuthor[comment.author]) {
        authorDataByAuthor[comment.author] = {
          author: comment.author,

          /** List of all comment nodes the author has made */
          commentNodes: [],

          /** List of source/target link objects to other AuthorNodes, one linke for every comment made */
          links: []
        };
      }

      authorDataByAuthor[comment.author].commentNodes.push(comment);

      // Create links between authors, where every link is a reply to someone ('target' is parent author)
      if (comment.parent) {
        var link = {
          source: undefined, // the AuthorNode who made the comment (filled in below, after AuthorNodes are made)
          target: undefined, // the AuthorNode who this comment was a reply to

          sourceAuthor: comment.author,
          targetAuthor: comment.parent.author,

          comment: comment,
          replyToComment: comment.parent,

          timestamp: comment.created_utc,
        };
        authorDataByAuthor[comment.author].links.push(link);
        allLinks.push(link);
      }
    }


    // Now create the AuthorNodes
    var authorNodes = [], authorNodesByAuthor = {};
    for (var a in authorDataByAuthor) {
      var authorNode = new AuthorNode(authorDataByAuthor[a]);
      authorNodes.push(authorNode);
      authorNodesByAuthor[a] = authorNode;
    }
    authorNodes = _.sortBy(authorNodes, authorNodes.firstCommentTs);


    // Fill in the links' .source and .target with the appropriate AuthorNodes
    allLinks.forEach(function(link) {
      link.source = authorNodesByAuthor[ link.sourceAuthor ];
      link.target = authorNodesByAuthor[ link.targetAuthor ];
    });
    allLinks = _.sortBy(allLinks, 'timestamp');


    return {
      authorNodes: authorNodes,
      links: allLinks,
      authorDataByAuthor: authorDataByAuthor
    };
  };
});