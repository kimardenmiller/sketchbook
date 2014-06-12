/**
 * @module {fireflies/views/ForceView}
 * @author Dan Lopuch <dlopuch@alum.mit.edu>
 *
 * Backbone View that draws a froce-based layout of nodes.
 *
 * Roughly based off of "Collapsable Force Layout" demo: http://bl.ocks.org/mbostock/1062288
 *
 * Constructor:
 *   el: {string | domEl} Element or element selector to render into
 *   model: {model.ForceLayoutNodeEmitter} A ForceLayoutNodeEmitter model.
 *   [options.w]: {number} Width of SVG that view draws.  Defaults to element width or 600.
 *   [options.h]: {number} Height of SVG that view draws.  Defaults to element width of 500.
 *   [options.enterAtParent]: {boolean=true} If nodes have a .parent, new ones will enter at the parent's x,y.
 *                            Otherwise, nodes enter in the center of the forceview.
 *   [options.enterCenterJitter]: {number} If nodes enter in the center of the forceview, their exact enter x,y will
 *                                be +/- random number between 0 and enterCenterJitter.  Defaults 10.
 *   [options.animateExit]: {Object} Include to animation exitting nodes (falsey to make exitting nodes just disapear)
 *   [options.animateExit.msToFade]: {number} How many ms to wait before node exits
 *   [options.force.charge]: {number | function} pass-through to D3 force layout .charge()
 *
 * Attributes:
 *   this.visSvg: {d3.selection} the SVG element drawing the force view
 *   this.force: {d3.layout.force} the d3 Force layout instance driving the svg
 */
define(["jquery", "d3", "lodash", "backbone"],
function($, d3, _, Backbone) {
var DEFAULT_W = 600,
    DEFAULT_H = 500,
    FORCE_VIEW_I = 0,

    /** Data join for nodes and links.  Always use the 'id' property. */
    DATA_JOIN_ON_ID = function(d) { return d.id; },

    // Link accessor functions.  Static functions, so we're not redefining them every update.
    LINK_SOURCE_X = function(d) { return d.source.x; },
    LINK_SOURCE_Y = function(d) { return d.source.y; },
    LINK_TARGET_X = function(d) { return d.source.x; },
    LINK_TARGET_Y = function(d) { return d.source.x; },

    /** When nodes animate out of the force view, we animate them to these css params*/
    EXIT_ANIMATE_STYLE = {opacity: 0},

    /** Opposite state of the EXIT_ANIMATE_STYLE */
    ENTER_ANIMATE_STYLE = {opacity: 1};

return Backbone.View.extend({
  initialize: function(opts) {
    if (!this.model)
      throw new Error("ForceLayoutNodeEmitter required!");
    debugger;
    this.listenTo(this.model, "newActiveNodesAndLinks", this.onNewActiveNodesAndLinks);

    // Every force view gets its own ID.  This is used to scope ForceView instance-specific state onto the node Objects
    this.id = "_fv" + FORCE_VIEW_I++;

    // Set default options
    opts = this.options = _.merge({
      w: this.$el.width() || DEFAULT_W,
      h: this.$el.height() || DEFAULT_H,
      enterAtParent: true,
      enterCenterJitter: 10,
      animateExit: {
        msToFade: 1000
      }
    }, opts);

    this.visSvg = d3.select(this.el).append("svg:svg")
      .attr("width",  opts.w)
      .attr("height", opts.h);

    this.force = d3.layout.force()
      .on("tick", this._tick.bind(this))
      .size([opts.w, opts.h])
      .linkDistance(50);

    if (opts.force && opts.force.charge) {
      this.force.charge(opts.force.charge);
    }


    // ------ Instance-bound D3 callback functions -----
    // D3 and Backbone don't really get along -- D3 has its own execution scope rules for its callback functions that
    // doesn't mesh well with Backbone's object-based scoping.  We get around this impedance mismatch by assuming
    // "this" on the callbacks will reference this Backbone View (and its relevant state properties), so to force this,
    // we need to bind each callback to the Backbone instance.
    this._tick = this._tick.bind(this);
    this._colorNode = this._colorNode.bind(this);
    this._setSelectionRadius = this._setSelectionRadius.bind(this);
    this._clickNodeHandler = this._clickNodeHandler.bind(this);

    this.render();
  },

  render: function() {
    this.update();
    return this;
  },

  onNewActiveNodesAndLinks: function(emitter, nodesAndLinks) {
    this.update(nodesAndLinks);
  },

  /**
   * Restarts the ForceView with a new set of nodes and links
   * @param {Object} [nodesAndLinks] Optional.  New set of nodes and links.  If omitted, will request from the model.
   *   nodes: {Array(Object)} List of nodes to update with
   *   links: {Array(Object)} List of links to update with
   */
  update: function(nodesAndLinks) {
    nodesAndLinks = nodesAndLinks || this.model.getActiveNodesAndLinks();

    var nodes = nodesAndLinks.nodes,
        links = nodesAndLinks.links,
        self = this,
        fvID = this.id,
        opts = this.options;

    // -------------------
    // Update the nodes...
    this._nodes = this.visSvg.selectAll("circle.node")
    .data(nodes, DATA_JOIN_ON_ID)
    .style("fill", this._colorNode);

    // If we're animating things out, they could be in the middle of their outbound animations.  Animate them back in.
    if (opts.animateExit) {
      this._nodes
      .each(function(d) {
        delete d[fvID].isExitting;
      })
      .interrupt()
      .transition()
        .duration(opts.animateExit.msToFade / 2)
      .style(ENTER_ANIMATE_STYLE);
    }

    // Enter any new nodes.
    var enterNodes = this._nodes.enter().append("svg:circle")
    .each(function(d) {
      // Reserve a namespace on the nodes specific to this forceview
      if (!d[fvID])
        d[fvID] = {};

      // Init each new node to the location of it's parent so nodes swing out from the parent position
      if (opts.enterAtParent && d.parent) {
        d.x = d.px = d.parent.x;
        d.y = d.py = d.parent.y;
      } else if (opts.enterCenterJitter) {
        d.x = d.px = (self.options.w) / 2 + 2*opts.enterCenterJitter*Math.random() - opts.enterCenterJitter;
        d.y = d.py = (self.options.h) / 2 + 2*opts.enterCenterJitter*Math.random() - opts.enterCenterJitter;
      } else {
        d.x = d.px = (self.options.w) / 2;
        d.y = d.py = (self.options.h) / 2;
      }

      // Some may have already exitted but now they're back in the game.  Adjust their states.
      delete d[fvID].isExitting;
    })
    .attr("class", "node")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .call(this._setSelectionRadius)
    .on("click", this._clickNodeHandler)
    .call(this.force.drag)
    .filter(function(d) {
      return !d.isDemo;
    })
    .style("fill", this._colorNode);


    // -------------------
    // Update the links...
    this._links = this.visSvg.selectAll("line.link")
      .data(links, DATA_JOIN_ON_ID);

    // Enter any new links.
    var enterLinks = this._links.enter().insert("svg:line", ".node")
    .attr("class", "link")
    .attr("x1", LINK_SOURCE_X)
    .attr("y1", LINK_SOURCE_Y)
    .attr("x2", LINK_TARGET_X)
    .attr("y2", LINK_TARGET_Y);


    // ------------------
    // Trigger event with node and links selections (before we exit)
    this.trigger('updateNodesAndLinks', this, enterNodes, this._nodes, enterLinks, this._links, nodesAndLinks);


    // ------------------
    // Exits

    // Exit any old nodes.
    if (!opts.animateExit) {
      this._nodes.exit().remove();
    } else {
      this._nodes.exit()
      .filter(function(d) {
        // Some exit nodes may have already started the exit animation.  Let them be, they'll be removed.
        return !d[fvID].isExitting;
      })
      .each(function(d) {
        d[fvID].isExitting = true;

        // They're in the exit selection because they weren't in the list of nodes.
        // However, we still want them as part of the force view until they leave for sure.
        nodes.push(d);
      })
      .interrupt()
      .transition()
        .duration(opts.animateExit.msToFade)
      .style(EXIT_ANIMATE_STYLE)
      .each('end', function(d) {
        delete d[fvID].isExitting;
      })
      .remove(); // remove the els when transition is done
    }

    // Exit any old links.
    this._links.exit().remove();

    // Restart the force layout.
    this.force
    .nodes(nodes)
    .links(links)
    // .linkDistance(!this.options.distanceMeasure ?
                    // undefined :
                    // this.options.measures[this.options.distanceMeasure].distanceScale)
    .start();
  },

  // Force view tick: update positions of all the DOM elements per layout's calculations
  _tick: function() {
    this._links
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

    this._nodes
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });

    // Repeat for any nodes that are exiting -- still update them, even though they're on their way out
    this._nodes.exit()
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
  },

  _clickNodeHandler: function() {
    console.log("Clicked!", arguments[0][this.id], arguments);
  },

  _setSelectionRadius: function(selection) {
    var self = this;
    selection.attr("r", function(d) {
      if (!self.options.radiusMeasure) return 7;

      return self.options.measures[self.options.radiusMeasure].radiusScale(
               self.options.measures[self.options.radiusMeasure].accessor(d));
    });
  },
  _colorNode: function(d) {
    return d.isDemo ? '#82b446' : "steelblue";
  }
});
});