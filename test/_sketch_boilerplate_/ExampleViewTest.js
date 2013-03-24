define(["jquery", "backbone", "_sketch_boilerplate_/ExampleView"], function($, Backbone, ExampleView) {
  describe("ExampleView", function() {
    it("should load", function() {
      expect(ExampleView).toBeDefined();
    });
    var reducer;
    it("should instantiate", function() {
      reducer = new ExampleView();
      expect(true).toBeTruthy();
    });
  });
});