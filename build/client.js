'use strict';

var fs = require('fs');
var util = require('util');
/** @type {GccRest} */
var gcc  = require('gcc-rest');
var home = __dirname + '/../';

var minCSS = function( content ) {
    content = content.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '');
    content = content.replace(/\s*([{}:;,])\s*/g, '$1');
    return content;
};

var js_externs = 'var SockJS={};';
var output_info = ['compiled_code', 'errors', 'warnings', 'statistics'];

// Do not display output info when testing
if (module.parent) {
    output_info.pop();
}

gcc.params({
    js_externs                : js_externs,
    output_info               : output_info,
    use_types_for_optimization: 'true',
    language                  : 'ECMASCRIPT5_STRICT',
    compilation_level         : 'ADVANCED_OPTIMIZATIONS',
    warning_level             : 'VERBOSE'
});

gcc.addFile(home + 'client/js/main.js');
gcc.addFile(home + 'server/shared/const.js');
gcc.addDir(home + 'server/shared', ['const.js']);
gcc.addDir(home + 'client/js', ['main.js']);
gcc.addDir(home + 'client/js/abstract_stage');
gcc.addDir(home + 'client/js/stage_class_helper');
gcc.addDir(home + 'client/js/stages');

gcc.replace(/'use strict';/g, '');

// DEBUG: Uncomment next line to write inlined code to file before compilation.
// fs.writeFileSync(__dirname + '/precompiled-client.js', gcc._reqParam.js_code);

if (module.parent) {
    // Test
    module.exports = gcc;
} else {
    // Build
    gcc.compile(function(js) {
        var cssFile, css, sockJSFile, sockJS, tplFile, template;

        js = js.replace(/\n/g, '');

        cssFile = home + 'client/xssnake.css';
        css = fs.readFileSync(cssFile, 'utf-8');
        css = minCSS(css);

        sockJSFile = home + 'client/lib/sockjs-0.3.min.js';
        sockJS = fs.readFileSync(sockJSFile, 'utf-8').trim();

        tplFile = home + 'client/templates/index.html.tpl';

        template = fs.readFileSync(tplFile, 'utf-8');
        template = template.replace('%%STYLE%%', css);
        template = template.replace('%%SCRIPT%%', js + sockJS);

        fs.writeFile(home + 'www/index.html', template);
    });
}
