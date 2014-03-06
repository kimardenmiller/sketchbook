/**
 * @module {fireflies/model/AuthorNodeEmitter}
 * @author Dan Lopuch <dlopuch@alum.mit.edu>
 *
 * A {ForceLayoutNodeEmitter} for {AuthorNode}'s
 *
 * Constructor:
 *
 */
define(["jquery", "d3", "lodash", "backbone", './ForceLayoutNodeEmitter'],
function($, d3, _, Backbone, ForceLayoutNodeEmitter) {
  return ForceLayoutNodeEmitter.extend({
    initialize: function(attrs) {
      console.log("AuthorNodeEmitter initialized!");
    }
  });
});