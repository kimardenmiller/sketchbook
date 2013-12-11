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
    'click li': 'clickWordNode'
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
    if (!text)
      return this.render();

    this.render(this.words.filter(function(w) { return w.id.indexOf(text) > -1; }));
  },

  render: function(words) {
    if (!words)
      words = this.words;

    var lis = d3.select(this.$('ul')[0]).selectAll('li')
      .data(words, function(d) {return d.id;});

    lis.enter().append('li').append('span')
    .text(function(d) {return d.id;});

    lis.style('display', 'list-item');

    lis.exit()
    .style('display', 'none');
  }

});

});