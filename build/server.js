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
        'server/**/*.js'
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

exports.instrument = {
    files: [
        'build/**/*.js',
        'shared/**/*.js',
        'server/**/*.js'
    ],
    options: {
        basePath: 'dist/instrument'
    }
};

exports.jasmine_node = {
    options: {
        forceExit  : true,
        specFolders: ['test/server']
    }
};

exports.storeCoverage = {
    options: {
        dir: 'dist/instrument'
    }
};

exports.makeReport = {
    src: 'dist/instrument/coverage.json',
    options: {
        type   : 'html',
        dir    : 'test/coverage/server'
    }
};
