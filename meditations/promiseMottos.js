define(["jquery", "d3"], function($, d3) {

  var promiseData = $.Deferred();

  d3.csv('./colleges_and_motos.csv',
    function(r) {
      // keys are 'university', 'motto', 'language'
      return r;
    },
    function(error, rows) {
      if (error) {
        console.log("[promiseMottos] Error parsing");
        promiseData.reject(error);
      } else {
        console.log("[promiseMottos] Done retreiving and parsing " + rows.length + " job stats rows.");
        promiseData.resolve(rows);
      }
    }
  );

  return promiseData.promise();

});