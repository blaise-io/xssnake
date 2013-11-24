var fs = require('fs');
var helper = require('./helper.js');

var src = [
    'shared/namespace.js',
    'shared/levels/*.js',
    'shared/*.js',
    'client/js/*.js',
    'client/js/abstract_stage/*.js',
    'client/js/stage_class_helper/*.js',
    'client/js/stages/*.js'
];

exports.concat = {
    options: {
        banner: "'use strict';\n",
        process: helper.replaceStrict
    },
    src: src,
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

exports.scriptlinker = {
    options: {
      startTag: '<!-- grunt client_scriptlinker -->\n',
      endTag: '<!-- /grunt client_scriptlinker -->',
      fileTmpl: '<script src="../%s"></script>\n'
    },
    files: {
      'client/client.html': ['client/vendor/sockjs-0.3.js'].concat(src)
    }
};
