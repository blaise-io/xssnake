'use strict';

var client = require('./build/client.js');
var server = require('./build/server.js');
var levels = require('./build/levels.js');
var testsuite = require('./build/testsuite.js');


module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            client: client.concat,
            server: server.concat,
            levels: levels.concat,
            testsuite: testsuite.concat
            // TODO: audio
        },
        gcc_rest: {
            client: client.gcc_rest,
            server: server.gcc_rest
        },
        scriptlinker: {
            client: client.scriptlinker
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-gcc-rest');
    grunt.loadNpmTasks('grunt-scriptlinker');

    grunt.registerTask('source', ['scriptlinker:client', 'concat:levels']);
    grunt.registerTask('client', ['concat:client', 'gcc_rest:client']);
    grunt.registerTask('server', ['concat:server', 'gcc_rest:server']);
    grunt.registerTask('testsuite', ['concat:testsuite']);
    grunt.registerTask('default', ['client', 'server']);
};
