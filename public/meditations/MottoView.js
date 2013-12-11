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
    this.listenTo(this.options.forceView, "hoverNode", this._pickAndShowMotto);
    this.listenTo(this.options.forceView, "clickNode", this._pickNextMotto);

    this.listenTo(this.options.forceView, "tick", this._forceLayoutTick.bind(this));

    this._initialOffset = this.$el.offset();
  },

  _pickNextMotto: function(view, wordNode) {
    var lastNextMs = new Date() - this._lastNext;
    this._lastNext = new Date();

    this._curMottoI = (this._curMottoI + 1) % wordNode.mottos.length;
    this._showMotto(wordNode, {
      meditateWordMs: Math.min(lastNextMs, 800)
    });
  },

  _pickAndShowMotto: function(view, wordNode) {
    if (this._curWordNode === wordNode)
      return this._pickNextMotto(view, wordNode);

    this._curWordNode = wordNode;
    this._curMottoI = Math.floor(Math.random() * wordNode.mottos.length);
    this._showMotto(wordNode);
  },

  _showMotto: function(wordNode, opts) {
    opts = opts || {};

    // Default Options:
    opts = _.extend({

      /* How long to highlight the selected word before fading in the rest of the motto */
      meditateWordMs: 3000

    }, opts);

    var motto = this._curMotto = wordNode.mottos[this._curMottoI],

        // Add all the nodes for this motto and get a handle their puppet strings
        fvControlBoard = this.options.forceView.addMotto(motto, wordNode);


    var mottoChunks = motto.motto
    .match(/[A-z']+/g)
    .map(function(w) {
      return {
        raw: w,
        wordNodeKey: w.toLowerCase(),
        isSelected: w.toLowerCase() === wordNode.id
      };
    });

    console.log("\n\n-----------------");
    wordNode.mottos.forEach(function(m, i) {
      console.log((m === motto ? "> " : "") + m.motto + "   (" + m.university + ")");
    });
    console.log("   - \"" + wordNode.id + "\" (" + wordNode.count + ")");

    // Draw the selector dots
    $("#num_mottos").html( wordNode.mottos.reduce(
      function(html, m) {
        return html + "<i class='fa fa-" + (m === motto ? "circle" : "circle-o") + "'></i> ";
      }, ''
    ));

    d3.select("#motto_render").selectAll("span").remove();
    var mottoSpans = d3.select("#motto_render").selectAll("span")
      .data(mottoChunks)
    .enter().append("span")
      .attr("class", function(d) { return d.isSelected ? "selected" : ""; })
      .style("opacity", function(d) { return d.isSelected ? 1 : 0; })
      .style("color", function(d) { return d.isSelected ? "red" : ""; })
      .text(function(d) {return d.raw + " "; });

    // do nothing, just reflect on the word for 5 seconds
    fvControlBoard.focusMeditateOn();
    mottoSpans.transition().duration(opts.meditateWordMs)

    // Then bring in the rest of the phrase
    .each("end", function() {
      d3.select(this).transition()
      .duration(1000)
      .style("opacity", 1)
      .style("color", "red");
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
    if (this._queuedHighlightLinks !== undefined) {
      clearTimeout(this._queuedHighlightLinks);
      delete this._queuedHighlightLinks;
    }
    this._queuedHighlightLinks = setTimeout(function() {
      fvControlBoard.focusAllMottoNodes().releaseNewNodes();
      delete this._queuedHighlightLinks;
    }.bind(this), opts.meditateWordMs);

    setTimeout(function() {
      fvControlBoard.releaseMeditateOn();
      fvControlBoard.semiFocusAll(1000);
      mottoSpans.transition().duration(1000).style('color', 'DarkSlateBlue');
      d3.select("#motto_school").transition().duration(1000).style('color', 'DarkSlateBlue');
    }, opts.meditateWordMs * 2);


    // Adjust the height to match the position of the target el
    this.$el.animate({
      marginTop: $(fvControlBoard.meditateOnEl).offset().top - this._initialOffset.top
    }, 200);
    //this._alignWithEl = fvControlBoard.meditateOnEl;

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