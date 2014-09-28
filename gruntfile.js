'use strict';

var client = require('./build/client.js');
var server = require('./build/server.js');
var levels = require('./build/levels.js');
var audio = require('./build/audio.js');

module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            client   : client.concat,
            server   : server.concat,
            levels   : levels.concat,
            audio_mp3: audio.concat.mp3,
            audio_ogg: audio.concat.ogg
        },

        gcc_rest: {
            client: client.gcc_rest,
            server: server.gcc_rest
        },

        jasmine_node  : {
             // Must be namespaced.
            server: server.jasmine_node
        },

        karma         : client.karma,
        cssUrlEmbed   : client.cssUrlEmbed,
        cssmin        : client.cssmin,
        'sails-linker': client.scriptlinker,
        index         : client.index,
        instrument    : server.instrument,
        storeCoverage : server.storeCoverage,
        makeReport    : server.makeReport
    });

    grunt.loadTasks('build');

    // Dependencies
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-gcc-rest');
    grunt.loadNpmTasks('grunt-sails-linker');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-css-url-embed');
    grunt.loadNpmTasks('grunt-istanbul');

    // Tasks
    grunt.registerTask('test', [
        'karma',
        'server_test'
    ]);

    grunt.registerTask('server_test', [
        'concat:server',
        'instrument',
        'jasmine_node',
        'storeCoverage',
        'makeReport'
    ]);

    grunt.registerTask('source', [
        'sails-linker',
        'concat:levels',
        'concat:audio_mp3',
        'concat:audio_ogg'
    ]);

    grunt.registerTask('client', [
        'source',
        'concat:client',
        'gcc_rest:client',
        'cssUrlEmbed',
        'cssmin',
        'index'
    ]);

    grunt.registerTask('server', [
        'concat:server',
        'gcc_rest:server'
    ]);

    grunt.registerTask('default', [
        'source',
        'client',
        'server'
    ]);
};
