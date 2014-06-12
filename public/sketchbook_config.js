/**
 * Common Sketchbook Configurations.
 *
 * This require file allows for the extension of the JamJS-generated configuration file with common definitions to be
 * shared amongst all experiments.
 *
 * See /_sketch_boilerplate/main.js for an example of how to use this.
 */
require.config({

  baseUrl: "/", // needed b/c experiment index.html's reference their local main.js as the main-data (and main-data is used as default baseUrl)

  paths: {
    // paths can be used to shorten/alias certain modules:
//    "boilerplate": "/_sketch_boilerplate_",

    // or assign the sketch's name to a stable version of an experiment.
    // for example: "madExperiment": "/madExperiment/v2"

    //-------
    // jamjs sucks and is outdated.  Start adding manual js libraries.
    "lodash": "http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash",
    "jquery": "http://code.jquery.com/jquery-2.0.3.min",
    "backbone": "//cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.10/backbone-min",
    "d3": "http://d3js.org/d3.v3.min",
//    "d3": "/lib-user/d3.v3.3.2.min",
//    "bootstrap": "/lib-user/bootstrap_232/js/bootstrap.min",
//    "tpl": "/lib-user/tpl",
//    "lodash": "/lib-user/lodash.2.4.1.min",
//    "highcharts": "/lib-user/highcharts-all",
    "jquery-slider": "/lib-user/jquery-ui-1.10.4.slider"
  },

  shim: {
  backbone: {
      deps: ['lodash', 'jquery'],
      exports: 'Backbone'
  },
  bootstrap: {
  deps: ['jquery']
    },
    d3: {
      exports: "d3"
    },
    highcharts: {
      deps: ['jquery'],
      exports: "Highcharts"
    },
    "jquery-slider": {
      deps: ['jquery'],
      exports: "$"
    }
  }

});
