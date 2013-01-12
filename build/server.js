/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var util = require('util');
var fs = require('fs');
var ServerCompile = require('./lib/server_compile.js');
/** @type {GccRest} */
var gcc = require('gcc-rest');
var compile = new ServerCompile();

gcc.params({
    js_externs                : String(fs.readFileSync(__dirname + '/lib/externs.js')),
    output_info               : ['compiled_code', 'errors', 'warnings', 'statistics'],
    use_types_for_optimization: 'true',
    language                  : 'ECMASCRIPT5_STRICT',
    compilation_level         : 'ADVANCED_OPTIMIZATIONS',
    warning_level             : 'VERBOSE'
});

gcc.header(util.format(
    '// © %d Blaise Kal\n' +
    '// Compiled using Google Closure Compiler on %s\n\n' +
    'var %s;\n\n',
    new Date().getFullYear(),
    new Date().toUTCString(),
    compile.coreModules.join(',\n    ')
));

gcc.addCode(compile.code);
gcc.output(__dirname + '/../server/compiled_start.js');