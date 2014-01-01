var helper = require('./helper.js');

var src = [
    'shared/namespace.js',
    'shared/**/*.js',
    'client/data/**/*.js',
    'client/js/**/*.js'
];

var srcCompile = src.slice().concat(['!client/js/debug/*.js']);
var srcDebug = ['client/vendor/sockjs-0.3.js'].concat(src);

exports.concat = {
    options: {
        banner: '\'use strict\';\n',
        process: helper.replaceStrict
    },
    src: srcCompile,
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

exports.cssmin = {
    src: 'client/xssnake.css',
    dest: 'dist/client.min.css'
};

exports.index = {
    options: {
        inline: {
            css: 'dist/client.min.css',
            js: 'dist/client.min.js'
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
