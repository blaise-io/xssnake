'use strict';

var fs = require('fs');

module.exports = function(grunt) {

    var replaceStrict = function(src, filepath) {
        return [
            '// ' + filepath, src.replace(/'use strict';\n/g, '')
        ].join('\n');
    };

    grunt.initConfig({
        concat: {
            client: {
                options: {
                    banner: "'use strict';\n",
                    process: replaceStrict
                },
                src: [
                    'shared/namespace.js',
                    'shared/*.js',
                    'client/js/*.js',
                    'client/js/abstract_stage/*.js',
                    'client/js/stage_class_helper/*.js',
                    'client/js/stages/*.js'
                ],
                dest: 'dist/client.js'
            },
            server: {
                options: {
                    banner: "'use strict';\n",
                    process: replaceStrict
                },
                src: [
                    'shared/namespace.js',
                    'shared/*.js',
                    'server/lib/*.js',
                    'server/start.js'
                ],
                dest: 'dist/server.js'
            },
            testsuite: {
                src: [
                    'shared/namespace.js',
                    'shared/*.js',
                    'server/lib/*.js',
                    'test/*.js'
                ],
                dest: 'dist/testsuite.js'
            }
        },
        gcc_rest: {
            client: {
                options: {
                    params: {
                        output_info: ['compiled_code', 'errors', 'warnings', 'statistics'],
                        use_types_for_optimization: 'true',
                        language: 'ECMASCRIPT5_STRICT',
                        compilation_level: 'ADVANCED_OPTIMIZATIONS',
                        warning_level: 'VERBOSE'
                    }
                },
                src: 'dist/client.js',
                dest: 'dist/client.min.js'
            },
            server: {
                options: {
                    params: {
                        js_externs: String(fs.readFileSync('build/lib/externs.js')),
                        output_info: ['compiled_code', 'errors', 'warnings', 'statistics'],
                        use_types_for_optimization: 'true',
                        language: 'ECMASCRIPT5_STRICT',
                        compilation_level: 'ADVANCED_OPTIMIZATIONS',
                        warning_level: 'VERBOSE'
                    }
                },
                src: 'dist/server.js',
                dest: 'dist/server.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-gcc-rest');

    grunt.registerTask('client', ['concat:client', 'gcc_rest:client']);
    grunt.registerTask('server', ['concat:server', 'gcc_rest:server']);
    grunt.registerTask('testsuite', ['concat:testsuite']);
    grunt.registerTask('default', ['client', 'server']);
};
