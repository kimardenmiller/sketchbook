/**
 * @module {meditations.MottoView} View of selected mottos from the force view
 *
 * Requires:
 *   options.forceView {meditations.ForceView} ForceView instance so we can trigger motto highlights
 *
 * Events:
 */
define(["jquery", "d3", "lodash", "backbone"],
function($, d3, _, Backbone) {


return Backbone.View.extend({
  initialize: function(options) {
    if (!options.forceView)
      throw new Error("ForceView instance required!");

    this.listenTo(this.options.forceView, "hoverNode", this._pickAndShowMotto);
  },

  _pickAndShowMotto: function(forceView, wordNode) {
    var motto = wordNode.mottos[Math.floor(Math.random() * wordNode.mottos.length)];

    forceView.selectMotto(motto);


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

    d3.select("#motto_render").selectAll("span").remove();
    $("#num_mottos").html( wordNode.mottos.reduce(
      function(html, m) {
        return html + "<i class='fa fa-" + (m === motto ? "circle" : "circle-o") + "'></i> ";
      }, ''
    ));

    var mottoSpans = d3.select("#motto_render").selectAll("span")
      .data(mottoChunks)
    .enter().append("span")
      .attr("class", function(d) { return d.isSelected ? "selected" : ""; })
      .style("opacity", function(d) { return d.isSelected ? 1 : 0; })
      .style("color", function(d) { return d.isSelected ? "red" : ""; })
      .text(function(d) {return d.raw + " "; });

    // do nothing, just reflect on the word for 5 seconds
    mottoSpans.transition().duration(3000)
    .each("end", function() {
      d3.select(this).transition()
      .duration(1000)
      .style("opacity", 1)
      .style("color", "black");
    });
    d3.select("#motto_school")
    .interrupt()
      .text(" - " + motto.university)
      .style("opacity", 0)
    .transition().duration(3000)
    .each("end", function() {
      d3.select(this).transition()
      .duration(1000)
      .style("opacity", 1);
    });

  }
});

});