/*jshint globalstrict:true,es5:true*/
'use strict';

/**
 * Compiles XSSNAKE's source files to compiled.js
 * Usage: # node ./build/compile_source.js
 */

var header,
    util    = require('util'),
    closure = require('./lib/closure.js'),
    home    = __dirname + '/../',
    file    = home + 'www/xssnake.js';

header = util.format(
    '// © %d Blaise Kal\n' +
    '// Compiled using Google Closure Compiler on %s\n' +
    '// Source available at https://github.com/blaisekal/xssnake\n',
    new Date().getFullYear(), new Date().toUTCString()
);

closure.addFiles(
    home + 'source/js/init.js',
    home + 'source/js/utils.js',
    home + 'server/shared/config.js',
    home + 'server/shared/sugar.js',
    home + 'server/shared/levels.js',
    home + 'server/shared/level.js',
    home + 'source/js/pixelentity.js',
    home + 'source/js/pubsub.js',
    home + 'source/js/drawables.js',
    home + 'source/js/canvas.js',
    home + 'source/js/effects.js',
    home + 'source/js/font.js',
    home + 'source/js/stage_classes.js',
    home + 'source/js/stage_objects.js',
    home + 'source/js/socket.js',
    home + 'source/js/client.js',
    home + 'source/js/snake.js',
    home + 'source/js/apple.js',
    home + 'source/js/client_level.js',
    home + 'source/js/game.js'
);

closure.externs('var io={' +
    '"connect":function(){},' +
    '"emit":function(){},' +
    '"on":function(){}};');
closure.replace(/'use strict';/g, '');
closure.header(header);
closure.compile(file);