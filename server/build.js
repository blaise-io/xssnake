/**
 * Compiles XSSNAKE's client files to compiled.js
 */

/*jshint globalstrict:true */
'use strict';


var closure = require('./lib/closure.js'),

    homeDir = __dirname + '/../',

    outputFile = homeDir + 'compiled.js',

    compilerConfig = {
        externs_url: 'http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/jquery-1.7.js'
    };

closure.addFiles(
    homeDir + 'client/js/init.js',
    homeDir + 'client/js/drawables.js',
    homeDir + 'client/js/canvas.js',
    homeDir + 'client/js/effects.js',
    homeDir + 'client/js/font.js',
    homeDir + 'client/js/stageclasses.js',
    homeDir + 'client/js/stageobjects.js'
);

closure.replace(/'use strict';/g, '');
closure.compile(outputFile, compilerConfig);