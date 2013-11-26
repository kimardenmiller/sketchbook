define(["jquery", "d3", "lodash", "backbone"],
function($, d3, _, Backbone) {

var DEFAULT_W = 600,
    DEFAULT_H = 500,

    NODE_FORCE_VIEW_I = 0;


return Backbone.View.extend({

  events: {
    "mouseover circle": "_highlightMotto",
    "mouseout circle": "_unhighlightMotto"
    // "mouseout circle": "_unhighlightNode",
    // "change .nfv-radius-measures": "_handleSelectRadius",
    // "change .nfv-color-measures":  "_handleSelectColor"
  },

  initialize: function(opts) {

    if (!opts.wordNodes)
      throw new Error("requires wordNodes");

    this.id = "_nfv" + NODE_FORCE_VIEW_I++;

    this.svg = d3.select(this.el).append("svg:svg")
      .attr("width",  opts.w || this.$el.width()  || DEFAULT_W)
      .attr("height", opts.h || this.$el.height() || DEFAULT_H);

    this.svgLinkG = this.svg.append("g").attr("class", "links");
    this.svgNodeG = this.svg.append("g").attr("class", "nodes");


    // ------ Instance-bound D3 callback functions -----
    // D3 and Backbone don't really get along -- D3 has its own execution scope rules for its callback functions that
    // doesn't mesh well with Backbone's object-based scoping.  We get around this impedance mismatch by assuming
    // "this" on the callbacks will reference this Backbone View (and its relevant state properties), so to force this,
    // we need to bind each callback to the Backbone instance.
    this._forceTick = this._forceTick.bind(this);
    this._showLinks = this._showLinks.bind(this);



    // TODO: Make these configurable?
    this.nodeSizeScale = d3.scale.log().domain([1, 65]).range([2,10]);
    var chargeScale = d3.scale.linear().domain([1,65]).range([-10, -500]);

    this.force = d3.layout.force()
      .on("tick", this._forceTick)
      .on("end", this._showLinks)
      .size([opts.w || this.$el.width()  || DEFAULT_W,
             opts.h || this.$el.height() || DEFAULT_H])
      .charge(function(n) { return chargeScale(n.count); })
      .linkStrength(function(l) { return l.numSharedMottos / 10; });

    this.setNodes(opts.wordNodes.list, opts.wordNodes.links);


    // Kickstart the initial render
    this.render();
  },

  setNodes: function(nodes, links) {
    this._nodes = nodes;
    this._links = links;

    this.force
    .nodes(nodes)
    .links(links);

    return this;  // probably want to call .render() next
  },

  _forceTick: function() {

    // _linkSel and _nodeSel are link and node selections set in the render method
    // Update them to new positions determined by the force layout

    if (this._linkSel) {
      this._linkSel
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
    }

    this._nodeSel
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
  },

  _highlightMotto: function(e) {
    wordNode = d3.select(e.target).datum();
    console.log("\n\n-----------------");
    wordNode.mottos.forEach(function(m, i) {
      console.log((i === 0 ? "> " : "") + m.motto + "   (" + m.university + ")");
    });
    console.log("   - \"" + wordNode.id + "\" (" + wordNode.count + ")");

    // highlight nodes of the first motto
    this._highlightedMottoNodes = wordNode.mottos[0].wordNodes;
    this.svgNodeG.selectAll("circle.node")
      .data(this._highlightedMottoNodes, function(d){ return d.id; })
    .interrupt()
    .transition()
      .duration(200)
    .style("fill", "red");
  },

  _unhighlightMotto: function() {
    this.svgNodeG.selectAll("circle.node")
      .data(this._highlightedMottoNodes, function(d) { return d.id; })
    .interrupt()
    .transition()
      .duration(200)
    .style("fill", "steelblue");
  },

  /**
   * Don't draw the links until the force is ended (optimization to speed things up from initial chaos)
   */
  _showLinks: function() {
    if (this._linkSel)
      return;

    this._linkSel = this.svgLinkG.selectAll("line.link")
      .data(this._links)
    .enter().append("line")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .style("opacity", 0);
    this._linkSel
    .transition()
      .duration(1000)
      .style("opacity", 1);
  },

  render: function() {
    var self = this,
        FADE_LINKS_MS = 500;

    if (this._linkSel) {
      var killLinkSel = function() {
        delete self._linkSel;
        killLinkSel = function() {}; // execute only once
      };
      this._linkSel
      .transition()
        .duration(FADE_LINKS_MS)
        .style("opacity", 0)
        .remove()
        .each("end", function() {killLinkSel();});
    }

    this._nodeSel = this.svgNodeG.selectAll("circle.node")
      .data(this._nodes, function(d) {return d.id;});
    this._nodeSel.enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d) { return self.nodeSizeScale(d.count); })
      .style("fill", "steelblue")
      .call(this.force.drag);

    if (this._linkSel) {
      // wait for links to die off before restarting
      setTimeout(this.force.start, FADE_LINKS_MS + 16);
    } else {
      this.force.start();
    }

    return this;
  }

});

});