/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var util = require('util');
/** @type {GccRest} */
var gcc  = require('gcc-rest');
var home = __dirname + '/../';

var header = util.format(
    '// © %d Blaise Kal\n' +
    '// Compiled using Google Closure Compiler on %s\n' +
    '// Source available at https://github.com/blaisekal/xssnake\n',
    new Date().getFullYear(), new Date().toUTCString()
);

var js_externs = ['',
     'var io={',
        '"connect":function(){},',
        '"emit":function(){},',
        '"on":function(){}',
    '};'].join('');

gcc.params({
    js_externs                : js_externs,
    output_info               : ['compiled_code', 'errors', 'warnings', 'statistics'],
    use_types_for_optimization: 'true',
    language                  : 'ECMASCRIPT5_STRICT',
    compilation_level         : 'ADVANCED_OPTIMIZATIONS',
    warning_level             : 'VERBOSE'
});

gcc.header(header);

gcc.addFile(home + 'source/js/main.js');
gcc.addDir(home + 'server/shared', ['config.example.js']);
gcc.addDir(home + 'source/js', ['main.js']);

gcc.replace(/'use strict';/g, '');
gcc.output(home + 'www/xssnake.js');