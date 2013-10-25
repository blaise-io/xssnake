var fs = require('fs');
var helper = require('./helper.js');

exports.concat = {
    options: {
        banner: "'use strict';\n",
        process: helper.replaceStrict
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
};

exports.gcc_rest = {
    options: {
        params: {
            output_info: ['compiled_code', 'errors', 'warnings'],
            use_types_for_optimization: 'true',
            language: 'ECMASCRIPT5_STRICT',
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            warning_level: 'VERBOSE'
        }
    },
    src: 'dist/client.js',
    dest: 'dist/client.min.js'
};
