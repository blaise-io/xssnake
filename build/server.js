/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var util = require('util');
var fs = require('fs');
var ServerCompile = require('./lib/server_compile.js');
/** @type {GccRest} */
var gcc = require('gcc-rest');

// Start compiling out server code.
var compile = new ServerCompile();

// Set Google Closure Compiler parameters. Make sure to add externs for all
// core node.js modules that you use!
gcc.params({
    js_externs                : String(fs.readFileSync(__dirname + '/lib/externs.js')),
    output_info               : ['compiled_code', 'errors', 'warnings', 'statistics'],
    use_types_for_optimization: 'true',
    language                  : 'ECMASCRIPT5_STRICT',
    compilation_level         : 'ADVANCED_OPTIMIZATIONS',
    warning_level             : 'VERBOSE'
});

// Add a header to the compiled output.
gcc.header(util.format(
    '// © %d Blaise Kal\n' +
    '// Compiled using Google Closure Compiler on %s\n\n' +
    'var %s;\n\n',
    new Date().getFullYear(),
    new Date().toUTCString(),

    // Re-include all calls to core node.js modules.
    compile.coreModules.join(',\n    ')
));

// DEBUG: Uncomment the next line to write the inlined code to a file before
// it is compoiled by Google Closure Compiler.
fs.writeFileSync(__dirname + '/precompiled.js', compile.code);

gcc.addCode(compile.code);
gcc.output(__dirname + '/../server/compiled_start.js');