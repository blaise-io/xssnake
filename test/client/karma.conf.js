"use strict";

const grunt = require("grunt");
const client = require("../../build/client.js");
let files = client.concat.src.slice();

// Append tests.
files.push("test/client/**/*.spec.js");

// Karma does not support advanced globbing.
// Expand files manually.
files = grunt.file.expand({ cwd: __dirname + "/../.." }, files);

module.exports = function (config) {
    config.set({
        preprocessors: {
            "client/**/*.js": ["coverage"],
        },
        coverageReporter: {
            type: "html",
            dir: "test/coverage/client/",
            subdir: ".",
        },
        basePath: "../../",
        frameworks: ["jasmine"],
        browsers: ["PhantomJS"],
        reporters: ["spec", "coverage"],
        files: files,
        singleRun: true,
        autoWatch: false,
        plugins: [
            "karma-coverage",
            "karma-jasmine",
            "karma-phantomjs-launcher",
            "karma-spec-reporter",
        ],
    });
};
