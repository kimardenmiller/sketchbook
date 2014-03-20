/**
 * @module {fireflies/views/SliderView}
 * @author Dan Lopuch <dlopuch@alum.mit.edu>
 *
 * Backbone View to control the timeline slider.  As you move the slider up and down, more or fewer AuthorNodes are
 * emitted.
 *
 * Constructor:
 *
 * Events:
 *   "newSliderValue" ({number} value) Emitted when there's a new value from the slider
 *
 */
define(["jquery", "d3", "lodash", "backbone",
        'jquery-slider'],
function($, d3, _, Backbone) {
var DEFAULT_W = 600,
    DEFAULT_H = 500,
    FORCE_VIEW_I = 0;

var playCount = 0, pauseCount = 0, scrubCount = 0;

return Backbone.View.extend({
  el: "#timeline",

  events: {
    'click .play': 'play',
    'click .pause': 'pause'
  },

  initialize: function(opts) {

    this.max = opts.max;
    this.min = opts.min;

    this.render();

    var onNewSliderValue = _.debounce(this.onNewSliderValue.bind(this), 100);
    this.$("#timeline_slider").on('slide', onNewSliderValue); // mouse movements
    this.$("#timeline_slider").on('slidechange', onNewSliderValue); // mouseup, programatic value (ie play/pause)
  },

  play: function(e, forcePlay) {
    if (this.timer && !forcePlay) {
      return this.pause(e);
    }

    if (window.ga && !forcePlay) {
      window.ga('send', 'event', 'fireflies', 'play timeline', ++playCount);
    }

    $('a.pause').show();
    $('a.play').hide();

    var $sl = $("#timeline_slider"),
        self = this,
        curVal,
        dir = 1;

    this.timer = setInterval(function() {
      curVal = $sl.slider('value');
      if (curVal + 60000 > self.max)
        dir = -6;
      if (curVal - 60000 < self.min)
        dir = 1;
      $sl.slider('value', curVal + dir * 60000);
    }, 120); // must be larger than debounce!

    e && e.preventDefault();
  },

  pause: function(e, forcePause) {
    if (!this.timer && !forcePause) {
      return this.play(e);
    }

    if (window.ga && !forcePause) {
      window.ga('send', 'event', 'fireflies', 'pause timeline', ++pauseCount);
    }

    $('a.play').show();
    $('a.pause').hide();

    clearInterval(this.timer);
    delete this.timer;

    e && e.preventDefault();
  },

  onNewSliderValue: function(e, ui) {
    console.log("New slider value:", ui.value, new Date(ui.value));
    this.trigger('newSliderValue', ui.value);
  },

  render: function() {
    this.$("#timeline_slider").slider({
      animate: 'fast',
      max: this.max,
      min: this.min,
      step: 2 * 60 * 1000
    });

    this.$('#timeline_slider').on('mousedown', function() {
      if (window.ga) {
        window.ga('send', 'event', 'fireflies', 'user scrubbed timeline', ++scrubCount);
      }
    });

    return this;
  }
});
});