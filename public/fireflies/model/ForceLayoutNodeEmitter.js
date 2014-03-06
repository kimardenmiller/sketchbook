/**
 * @module {fireflies/model/ForceLayoutNodeEmitter}
 * @author Dan Lopuch <dlopuch@alum.mit.edu>
 *
 * Abstract event emitter class that emits nodes to be fed into the ForceView.
 *
 * A ForceLayoutNodeEmitter has Backbone.Events functions mixed in -- listenTo, trigger, etc.
 *
 * Define subclasses with the usual Backbone extend() pattern, ie:
 *   var MyNodeEmitter = ForceLayoutNodeEmitter.extend({
 *     initialize: function(attrs) { ... },
 *     foo: function() {...},
 *     ...
 *   })
 *
 */
define(["jquery", "d3", "lodash", "backbone"],
function($, d3, _, Backbone) {

  function ForceLayoutNodeEmitter(attrs) {
    this.attrs = attrs;
    this.initialize(attrs);
  };

  ForceLayoutNodeEmitter.extend = Backbone.Model.extend;

  _.extend(ForceLayoutNodeEmitter.prototype, Backbone.Events, {

    initialize: function(attrs) {
      // nothing to do in abstract base class.
    },

    /**
     * @returns {Object} current nodes and links, however 'current' is defined.  Object is:
     *   nodes: {Array(Object)} List of nodes
     *   links: {Array(Object)} List of links, that is Objects with a .source and .target pointing to some node
     */
    getActiveNodesAndLinks: function() {
      throw new Error("Abstract ForceLayoutNodeEmitter: getActiveNodesAndLinks not implemented");
    }

  });

  return ForceLayoutNodeEmitter;
});