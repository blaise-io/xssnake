/* jshint node:true */
'use strict';

var client = require('./build/client.js');
var server = require('./build/server.js');
var levels = require('./build/levels.js');
var audio = require('./build/audio.js');

module.exports = function(grunt) {

    // Loads our tasks from the build dir
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

    // Config
    grunt.initConfig({
        concat:         {client: client.concat,
                         server: server.concat,
                         levels: levels.concat,
                         audio1: audio.concat.mp3,
                         audio2: audio.concat.ogg},
        gcc_rest     :  {client: client.gcc_rest,
                         server: server.gcc_rest},
        jasmine_node  : {server: server.jasmine_node},
        karma         : {client: client.karma},
        cssUrlEmbed   : {client: client.cssUrlEmbed},
        cssmin        : {client: client.cssmin},
        'sails-linker': {client: client.scriptlinker},
        index         : {client: client.index},

        // These don't allow namespacing:
        instrument    : server.instrument,
        storeCoverage : server.storeCoverage,
        makeReport    : server.makeReport
    });

    // Tasks
    grunt.registerTask('test', [
        'karma',
        'server_test'
    ]);

    grunt.registerTask('server_test', [
        'instrument',
        'jasmine_node',
        'storeCoverage',
        'makeReport'
    ]);

    grunt.registerTask('source', [
        'sails-linker',
        'concat:levels',
        'concat:audio1',
        'concat:audio2'
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
