define(
  ["jquery",
   "lodash",
   "meditations/promiseMottos"
  ],
  function($, _, promiseMottos) {

    var promiseWordNodes = $.Deferred();

    promiseMottos
    .done(function(mottos) {

      var wordNodesIndex = {};

      var words;
      mottos.forEach(function(m) {
        words = m.motto.match(/[A-z']+/g).map(function(w) { return w.toLowerCase(); });

        var mottosWordNodes = [];

        // Create word nodes for each word in the motto
        words.forEach(function(w) {
          if (!wordNodesIndex[w]) {
            wordNodesIndex[w] = {
              id: w,
              count: 0, // number of occurances of the word in all mottos
              mottos: [],
              relatedWordNodes: {
                /* example key/value schema:
                 * theRelatedWord: {
                 *   numSharedMottos: 0,
                 *   wordNode: {the word node}
                 * }
                 */
              }
            };
          }
          mottosWordNodes.push(wordNodesIndex[w]);
        });

        // Link each wordNode to its related word nodes (other words used in the same motto),
        // incrementing the counters appropriately
        mottosWordNodes.forEach(function(wn, i) {
          wn.count++;
          wn.mottos.push(m);

          mottosWordNodes.forEach(function(otherWn, j) {
            // Ignore same word instances
            if (i === j) {
              return;
              /* Note that we didn't write that guard clause as "wn === otherWn".
               * We don't want the same word *instance* to self-refer to itself, but self referrals in a motto are okay
               * eg "To be, rather than to seem"  -->  "to" self-refers to itself b/c it's used twice in the same motto
               */
            }

            // create the link meta if it doesn't exist
            if (!(otherWn.id in wn.relatedWordNodes)) {
              wn.relatedWordNodes[otherWn.id] = {
                wordNode: otherWn,
                numSharedMottos: 0,
                sharedMottos: [],
              };
            }

            wn.relatedWordNodes[otherWn.id].numSharedMottos++;
            wn.relatedWordNodes[otherWn.id].sharedMottos.push(m);
          });
        });
      });

      var wordNodes = {
        indexByWord: wordNodesIndex,
        list: []
      };

      // unpack index to list
      for (var w in wordNodesIndex) {
        wordNodes.list.push(wordNodesIndex[w]);
      };

      // order list by most common words first
      wordNodes.list.sort(function(a, b) {
        if (a.count !== b.count)
          return b.count - a.count;
        else if (a.id === b.id)
          return 0;
        else
          return 1 * ((a.id > b.id) ? 1 : -1);
      });

      promiseWordNodes.resolve(wordNodes);
    })
    .fail(function(error) {
      var e = new Error("error getting promised mottos");
      e.prevError = error;
      promiseWordNodes.reject(e);
    });

    return promiseWordNodes.promise();

});