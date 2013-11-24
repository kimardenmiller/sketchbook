/**
 * d3_force example.
 *
 * This main.js loads the NodeForceView bound to some example data and renders it on the page.
 *
 * In your js console, execute go() to start the mock clock that makes the conversation grow.
 */
require(["/sketchbook_config.js"], function() {
require(
  ["jquery",
   "lodash",
   "meditations/promiseWordNodes"
   ],
  function($, _, promiseWordNodes) {

    promiseWordNodes
    .done(function(wordNodes) {
      window.wordNodes = wordNodes;
      console.log("Got word nodes!", wordNodes);
      wordNodes.list.forEach(function(wn) {
        console.log(wn.count, wn.id);
      });


      window.svg = d3.select("#force_view").append("svg:svg")
      .attr("width",  800)
      .attr("height", 600);

      window.links = wordNodes.links;

      var MIN_COUNT = 1;
      wordNodes.list = wordNodes.list.filter(function(wn) { return wn.count >= MIN_COUNT; });
      links = links.filter(function(l) { return l.source.count >= MIN_COUNT && l.target.count >= MIN_COUNT; });

      var nodeSizeScale = d3.scale.log().domain([1, 65]).range([2,10]),
          chargeScale = d3.scale.linear().domain([1,65]).range([-10, -500]);

      wordNodes.list[0].fixed = true;
      wordNodes.list[0].x = 400;
      wordNodes.list[0].y = 300;

      window.force = d3.layout.force()
      .size([800, 600])
      .nodes(wordNodes.list)
      .charge(function(n) { return chargeScale(n.count);})
      .links(links)
      .linkStrength(function(l) {
        return l.numSharedMottos / 10;
      })
      .start();

      var link = svg.selectAll(".link")
        .data(links)
      .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });


      window.node = svg.selectAll("circle.node")
          .data(wordNodes.list, function(d) {return d.id;})
        .enter().append("circle")
          .attr("class", "node")
          .attr("r", function(d) { return nodeSizeScale(d.count); })
          .style("fill", "steelblue")
          .call(force.drag);

      force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      });

      node.on("mouseover", function(d) {
        console.log(d.count, d.id);
        d.mottos.forEach(function(m) {
          console.log("\t" + m.motto);
        });
      });


    })
    .fail(function() {
      console.log("Failed mottos");
    });

});
});