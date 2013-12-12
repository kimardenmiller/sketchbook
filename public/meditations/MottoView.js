/**
 * @module {meditations.MottoView} View of selected mottos from the force view
 *
 * Requires:
 *   options.forceView {meditations.ForceView} ForceView instance so we can trigger motto highlights
 *   options.wordListView {meditations.WordListView} WordList view so we know when a word node has been selected
 *
 * Events:
 */
define(["jquery", "d3", "lodash", "backbone"],
function($, d3, _, Backbone) {


return Backbone.View.extend({
  initialize: function(options) {
    if (!options.forceView) throw new Error("ForceView instance required!");
    if (!options.wordListView) throw new Error("WordListView instance required!");

    this.listenTo(this.options.wordListView, "selectedWordNode", this._pickAndShowMotto);
    this.listenTo(this.options.forceView, "hoverNode", this._handleHoverNode);
    this.listenTo(this.options.forceView, "clickNode", this._pickNextMotto);

    this.listenTo(this.options.forceView, "tick", this._forceLayoutTick.bind(this));

    this._initialOffset = this.$el.offset();
  },

  _pickNextMotto: function(view, wordNode) {
    var lastNextMs = new Date() - this._lastNext;
    this._lastNext = new Date();

    var nextMotto, lastMottoI;
    _.forEach(wordNode.mottos, function(m, i) {
      if (!(m.id in wordNode.shownMottos)) {
        nextMotto = m;
      } else if (m === wordNode.lastMottoShown) {
        lastMottoI = i;
      }
    });

    if (!nextMotto) {
      nextMotto = wordNode.mottos[ ((lastMottoI || 0) + 1) % wordNode.mottos.length ];
    }

    this._showMotto(nextMotto, wordNode, {
      //meditateWordMs: Math.min(lastNextMs, 800)
    });
  },

  _pickAndShowMotto: function(view, wordNode) {
    if (this._curWordNode === wordNode)
      return this._pickNextMotto(view, wordNode);

    this._curWordNode = wordNode;
    this._curMottoI = Math.floor(Math.random() * wordNode.mottos.length);
    this._showMotto(wordNode.mottos[this._curMottoI], wordNode);
  },

  _handleHoverNode: function(forceView, wordNode) {
    if (this._debounceHoverNode === wordNode)
      return;

    this._debounceHoverNode = wordNode;

    this._showMotto(wordNode.lastMottoShown, wordNode, {
      meditateWordMs: 400,
      dontReleaseMeditate: true,
      skipUnfocus: true
    });
  },

  _showMotto: function(motto, wordNode, opts) {
    opts = opts || {};

    // Default Options:
    opts = _.extend({

      /* How long to highlight the selected word before fading in the rest of the motto */
      meditateWordMs: 3000

    }, opts);

    // So we can see the motto again on hover
    motto.wordNodes.forEach(function(wn) {
      wn.lastMottoShown = motto;

      if (!wn.shownMottos)
        wn.shownMottos = {};

      if (!(motto.id in wn.shownMottos))
        wn.shownMottos[motto.id] = true;
    });

    // Add all the nodes for this motto and get a handle their puppet strings
    var fvControlBoard = this._lastControlBoard = this.options.forceView.addMotto(motto, wordNode);


    var mottoChunks = motto.motto
    .match(/[A-z']+/g)
    .map(function(w) {
      return {
        raw: w,
        wordNodeKey: w.toLowerCase(),
        isSelected: w.toLowerCase() === wordNode.id
      };
    });

    // console.log("\n\n-----------------");
    // wordNode.mottos.forEach(function(m, i) {
      // console.log((m === motto ? "> " : "") + m.motto + "   (" + m.university + ")");
    // });
    // console.log("   - \"" + wordNode.id + "\" (" + wordNode.count + ")");

    // Draw the selector dots
    d3.select("#num_mottos").selectAll("i").remove();
    d3.select("#num_mottos").selectAll("i")
    .data(wordNode.mottos).enter().append("i")
    .each(function(aMotto) {
      // d3's classed sucks, revert to jquery
      $(this)
      .addClass('fa')
      .addClass('fa-' + ((aMotto.id in wordNode.displayedMottosIdx) ? 'circle' : 'circle-o'));

      if (aMotto === motto)
        $(this).addClass('focus');
    });

    d3.select("#motto_render").selectAll("span").remove();
    var mottoSpans = d3.select("#motto_render").selectAll("span")
      .data(mottoChunks)
    .enter().append("span")
      .attr("class", function(d) { return d.isSelected ? "selected" : ""; })
      .style("opacity", function(d) { return d.isSelected ? 1 : 0; })
      .style("color", function(d) { return d.isSelected ? "red" : ""; })
      .text(function(d) {return d.raw + " "; });

    // do nothing, just reflect on the word for a few seconds
    fvControlBoard.focusMeditateOn();
    mottoSpans.transition().duration(opts.meditateWordMs)

    // Then bring in the rest of the phrase
    .each("end", function() {
      d3.select(this).transition()
      .duration(1000)
      .style("opacity", 1)
      .style("color", function(d) { return d.isSelected ? "orchid" : "red"; });
    });

    // Bring in the school after the same delay
    d3.select("#motto_school")
    .interrupt()
      .text(" - " + motto.university)
      .style("opacity", 0)
      .style('color', 'red')
    .transition().duration(opts.meditateWordMs)
    .each("end", function() {
      d3.select(this).transition()
      .duration(1000)
      .style("opacity", 1);
    });

    // And highlight the links when the rest of the phrase comes in
    this._makeInterruptableTimer('_queuedFocusOtherNodes', function() {
      fvControlBoard.focusAllMottoNodes().releaseNewNodes();
    }, opts.meditateWordMs);

    if (!opts.skipUnfocus) {
      this._makeInterruptableTimer('_queuedSemiFocus', function() {
        if (!opts.dontReleaseMeditate) {
          fvControlBoard.releaseMeditateOn();
        }
        fvControlBoard.unfocusAll(1000);
        mottoSpans.transition().duration(1000).style('color', 'DarkSlateBlue');
        d3.select("#motto_school").transition().duration(1000).style('color', 'DarkSlateBlue');

        delete this._debounceHoverNode;
      }, opts.meditateWordMs * 2);
    }


    // Adjust the height to match the position of the target el
    this.$el.animate({
      marginTop: $(fvControlBoard.meditateOnEl).offset().top - this._initialOffset.top
    }, 200);
    //this._alignWithEl = fvControlBoard.meditateOnEl;

  },

  _makeInterruptableTimer: function(attrName, action, timeMs) {
    if (this[attrName] !== undefined) {
      clearTimeout(this[attrName].id);
      delete this[attrName];
    }

    var actionProxy = function() {
      action.call(this);
      delete this[attrName];
    }.bind(this);
    this[attrName] = {
      id: setTimeout(actionProxy, timeMs),
      triggerNow: actionProxy
    };
  },

  _forceLayoutTick: function() {
    if (this._alignWithEl) {
      this.$el.css({
        marginTop: $(this._alignWithEl).offset().top - this._initialOffset.top
      });
    }
  }
});

});