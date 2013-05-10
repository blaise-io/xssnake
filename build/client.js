/*jshint globalstrict:true, es5:true, node:true, sub:true*/
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

gcc.params({
    js_externs                : js_externs,
    output_info               : ['compiled_code', 'errors', 'warnings', 'statistics'],
    use_types_for_optimization: 'true',
    language                  : 'ECMASCRIPT5_STRICT',
    compilation_level         : 'ADVANCED_OPTIMIZATIONS',
    warning_level             : 'VERBOSE'
});

gcc.addFile(home + 'source/js/main.js');
gcc.addDir(home + 'server/shared', ['config.example.js']);
gcc.addDir(home + 'source/js', ['main.js']);

gcc.replace(/'use strict';/g, '');
gcc.compile(function(js) {
    var cssFile, css, sockJSFile, sockJS, tplFile, template;

    js = js.replace(/\n/g, '');

    cssFile =  home + 'source/xssnake.css';
    css = fs.readFileSync(cssFile, 'utf-8');
    css = minCSS(css);

    sockJSFile = home + 'source/lib/sockjs-0.3.min.js';
    sockJS = fs.readFileSync(sockJSFile, 'utf-8').trim();

    tplFile = home + 'source/templates/index.html.tpl';

    template = fs.readFileSync(tplFile, 'utf-8');
    template = template.replace('%%STYLE%%', css);
    template = template.replace('%%SCRIPT%%', js + sockJS);

    fs.writeFile(home + 'www/index.html', template);

});
