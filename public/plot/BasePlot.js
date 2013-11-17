/**
 * Backbone View that creates a basic d3-based SVG plot: a plot area with x and y axes
 *
 * Constructor options:
 * - [w]: {number} Width of SVG area
 * - [h]: {number} Height of SVG area
 * - xScale: {d3.scale} A d3 scale with range set, to be used as x axis.  Gets domain set appropriate for plot g
 * - yScale: {d3.scale} A d3 scale with range set, to be used as y axis.  Gets domain set appropriate for plot g.
 *
 * Attributes:
 * - svg: {d3.selection} D3 Selection of the SVG element appended into this Backbone view
 * - yAxisG: {d3.selection}
 * - xAxisG: {d3.selection}
 * - plotG: {d3.selection}
 * - xAxis: {d3.axis}
 * - yAxis: {d3.axis}
 */
define([
"jquery", "backbone", "d3",

], function(
$, Backbone, d3
) {

  var FULL_HEIGHT = 400,
      FULL_WIDTH = 1200,

      // Spacing for x and y axis values
      PADDING_LEFT = 60,
      PADDING_RIGHT = 2,
      PADDING_TOP = 10,
      PADDING_BOTTOM = 30;

  return Backbone.View.extend({
    /**
     * You're going to BasePlot.extend({...}) with your model.  So in your initializer, to init the BasePlot, you need
     * to do something like: BasePlot.prototype.call(this, opts);
     * @param {Object} opts Backbone View options argument
     */
    initialize: function(opts) {
      if (!opts.xScale) throw new Error("missing xScale");
      if (!opts.yScale) throw new Error("missing yScale");

      opts.h = opts.h || FULL_HEIGHT;
      opts.w = opts.w || FULL_WIDTH;

      this.svg = d3.select(this.el).append("svg")
        .attr("width", opts.w)
        .attr("height", opts.h);

      this.y = opts.yScale.range([opts.h - PADDING_BOTTOM, PADDING_TOP]);
      this.x = opts.xScale.range([PADDING_LEFT, opts.w - PADDING_RIGHT]);

      this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient('left');
      this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom');

      this.plotWrap = this.svg.append("g")
        .attr("class", "plot-view");

      this.yAxisG = this.plotWrap.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", "translate(" + PADDING_LEFT + ", 0)")
        .call(this.yAxis);

      this.xAxisG = this.plotWrap.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0, " + this.y(0) +  ")")
        .call(this.xAxis);

      this.plotG = this.plotWrap.append("g")
        .attr("class", "plot-area");
    }


  });
});