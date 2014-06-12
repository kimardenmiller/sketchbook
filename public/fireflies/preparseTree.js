define(['lodash', 'd3'], function(_, d3) {

  /**
   * This logic will apply misc. preparsing measures onto the comment node, useful for the visualizations
   */
  return function(rootNode) {

    var toVisit = [rootNode],
        leafsLastInStack = [rootNode];

    while (toVisit.length) {
      var node = toVisit.pop();
      node.children.forEach(function(child) {
        toVisit.push(child);
        leafsLastInStack.push(child);
      });
    }

    // Now pop out each node again (leafs come out first), setting the depth and last timestamp
    while (leafsLastInStack.length) {
      var node = leafsLastInStack.pop();

      if (!node.children.length) {
        node.last_branch_ts = node.created_utc;
        node.max_distance_from_leaf = 0;
      } else {
        node.last_branch_ts = d3.max(node.children, function(d) {return d.last_branch_ts; });
        node.max_distance_from_leaf = d3.max(node.children, function(d) {return d.max_distance_from_leaf + 1; });
      }
    }
  };
});