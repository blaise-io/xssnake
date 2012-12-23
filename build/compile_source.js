/*jshint globalstrict:true, es5:true, node:true*/
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
    js_externs       : js_externs,
    output_info      : ['compiled_code', 'errors', 'warnings', 'statistics'],
    language         : 'ECMASCRIPT5_STRICT',
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    warning_level    : 'VERBOSE'
});

gcc.header(header);

gcc.addFiles(
    home + 'source/js/main.js',
    home + 'source/js/consts.js',
    home + 'server/shared/util.js',
    home + 'server/shared/config.js',
    home + 'server/shared/events.js',
    home + 'server/shared/levels.js',
    home + 'server/shared/level.js',
    home + 'server/shared/snake.js',
    home + 'source/js/bounding_box.js',
    home + 'source/js/shape.js',
    home + 'source/js/shape_generator.js',
    home + 'source/js/publish_subscribe.js',
    home + 'source/js/themes.js',
    home + 'source/js/canvas.js',
    home + 'source/js/transform.js',
    home + 'source/js/font.js',
    home + 'source/js/input_field.js',
    home + 'source/js/stage_classes.js',
    home + 'source/js/stages.js',
    home + 'source/js/stage_flow.js',
    home + 'source/js/socket.js',
    home + 'source/js/client_snake.js',
    home + 'source/js/client_level.js',
    home + 'source/js/apple.js',
    home + 'source/js/powerup.js',
    home + 'source/js/room.js',
    home + 'source/js/game.js',
    home + 'source/js/scoreboard.js',
    home + 'source/js/chat.js'
);
gcc.replace(/'use strict';/g, '');
gcc.output(home + 'www/xssnake.js');