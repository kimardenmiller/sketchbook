define(['jquery', 'lodash'], function($, _) {

  /**
   * @constructor {AuthorNode}
   *
   * AuthorNode: an author with all the comment nodes he's made
   *
   * @param {Object} attrs AuthorNode data.  Includes:
   *   author: {string} Unique author username
   *   commentNodes: {Array(CommentNode)} List of comments this author has made
   *   links: {Array(Object)} List of links this author made.  Each link should have a .source, .target, and .timestamp
   */
  function AuthorNode(attrs) {
    if (!attrs.author)
      throw new Error("username required");

    if (!Array.isArray(attrs.commentNodes) || !attrs.commentNodes.length)
      throw new Error("Error creating AuthorNode: invalid comment nodes specified");

    if (!Array.isArray(attrs.links)) // note links CAN be length 0: author is root author and never replied to anyone
      throw new Error("Error creating AuthorNode: invalid links specified");

    this.author = attrs.author;
    this.links = attrs.links;

    // Order all comments by time created
    this.commentNodes = _.sortBy(attrs.commentNodes, 'created_utc');
    this.firstCommentTs = this.commentNodes[0].created_utc;
    this.lastCommentTs = this.commentNodes[ this.commentNodes.length - 1 ].created_utc;
  };

  return AuthorNode;
});