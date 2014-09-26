'use strict';

var client = require('../../build/client.js');
var files = client.testsuite.concat(['test/client/*.spec.js']);

module.exports = function(config) {
    config.set({
        preprocessors: {
            'client/**/*.js': ['coverage']
        },
        coverageReporter: {
            type: 'html',
            dir: '../xssnake-coverage/'
        },
        basePath  : '../../',
        frameworks: ['jasmine'],
        browsers  : ['PhantomJS'],
        reporters : ['spec', 'coverage'],
        files     : files,
        singleRun : true,
        autoWatch : false,
        plugins   : [
            'karma-coverage',
            'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-spec-reporter'
        ]
    });
};
