'use strict';

var helper = require('./helper.js');

var src = [
    'client/namespace.js',
    'shared/namespace.js',
    'shared/util.js', // We need this for extending objects, pre-bootstrap.
    'client/util/client_util.js', // idem.
    'shared/**/*.js',
    'client/data/**/*.js',
    'client/**/*.js',
    '!client/debug/*.js'
];

var srcDebug = [];
srcDebug = srcDebug.concat(src);
srcDebug = srcDebug.concat(['client/debug/*.js']);

exports.concat = {
    options: {
        banner: '\'use strict\';\n',
        process: helper.replaceStrict
    },
    src: src,
    dest: 'dist/client.js'
};

exports.karma = {
    configFile: 'test/client/karma.conf.js'
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

exports.cssUrlEmbed = {
    src : 'client/static/xssnake.css',
    dest: 'dist/client.css'
};

exports.cssmin = {
    src: 'dist/client.css',
    dest: 'dist/client.min.css'
};

exports.index = {
    options: {
        inline: {
            app_css: 'dist/client.min.css',
            app_js: 'dist/client.min.js'
        }
    },
    src: 'build/index.tpl',
    dest: 'www/index.html'
};

exports.scriptlinker = {
    options: {
      startTag: '<!-- scripts start -->',
      endTag: '<!-- scripts end -->',
      fileTmpl: '<script src="../%s"></script>'
    },
    src: srcDebug,
    dest: 'client/debug.html'
};
