/**
 * Compiles XSSNAKE's client files to compiled.js
 */

/*jshint globalstrict:true */
'use strict';


var closure = require('./lib/closure.js'),
    home = __dirname + '/../',
    file = home + 'compiled.js',
    conf = {};

closure.addFiles(
    home + 'client/js/init.js',
    home + 'client/js/utils.js',
    home + 'client/js/pixelentity.js',
    home + 'client/js/canvas.js',
    home + 'client/js/drawables.js',
    home + 'client/js/effects.js',
    home + 'client/js/font.js',
    home + 'client/js/stageclasses.js',
    home + 'client/js/stageobjects.js',
    home + 'client/js/socket.js',
    home + 'client/js/client.js',
    home + 'client/js/game.js'
);

closure.replace(/'use strict';/g, '');
closure.compile(file, conf);