/**
 * Compiles XSSNAKE's client files to compiled.js
 * Usage: # node ./server/build.js
 */

/*jshint globalstrict:true */
'use strict';


var header,
    util = require('util'),
    closure = require('./lib/closure.js'),
    home = __dirname + '/../',
    file = home + 'compiled.js';

header = util.format(
    '// © %d Blaise Kal\n' +
    '// Compiled using Google Closure Compiler on %s\n' +
    '// Source available at https://github.com/blaisekal/xssnake\n',
    new Date().getFullYear(), new Date().toUTCString()
);

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
    home + 'client/js/snake.js',
    home + 'shared/levels.js',
    home + 'client/js/world.js',
    home + 'client/js/game.js'
);

closure.replace(/'use strict';/g, '');
closure.header(header);
closure.compile(file);