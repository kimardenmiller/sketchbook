/**
 * @module {fireflies/model/AuthorNodeEmitter}
 * @author Dan Lopuch <dlopuch@alum.mit.edu>
 *
 * A {ForceLayoutNodeEmitter} for {AuthorNode}'s
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

      if (!attrs.links || !Array.isArray(attrs.links))
        throw new Error("links required!");
      this.allLinks = attrs.links;

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

      this.currentAuthorI = 0;
    },

    getActiveNodesAndLinks: function() {
      var nodes = this.allAuthorNodes.slice(0, this.currentAuthorI++),
          nodesIdx = {};
      nodes.forEach(function(an) {
        nodesIdx[an.id] = true;
      });
      var links = [];
      nodes.forEach(function(an) {
        an.commentNodes.forEach(function(comment) {
          if (comment.link && nodesIdx[ comment.link.target.id ]) {
            links.push(comment.link);
          }
        });
      });

      // Self links wreak havoc on the force view... get rid of them.
      links = links.filter(filterOutSelfLinks);

      return {
        nodes: nodes,
        links: links
      };
    }
  });
});