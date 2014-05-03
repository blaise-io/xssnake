'use strict';

var client = require('./build/client.js');
var server = require('./build/server.js');
var levels = require('./build/levels.js');
var audio = require('./build/audio.js');
var testsuite = require('./build/testsuite.js');

module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            testsuite: testsuite.concat,
            client: client.concat,
            server: server.concat,
            levels: levels.concat,
            audio_mp3: audio.concat.mp3,
            audio_ogg: audio.concat.ogg
        },
        cssmin: {
            client: client.cssmin
        },
        gcc_rest: {
            client: client.gcc_rest,
            server: server.gcc_rest
        },
        'sails-linker': {
            client: client.scriptlinker
        },
        uglify: {
            client: client.uglify
        },
        index: {
            client: client.index
        }
    });

    grunt.loadTasks('build');

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-gcc-rest');
    grunt.loadNpmTasks('grunt-sails-linker');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('testsuite', ['concat:testsuite']);
    grunt.registerTask('scripts', ['sails-linker:client']);
    grunt.registerTask('audio', ['concat:audio_mp3', 'concat:audio_ogg']);
    grunt.registerTask('levels', ['concat:levels']);
    grunt.registerTask('source', ['scripts', 'levels', 'audio']);
    grunt.registerTask('client', ['source', 'concat:client', 'gcc_rest:client', 'cssmin:client', 'uglify:client', 'index:client']);
    grunt.registerTask('server', ['concat:server', 'gcc_rest:server']);
    grunt.registerTask('default', ['source', 'client', 'server']);
};
