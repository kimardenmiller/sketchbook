/**
 * @module {fireflies/views/SliderView}
 * @author Dan Lopuch <dlopuch@alum.mit.edu>
 *
 * Backbone View to control the timeline slider.  As you move the slider up and down, more or fewer AuthorNodes are
 * emitted.
 *
 * Constructor:
 *
 * Attributes:
 *
 */
define(["jquery", "d3", "lodash", "backbone",
        'jquery-slider'],
function($, d3, _, Backbone) {
var DEFAULT_W = 600,
    DEFAULT_H = 500,
    FORCE_VIEW_I = 0;

return Backbone.View.extend({
  el: "#timeline",

  initialize: function(opts) {
    if (!opts.authorNodeEmitter)
      throw new Error("AuthorNodeEmitter needed!");

    this.render();

    this.$("#timeline_slider").on('slide', _.debounce(this.onNewSliderValue.bind(this), 100));
  },

  onNewSliderValue: function(e, ui) {
    console.log("New slider value:", ui.value, new Date(ui.value));
    this.options.authorNodeEmitter.emitAuthorsUpToTs(ui.value);
  },

  render: function() {
    this.$("#timeline_slider").slider({
      animate: 'slow',
      max: this.options.authorNodeEmitter.getMaxAuthorTs(),
      min: this.options.authorNodeEmitter.getMinAuthorTs(),
      step: 2 * 60 * 1000
    });
    return this;
  }
});
});