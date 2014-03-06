/**
 * RedditParser: Given a reddit submission URL, parses all comments into a JSON tree structure:
 *   parent: {node} Link to parent node object. null only for the root node.
 *   children: {Array(node)} List of child nodes.  If a leaf node, length will be 0.
 *
 * With this tree, we have object-equalities like: someNode.children[4].parent === someNode.
 *
 * We include all reddit node attributes in these nodes.  The interesting ones are:
 *   author: {string} Username
 *   body: {string} Contents of post
 *   created_utc: {number} ms-since-epoch of when comment was posted (js friendly Date constructor param)
 *   up: {number} upvotes
 *   downs: {number} downvotes
 *   score: {number} upvotes minus downvotes
 *
 * See normalizeNodes() for any transformations / derived data we might have created.
 *
 * TO USE:
 *   When called, returns a jqDeferred promise that gets resolved when the conversation is completely loaded.
 *
 *   For example:
 *     RedditParser('www.reddit.com/r/dataisbeautiful/comments/1ty2i3')
 *     .done(function(rootNode) {
 *       console.log('root node:', rootNode);
 *     })
 *
 * TODO:
 *   Does not yet load any 'more comments' expansions.
 */
define(["jquery"], function($) {
  var printMessage = function(msg) {
    console.log('[RedditParser] ' + msg);
  };

  // Do any appropriate transforms
  var normalizeNode = function(node, parent) {
    node.parent = parent;
    node.children = [];

    // calculate net votes
    node.score = node.ups - node.downs;

    // reddit reports in sec-since-epoch.  Make js-friendly ms-since-epoch
    node.created *= 1000;
    node.created_utc *= 1000;
  };

  return function(redditUrl) {
    var deferred = $.Deferred();

    if (!redditUrl || redditUrl.indexOf("comments") === -1) {
      deferred.reject("Expected a URL to reddit comments, eg www.reddit.com/r/dataisbeautiful/comments/1ty2i3");
      return;
    }

    // Cut off trailing slash if it exists
    if (redditUrl.lastIndexOf("/") === redditUrl.length - 1)
      redditUrl = redditUrl.substring(0, redditUrl.length - 1);

    printMessage("Retrieving comment tree...");
    $.getJSON('http://' + redditUrl + ".json?jsonp=?")
    .error(function(err) {
      deferred.reject(new Error("Error retreiving reddit URL comments: " + err));
    })
    .then(function(data) {
      if (data.length != 2) {
        deferred.reject(new Error("Unexpected response length -- expected 2, got " + data));
        return;
      } else if (data[1].kind != "Listing") {
        deferred.reject(new Error("Bad comment container -- expected type 'Listing'"));
        return;
      }
      printMessage("Got it!");

      var root = data[0].data.children[0].data, // Should be a t3 (Link)

        /**
         * List of t3 (comment) Things to visit
         * Any comment in here should have already been added to it's parent's children list..
         */
        toVisit = [],

        /**
         * List of Things that need more API calls to yield comments (eg type: "more").
         * Thing.parent shall always be set on these to the parent node, and the comments that are yielded will be put
         * into that parent's .children list.
         */
        jobQueue = [];

      normalizeNode(root, null); // no parent for root node

      printMessage("Expecting " + root.num_comments + " comments.  Starting parsing.");

      // Bootstrap recursion by adding top-level children to root node
      data[1].data.children.forEach(function(child, i) {
        if (child.kind === "t1") {
          root.children.push(child.data);
          normalizeNode(child.data, root);
          toVisit.push(child);
        } else {
          // If it's not a t1 / comment, it's something that needs to be asynchronously retrieved (probably a "more")
          // Add it to the jobQueue, but inject the parent reference so the ultimate node tree can be built properly.
          child.parent = root;
          jobQueue.push(child);
        }
      });

      // Unpack the queue
      var node, i=0;
      while (toVisit.length > 0) {
        console.log("Visiting child: ", i++);
        node = toVisit.pop();

        if (node.kind === "t1") {
          // node.data is the actual comment node that we want extracted.
          // It should already be in it's parent's children list, so lets see if it has any children.
          // If so, add them to the toVisit list or add them to the job queue
          if (node.data.replies) {

            if (node.data.replies.kind !== "Listing") {
              // Should never hit -- this is an API schema I haven't encountered
              console.warn("Warning: Unexpected type for replies.  Expected 'Listing', but got:", node.data.replies.kind);
              continue;
            }

            node.data.replies.data.children.forEach(function(child) {
              if (child.kind === "t1") {
                node.data.children.push(child.data);
                normalizeNode(child.data, node.data);
                toVisit.push(child);
              } else {
                child.parent = node.data;
                jobQueue.push(child);
              }
            });

            // node.data is our extracted comment node, so hide its references to the confusing Reddit schema structure
            delete node.data.replies;
          }

        } else {
          // Should never hit.  Did we add a job (type:"more") to the toVisit list?
          console.warn("Warning: Visiting unexpected node kind: ", node.kind, "\tnode:", node);
        }
      }

      deferred.resolve(root, jobQueue);


    })
    .fail(function(err) {
      deferred.reject(new Error("Unexpected Error: " + err));
    });

    return deferred.promise();
  };
});
