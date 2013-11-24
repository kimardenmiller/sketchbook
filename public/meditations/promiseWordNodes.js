define(
  ["jquery",
   "lodash",
   "meditations/promiseMottos"
  ],
  function($, _, promiseMottos) {

    /**
     * A lot of words are connector words -- don't really tell us about the subject or the action.
     * Lets filter those out (this list is kinda subjective... my high school grammar teacher would require a bit more
     * of a methodical approach here...)
     */
    var DO_IGNORE = true,
        IGNORE_LIST = [
          'a'       ,
          'an'      ,
          'and'     ,
          'any'     ,
          'are'     ,
          'as'      ,
          'be'      ,
          'but'     ,
          'by'      ,
          'does'    ,
          'for'     ,
          'from'    ,
          'had'     ,
          'has'     ,
          'his'     ,
          'how'     ,
          'in'      ,
          'into'    ,
          'is'      ,
          "it's"    ,
          'its'     ,
          'let'     ,
          'not'     ,
          'of'      ,
          'or'      ,
          'our'     ,
          'shall'   ,
          'so'      ,
          'than'    ,
          'that'    ,
          'the'     ,
          'then'    ,
          'this'    ,
          'those'   ,
          'through' ,
          'to'      ,
          'unto'    ,
          'was'     ,
          'where'   ,
          'who'     ,
          'with'    ,
          'without' ,
          'would'   ,
          'ye'      ];
    var IGNORE_INDEX = {};
    IGNORE_LIST.forEach(function(w) {
      IGNORE_INDEX[w] = true;
    });

    var promiseWordNodes = $.Deferred();

    promiseMottos
    .done(function(mottos) {

      var wordNodesIndex = {},
          wordNodesLinks = [];

      var words;
      mottos.forEach(function(m) {
        words = m.motto.match(/[A-z']+/g).map(function(w) { return w.toLowerCase(); });

        var mottosWordNodes = [];

        // Create word nodes for each word in the motto (as long as it's not in the ignore list)
        words.forEach(function(w) {
          // Skip if we're ignoring this word
          if (DO_IGNORE && IGNORE_INDEX[w])
            return;

          if (!wordNodesIndex[w]) {
            wordNodesIndex[w] = {
              id: w,
              count: 0, // number of occurances of the word in all mottos
              mottos: [],
              links: {
                /* example key/value schema:
                 * theRelatedWord: {
                 *   source: <the wordNode>
                 *   target: <the other word node>
                 *   numSharedMottos: 0,
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
            if (!wn.links[otherWn.id]) {
              // check if the link exists from the other direction
              if (otherWn.links[wn.id]) {
                wn.links[otherWn.id] = otherWn.links[wn.id];

              // otherwise create a new one
              } else {
                wn.links[otherWn.id] = {
                  source: wn,
                  target: otherWn,
                  numSharedMottos: 0,
                  sharedMottos: [],
                };
                wordNodesLinks.push(wn.links[otherWn.id]);
              }
            }

            wn.links[otherWn.id].numSharedMottos++;
            wn.links[otherWn.id].sharedMottos.push(m);
          });
        });
      });

      var wordNodes = {
        indexByWord: wordNodesIndex,
        list: [],
        links: wordNodesLinks
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