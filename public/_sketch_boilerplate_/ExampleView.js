define(["jquery", "backbone"], function($, Backbone) {
  return Backbone.View.extend({
    tagName: "div",

    initialize: function() {
      $("body").append(this.$el);
    },

    render: function() {
      this.$el.html("Hello World!  I am ExampleView instance: " + this.cid);
    }
  })
})
