/**
 * Test Configurations.
 *
 * When running tests, you start the python -m SimpleHTTPServer from project root, not public.
 * To make the require.js paths work out, we're going to have to mangle paths a bit.
 */
require.config({baseUrl: "../public/"});
require(["../public/sketchbook_config.js"], function() {
  require.config({

    baseUrl: "../public/", // Override that config to make everything relative to public folder


  });
});
