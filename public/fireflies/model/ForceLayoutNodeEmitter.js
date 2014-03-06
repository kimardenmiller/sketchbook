/**
 * @module {fireflies/model/ForceLayoutNodeEmitter}
 * @author Dan Lopuch <dlopuch@alum.mit.edu>
 *
 * Abstract event emitter class that emits nodes to be fed into the ForceView.
 *
 * (Basically a model for the force view, but without all the REST-ful baggage that a Backbone Model carries.)
 *
 * A ForceLayoutNodeEmitter has Backbone.Events functions mixed in.
 * Define subclasses with the usual Backbone extend() function.
 *
 * Constructor:
 *
 */
define(["jquery", "d3", "lodash", "backbone"],
function($, d3, _, Backbone) {

  function ForceLayoutNodeEmitter(attrs) {
    this.initialize(attrs);
  };

  ForceLayoutNodeEmitter.extend = Backbone.Model.extend;

  _.extend(ForceLayoutNodeEmitter.prototype, Backbone.Events, {

    initialize: function(attrs) {
      // nothing to do in abstract base class.
    },

    getActiveNodesAndLinks: function() {
      throw new Error("Abstract ForceLayoutNodeEmitter: getActiveNodesAndLinks not implemented");
    }

  });

  return ForceLayoutNodeEmitter;
});