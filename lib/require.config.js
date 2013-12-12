var jam = {
    "packages": [
        {
            "name": "backbone",
            "location": "lib/backbone",
            "main": "backbone.js"
        },
        {
            "name": "jasmine",
            "location": "lib/jasmine"
        },
        {
            "name": "jquery",
            "location": "lib/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "underscore",
            "location": "lib/underscore",
            "main": "underscore.js"
        }
    ],
    "version": "0.2.11",
    "shim": {
        "backbone": {
            "deps": [
                "underscore",
                "jquery"
            ],
            "exports": "Backbone"
        },
        "underscore": {
            "exports": "_"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({packages: jam.packages, shim: jam.shim});
}
else {
    var require = {packages: jam.packages, shim: jam.shim};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}