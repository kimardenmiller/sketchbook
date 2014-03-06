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
 *
 * Attributes:
 *   this.visSvg: {d3.selection} the SVG element drawing the force view
 *   this.force: {d3.layout.force} the d3 Force layout instance driving the svg
 */
define(["jquery", "d3", "lodash", "backbone"],
function($, d3, _, Backbone) {
var DEFAULT_W = 600,
    DEFAULT_H = 500,
    FORCE_VIEW_I = 0;

return Backbone.View.extend({
  initialize: function(opts) {
    if (!this.model)
      throw new Error("ForceLayoutNodeEmitter required!");

    this.id = "_fv" + FORCE_VIEW_I++;


    this.visSvg = d3.select(this.el).append("svg:svg")
      .attr("width",  opts.w || this.$el.width()  || DEFAULT_W)
      .attr("height", opts.h || this.$el.height() || DEFAULT_H);

    this.force = d3.layout.force()
      .on("tick", this._tick.bind(this))
      .size([opts.w || this.$el.width()  || DEFAULT_W,
             opts.h || this.$el.height() || DEFAULT_H]);


    // ------ Instance-bound D3 callback functions -----
    // D3 and Backbone don't really get along -- D3 has its own execution scope rules for its callback functions that
    // doesn't mesh well with Backbone's object-based scoping.  We get around this impedance mismatch by assuming
    // "this" on the callbacks will reference this Backbone View (and its relevant state properties), so to force this,
    // we need to bind each callback to the Backbone instance.
    this._tick = this._tick.bind(this);
  },

  _tick: function() {

  },

  render: function() {
    this.update();
    return this;
  },

  update: function() {
    var
      nodesAndLinks = this.model.getActiveNodesAndLinks(),
      nodes = nodesAndLinks.nodes,
      links = nodesAndLinks.links,
      self = this;

    // Lock the first node in the center... makes it a bit more smooth, but loses some of its fun wiggliness.
    nodes[0].fixed = this.options.fixedRoot ? true : false;


    // Update the nodes…
    this._nodes = this.visSvg.selectAll("circle.node")
      .data(nodes, function(d) { return d.id; })
      .style("fill", this._colorNode);

    // Enter any new nodes.
    this._nodes.enter().append("svg:circle")
      .each(function(d) {
        // Init each new node to the location of it's parent so nodes swing out from the parent position
        if (d.parent) {
          d.x = d.px = d.parent.x;
          d.y = d.py = d.parent.y;
        } else {
          d.x = (self.options.w || DEFAULT_W) / 2;
          d.y = (self.options.h || DEFAULT_H) * 5/6;
        }
      })
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .call(this._setSelectionRadius)
      .style("fill", this._colorNode)
      .on("click", this._clickNodeHandler)
      .call(this.force.drag);

    // Exit any old nodes.
    this._nodes.exit().remove();


    // Update the links…
    this._links = this.visSvg.selectAll("line.link")
      .data(links, function(d) { return d.target.id + "__" + d.source.id; });

    // Enter any new links.
    this._links.enter().insert("svg:line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    // Exit any old links.
    this._links.exit().remove();

    // Restart the force layout.
    this.force
      .nodes(nodes)
      .links(links)
      .linkDistance(this.options.measures[this.options.distanceMeasure].distanceScale)
      .start();
  }
});
});