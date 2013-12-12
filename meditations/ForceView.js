/**
 * @deprecated This was first iteration, look at BloomingForceView.  Or, look at git history for what this looked like.
 *
 * @module {meditations.ForceView} Force view of word nodes used in mottos
 *
 * Requires:
 *   options.wordNodes {Object} Object with .links and .list attributes for the word nodes and their links
 *
 * Events:
 *
 *   hoverNode (this, {Object} selectedWordNode, {jqEvent})
 *     Emitted when we hover over a word node
 *
 *   clickNode (this, {Object} selectedWordNode, {jqEvent})
 *     Emitted when we click a word node
 */
define(["jquery", "d3", "lodash", "backbone"],
function($, d3, _, Backbone) {

var DEFAULT_W = 600,
    DEFAULT_H = 500,

    NODE_FORCE_VIEW_I = 0,

    FADE_LINKS_MS = 500;

var WORD_NODE_JOIN = function(d) { return d.id; },

    LINK_JOIN = function(l) { return l.id; },

    COLOR_NODE = function(d) {
      return d.mottos.length === 1 ? "lightgrey" : "steelblue";
    },

    STYLE_LINK = function(d) {
      var style;
      if (d.source.mottos.length === 1 || d.target.mottos.length === 1) {
        style = {
          stroke: '#eee',
          strokeWidth: '0.5px'
        };

      } else {
        style = {
          stroke: 'steelblue',
          strokeWidth: '1.5px'
        };
      }

      d3.select(this)
      .transition() // inherit transition timings from the .each() call
      .style(style);

    };

return Backbone.View.extend({

  events: {
    "mouseover circle": "_onHoverNode",
    "mouseout circle": "_onHoverOutNode",
    "click circle": "_onClickNode"
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

  /**
   * Call to force a highlight of a specific motto's word nodes
   * @param {Object} motto object linked with the word nodes
   */
  selectMotto: function(motto) {
    if (this._highlightedMottoNodes) {
      this.deselectNodes();
    }

    this._highlightedMottoNodes = motto.wordNodes;

    this.svgNodeG.selectAll("circle.node")
      .data(motto.wordNodes, WORD_NODE_JOIN)
    .interrupt()
    .transition()
      .duration(200)
    .style("fill", "red");
  },

  /**
   * Call to force a highlight of the links between all the word nodes in a specific motto
   * @param {Object} motto object linked with the word nodes
   * @param {number} durationMs
   */
  selectMottoLinks: function(motto, durationMs) {

    if (!durationMs || durationMs < 0) durationMs = 200;

    // Create selectedLinks, a list of each unique link between wordNodes used in this motto
    var selectedLinks = [],
        selectedLinksIdx = {},
        wordNodeIdx = {};
    motto.wordNodes.forEach(function(wn) { wordNodeIdx[wn.id] = true; }); // first, index all wn's used in this motto
    motto.wordNodes.forEach(function(wordNode) {
      for (var k in wordNode.links) {
        if (!selectedLinksIdx[ wordNode.links[k].id ] && // we haven't grabbed this link yet, AND
            wordNodeIdx[ wordNode.links[k].source.id] && // BOTH the source and target are word nodes in this motto
            wordNodeIdx[ wordNode.links[k].target.id] ) {

          selectedLinksIdx[ wordNode.links[k].id ] = true;
          selectedLinks.push( wordNode.links[k] );
        }
      }
    });

    this._highlightedMottoLinks = selectedLinks;

    this.svgLinkG.selectAll("line.link")
    .data(selectedLinks, LINK_JOIN)
    .interrupt()
    .transition()
      .duration(durationMs)
    .style("stroke", "red");
  },

  deselectNodes: function() {
    if (this._highlightedMottoNodes) {
      this.svgNodeG.selectAll("circle.node")
        .data(this._highlightedMottoNodes, WORD_NODE_JOIN)
      .interrupt()
      .transition()
        .duration(200)
      .style("fill", COLOR_NODE);

      delete this._highlightedMottoNodes;
    }

    if (this._highlightedMottoLinks) {

      this.svgLinkG.selectAll("line.link")
      .data(this._highlightedMottoLinks, LINK_JOIN)
      .interrupt()
      .transition()
        .duration(200)
      .each(STYLE_LINK);

      delete this._highlightedMottoLinks;
    }
  },

  _onHoverNode: function(e) {
    wordNode = d3.select(e.target).datum();

    console.log("fv: firing selectedNode");

    this.trigger("hoverNode", this, wordNode, e);
  },

  _onClickNode: function(e) {
    this.trigger("clickNode", this, d3.select(e.target).datum(), e);
  },

  _onHoverOutNode: function() {
    this.deselectNodes();
  },

  /**
   * Don't draw the links until the force is ended (optimization to speed things up from initial chaos)
   */
  _showLinks: function() {
    if (this._linkSel)
      return;

    this._linkSel = this.svgLinkG.selectAll("line.link")
      .data(this._links, LINK_JOIN)
    .enter().append("line")
      .attr("class", 'link')
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .style("stroke", "#fff");
    this._linkSel
    .transition()
      .duration(1000)
    .each(STYLE_LINK);
  },

  render: function() {
    var self = this;

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
      .style("fill", COLOR_NODE)
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