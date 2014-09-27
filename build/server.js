var fs = require('fs');
var helper = require('./helper.js');

exports.concat = {
    options: {
        banner: "'use strict';\n",
        process: helper.replaceStrict
    },
    src: [
        'shared/namespace.js',
        'shared/util.js',
        'shared/**/*.js',
        'server/**/*.js',
        'server/start.js'
    ],
    dest: 'dist/server.js'
};

exports.gcc_rest = {
    options: {
        params: {
            js_externs       : helper.getFilesInDirAsStr(__dirname + '/externs/'),
            output_info      : ['compiled_code', 'errors', 'warnings'],
            language         : 'ECMASCRIPT5_STRICT',
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            warning_level    : 'VERBOSE',
            use_types_for_optimization : 'true'
        }
    },
    src: 'dist/server.js',
    dest: 'dist/server.min.js'
};

exports.jasmine_node = {
    options: {
        verbose          : true,
        forceExit        : true,
        includeStackTrace: true,
        specFolders      : [__dirname + '/../test/server/']
    }
};
