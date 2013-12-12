/**
 * @module {meditations.WordListView} Searchable view of available words
 *
 * Requires:
 *   el: #word_list_view template
 *   options.wordNodes {Array(WordNode)} List of word nodes to display and search
 *   options.forceView {meditations.BloomingForceView} ForceView instance so we can trigger motto highlights
 *
 * Events:
 *   selectedWordNode (this, {Object} wordNode)
 */
define(["jquery", "d3", "lodash", "backbone"],
function($, d3, _, Backbone) {


return Backbone.View.extend({

  events: {
    'keyup input.search': 'searchWords',
    'click div.word-text': 'clickWordNode'
  },

  initialize: function(opts) {
    if (!opts.wordNodes) throw new Error("requires word list");

    this.words = _.sortBy(opts.wordNodes, 'id');

    this.render();
  },

  clickWordNode: function(e) {
    this.trigger("selectedWordNode", this, d3.select(e.target).datum());
  },

  searchWords: function(e) {
    var text = $(e.target).val().trim();

    var words;
    if (text)
      words = this.words.filter(function(w) { return w.id.indexOf(text) > -1; });
    else
      words = this.words;

    d3.select(this.$('ul')[0]).selectAll('li')
      .data(words, function(d) { return d.id;} )
    .style('display', 'block')
    .exit()
      .style('display', 'none');
  },

  updateMottos: function(mottoView, motto, wordNode) {
    var lis = d3.select(this.$('ul')[0]).selectAll('li').data(this.words, function(d) {return d.id;});

    lis
    .style('color', function(wn) {
      if (wn.shownMottos && Object.keys(wn.shownMottos).length === wn.mottos.length) {
        return 'lightgrey';
      } else {
        return 'steelblue';
      }
    });

    lis.each(function(wn) {
      d3.select(this).select('div.shown-nodes').selectAll('i')
      .classed('fa-circle', function(m) { return wn.shownMottos && m.id in wn.shownMottos; })
      .classed('fa-circle-o', function(m) { return !(wn.shownMottos && m.id in wn.shownMottos); });
    });
  },

  render: function() {
    var lis = d3.select(this.$('ul')[0]).selectAll('li')
      .data(this.words, function(d) {return d.id;})
    .enter().append('li')
      .style('display', 'block');

    lis.append('div')
      .classed('word-text', true)
      .text(function(d) {return d.id;});

    lis.append('div')
    .classed('shown-nodes', true)
    .each(function(wn) {
      d3.select(this).selectAll('i')
      .data(wn.mottos).enter().append('i')
      .classed('fa fa-circle-o', true);
    });




    this.updateMottos();
  }

});

});