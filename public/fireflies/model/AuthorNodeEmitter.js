/**
 * @module {fireflies/model/AuthorNodeEmitter}
 * @author Dan Lopuch <dlopuch@alum.mit.edu>
 *
 * A {ForceLayoutNodeEmitter} for {AuthorNode}'s
 *
 * Options passed to constructor:
 *   authorNodes: {Array(AuthorNode)} All author nodes, sorted by firstCommentTs
 *   links: {Array(Object)} List of links (comments) between AuthorNodes (.source and .target), sorted by timestamp
 *   allComments: {Array(Object)} List of comments, sorted by timestamp (creation date)
 *   [linkWindowPercentage]: {number} Value between 0 and 1.  Let t be the time between the first and last comment.
 *                                    Links will be emitted if the last comment in their branch was created within
 *                                    t*window ms of the updated time.  Recommend 0.01-0.05 for dense conversations.
 *   [linkWindowValue]: {number} Links will be emitted if the last comment in their branch was created within
 *                               linkWindowValue ms of the updated time.
 *
 *
 * Constructor:
 *   attrs.authorNodes: {Array(AuthorNode)} List of AuthorNodes in the force view
 *   attrs.links: {Array(Object)} list of all the links in the force view, where links are d3-force-view objects
 */
define(["jquery", "d3", "lodash", "backbone", './ForceLayoutNodeEmitter'],
function($, d3, _, Backbone, ForceLayoutNodeEmitter) {

  function filterOutSelfLinks(link) {
    return link.source !== link.target;
  };

  /**
   * @class AuthorNodeEmitter
   */
  return ForceLayoutNodeEmitter.extend({
    initialize: function(attrs) {
      if (!attrs.authorNodes || !Array.isArray(attrs.authorNodes))
        throw new Error("authorNodes required!");
      this.allAuthorNodes = attrs.authorNodes;

      // links are comments: a link is made with a comment from source:creating author to target:parent comment's author
      // We assume links is sorted by .timestamp ascending (ie oldest first)
      if (!attrs.links || !Array.isArray(attrs.links))
        throw new Error("links required!");
      this.allLinks = attrs.links;

      if (!attrs.allComments || !Array.isArray(attrs.allComments))
        throw new Error("allComments required!");
      this.allComments = attrs.allComments;

      if (attrs.linkWindowPercentage) {
        this.linkWindow = (attrs.allComments[attrs.allComments.length - 1].created_utc -
                           attrs.allComments[0].created_utc) * attrs.linkWindowPercentage;
      } else if (attrs.linkWindowValue) {
        this.linkWindow = attrs.linkWindowValue;
      }

      for (var l=0; l<attrs.links.length; l++) {
        if (!attrs.links[l].source || !attrs.links[l].target)
          throw new Error("Invalid link!");
        if (!attrs.links[l].id) {
          // You should make sure your links have unique IDs for the force view's joins.  If you don't have ID's, we're
          // going to try to make some based off of the source and target IDs.
          // Doesn't REALLY guarentee uniqueness, though... you should guarentee uniqueness yourself.
          attrs.links[l].id = attrs.links[l].source.id + "__" + attrs.links[l].target.id + "__" + Math.random();
          console.warn("Link missing id! Making random id: " + attrs.links[l].id);
        }
      }

      this._lastActiveAuthorI = 0;
    },

    setLinkWindowPercentage: function(linkWindowPercentage) {
      if (!linkWindowPercentage)
        this.linkWindow = null;

      this.linkWindow = (this.allComments[this.allComments.length - 1].created_utc -
                         this.allComments[0].created_utc) * linkWindowPercentage;
      this.emitAuthorsUpToTs(this._lastUpdatedTs);
    },

    setLinkWindowValue: function(linkWindowValue) {
      this.linkWindow = linkWindowValue || null;
      this.emitAuthorsUpToTs(this._lastUpdatedTs);
    },

    getActiveNodesAndLinks: function() {
     return {
       nodes: [], //_.clone(this.allAuthorNodes),
       links: []
     };
    },

    emitAuthorsUpToTs: function(ts) {
      if (!ts) ts = 0;

      var authors = {}; // emit only the authors who have participated so far

      for (var i=0; i<this.allLinks.length; i++) {
        // links will be the slice of links created before the timestamp.  Break once we pass the timestamp
        if (this.allLinks[i].timestamp > ts) {
          break;
        }

        // otherwise, index the authors
        authors[ this.allLinks[i].comment.author ] = this.attrs.authorNodesByAuthor[ this.allLinks[i].comment.author ];
      }

      this._lastUpdatedTs = ts;

      var self = this;

      var links = this.allLinks.slice(0, i)
      .filter(filterOutSelfLinks); // Self links wreak havoc on the force view... get rid of them.

      if (this.linkWindow) {
        links = links.filter(function(link) {
          // Include only links done in the last 5 minutes
          return link.comment.last_branch_ts + self.linkWindow > ts;
        });
      }

      this.trigger('newActiveNodesAndLinks', this, {
        //nodes: _.clone(this.allAuthorNodes),
        nodes: _.values(authors),
        links: links
      });
    },

    /**
     * Returns the timestamp of the earliest comment made by any author
     */
    getMinAuthorTs: function() {
      return this.allAuthorNodes[0].firstCommentTs;
    },

    /**
     * Returns the timestamp of the last comment made by any author
     */
    getMaxAuthorTs: function() {
      return d3.max(this.allAuthorNodes, function(an) {return an.lastCommentTs;});
    }
  });
});