/**
 * @module {meditations.ForceView} Blooming force view of word nodes used in mottos
 *
 * Requires:
 *   nothing
 *
 * Events:
 *   tick (this, {d3.layout.force} forceView): Emitted when the force view ticks
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
      return (!d.shownMottos || Object.keys(d.shownMottos).length === d.mottos.length) ? "lightgrey" : "steelblue";
    },

    COLOR_FOCUSED_NODE = function(d) {
      return 'red';
    },

    STYLE_FOCUSED_LINK_STROKE = function(d) {
      return 'red';
    },

    STYLE_EACH_LINK = function(d) {
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
    },

    STYLE_LINK_STROKE = function(d) {
      return (d.source.mottos.length === 1 || d.target.mottos.length === 1) ? '#eee' : 'steelblue';
    },

    STYLE_LINK_STROKE_WIDTH = function(d) {
      return (d.source.mottos.length === 1 || d.target.mottos.length === 1) ? '0.5px' : '1.5px';
    };

return Backbone.View.extend({

  events: {
    "mouseover circle": "_onHoverNode",
    "mouseout circle": "_onHoverOutNode",
    "click circle": "_onClickNode",
  },

  initialize: function(opts) {

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
    this._forceLayoutTick = this._forceLayoutTick.bind(this);
    // this._showLinks = this._showLinks.bind(this);



    // TODO: Make these configurable?
    this.nodeSizeScale = d3.scale.log().domain([1, 65]).range([2,10]);
    var chargeScale = d3.scale.linear().domain([1,65]).range([-10, -500]);

    this._forceSize = [
      opts.w || this.$el.width()  || DEFAULT_W,
      opts.h || this.$el.height() || DEFAULT_H
    ];

    this.force = d3.layout.force()
      .on("tick", this._forceLayoutTick)
      .size(this._forceSize)
      .charge(function(n) { return chargeScale(n.count); })
      .linkStrength(function(l) { return l.numSharedMottos / 10; });


    // Force view will get nodes from here
    this._nodes = [];
    this._nodesIdx = {};
    this._links = [];
    this._linksIdx = {};


    this.render();
  },

  _onHoverNode: function(e) {
    if (this._blockHover)
      return;

    this.trigger('hoverNode', this, d3.select(e.target).datum(), e);
  },

  _onHoverOutNode: function(e) {
    if (this._blockHover)
      return;
  },

  _onClickNode: function(e) {
    if (this._blockHover)
      return;

    this._blockHover = true;
    this.trigger('clickNode', this, d3.select(e.target).datum(), e);
  },

  /**
   * Adds a motto's wordNodes to the display, returning a control board for the puppetmaster
   * @param {Object} motto to add
   * @param {Object} meditateOnWordNode the wordNode being focused.  Must be a wordNode in motto.  The new nodes all
   *                 start underneath this node and pop/bloom outwards.  If this is a new node, it is created in the
   *                 center of the force view.
   *
   * @returns {Object} controller for the puppetmaster:
   *   releaseNewNodes: {function()} Lets the new nodes all pop out from the meditateOn wordNode.
   *   releaseMeditateOn: {function()} Releases the meditateOnWordNode to the forces of the force view
   */
  addMotto: function(motto, meditateOnWordNode) {

    var newNodes = [];
    motto.wordNodes.forEach(function(wn) {
      if (!(wn.id in this._nodesIdx)) {
        this._nodesIdx[wn.id] = true;
        this._nodes.push(wn);
        newNodes.push(wn);
      }

      if (!wn.displayedMottosIdx) {
        wn.displayedMottosIdx = {};
      }
      wn.displayedMottosIdx[motto.id] = true;
    }, this);

    var mottoNodesIdx = _.indexBy(motto.wordNodes, 'id');

    // wordNodes will have links to wordNodes not yet displayed.  Gather all the links only to the wordNodes
    // currently being displayed
    var newLinks = [],
        mottoLinks = [];
    motto.wordNodes.forEach(function(wn) {
      _.forIn(wn.links, function(link, toWn) {
        if (link.source.id in mottoNodesIdx && link.target.id in mottoNodesIdx) {
          mottoLinks.push(link);
        } else {
          // this link is not part of the current motto, move along.
          return;
        }


        if (!(link.id in this._linksIdx) &&
            link.source.id in this._nodesIdx &&
            link.target.id in this._nodesIdx) {
          this._linksIdx[link.id] = true;
          this._links.push(link);
          newLinks.push(link);
        }

      }, this);
    }, this);


    // All new nodes are going to originate off the meditateOnWordNode node.
    // See if that one has a placement already, if not center it.
    if (!('x' in meditateOnWordNode)) {
      meditateOnWordNode.x = this._forceSize[0]/2;
      meditateOnWordNode.y = this._forceSize[1]/2;
      meditateOnWordNode.px = this._forceSize[0]/2;
      meditateOnWordNode.py = this._forceSize[1]/2;
    }
    meditateOnWordNode.fixed = true;

    // New nodes all start under the meditateOnWordNode node -- they bloom/pop out from there when released.
    newNodes.forEach(function(wn) {
      wn.x = meditateOnWordNode.x;
      wn.y = meditateOnWordNode.y;
      wn.px = meditateOnWordNode.px;
      wn.py = meditateOnWordNode.py;

      // the new nodes will be initially fixed in the force view
      wn.fixed = true;
    });

    // Reconfigure the force view to use the new nodes
    this.force
    .nodes(this._nodes)
    .links(this._links);

    // Now we create the new DOM elements
    var self = this;

    if (newNodes.length) {
      var nodeSel = this.svgNodeG.selectAll("circle.node")
        .data(newNodes, WORD_NODE_JOIN);
      nodeSel.enter().append('circle')
        .attr('class', 'node')
        .attr('r', function(d) { return self.nodeSizeScale( Object.keys(d.shownMottos).length ); })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .style('fill', COLOR_NODE)
        .style('opacity', 0)
        .call(this.force.drag);

      // memoize total joined node selection for fast tick'ing
      this._nodeSel = this.svgNodeG.selectAll('circle.node').data(this._nodes, WORD_NODE_JOIN);
    }

    if (newLinks.length) {
      var linkSel = this.svgLinkG.selectAll("line.link")
        .data(newLinks, LINK_JOIN)
      .enter().append("line")
        .attr("class", 'link')
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .style("stroke", STYLE_LINK_STROKE)
        .style("strokeWidth", STYLE_LINK_STROKE_WIDTH);

      // memoize total joined link selection for fast tick'ing
      this._linkSel = this.svgLinkG.selectAll('line.link').data(this._links, LINK_JOIN);
    }

    // Pre-calculate some selections for the controlboard.
    var meditateOnNodeSel = this.svgNodeG.selectAll('circle.node').data([meditateOnWordNode], WORD_NODE_JOIN),
        allMottoNodesSel = this.svgNodeG.selectAll('circle.node').data(motto.wordNodes, WORD_NODE_JOIN),
        allLinksSel = this.svgLinkG.selectAll('line.link').data(mottoLinks, LINK_JOIN);

    meditateOnNodeSel.style('opacity', 1); // incase it's a new node and set to 0

    // Clear previous selections if they still exist
    if (this._lastNewMottoController) {
      this._lastNewMottoController._fastFocus().releaseNewNodes().releaseMeditateOn().unfocusAll();
      delete this._lastNewMottoController;
    }
    this._lastNewMottoController = new function() {
      this.start = self.force.start;

      this.meditateOnEl = meditateOnNodeSel[0][0];

      this.focusMeditateOn = function(duration) {
        meditateOnWordNode.fixed = true;
        meditateOnNodeSel.transition().duration(duration || 800)
        .attr('r', function(d) { return self.nodeSizeScale( Object.keys(d.shownMottos).length ); })
        .style('fill', COLOR_FOCUSED_NODE);
        return this;
      };

      this.focusAllMottoNodes = function(duration) {
        allMottoNodesSel
        .transition().duration(duration || 800)
        .attr('r', function(d) { return self.nodeSizeScale( Object.keys(d.shownMottos).length ); })
        .style('fill', COLOR_FOCUSED_NODE)
        .style('opacity', 1);
        meditateOnNodeSel.transition().style('fill', 'orchid');
        allLinksSel.transition().duration(duration || 800).style('stroke', STYLE_FOCUSED_LINK_STROKE);
        return this;
      };

      // Incase we expand things too quickly -- show everything if the next one is starting
      this._fastFocus = function() {
        allMottoNodesSel
        .interrupt()
        .style('opacity', 1)
        .attr('r', function(d) { return self.nodeSizeScale( Object.keys(d.shownMottos).length ); });
        return this;
      };

      // Want to call this AFTER focusAllMottoNodes since they have opacity 0 until that's called
      this.releaseNewNodes = function() {
        newNodes.forEach(function(wn) { wn.fixed = false; });
        meditateOnWordNode.fixed = true;
        self.force.start();
        return this;
      };

      this.releaseMeditateOn = function() {
        meditateOnWordNode.fixed = false;
        self.force.start();
        return this;
      };

      this.semiFocusAll = function(duration) {
        allMottoNodesSel.transition().duration(duration || 800).style('fill', 'DarkSlateBlue');
        allLinksSel.transition().duration(duration || 800).style('stroke', 'DarkSlateBlue');
        return this;
      };

      this.unfocusAll = function(duration) {
        allMottoNodesSel.transition().duration(duration || 800).style('fill', COLOR_NODE);
        allLinksSel.transition().duration(duration || 800).style('stroke', STYLE_LINK_STROKE);

        // let things wiggle a bit more before allowing new hovers
        setTimeout(function() {
          self._blockHover = false;
        }, 800);

        return this;
      };
    }();

    return this._lastNewMottoController;
  },

  _forceLayoutTick: function() {
    // _linkSel and _nodeSel are link and node selections adjusted every time you add a new motto
    // Update them to new positions determined by the force layout

    this._linkSel
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

    this._nodeSel
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });

    // D3 allows only a single event listener... let anyone hear the tick-tock of my clock
    this.trigger('tick', this, this.force);
  },

  render: function() {
    return this;
  }
});


});