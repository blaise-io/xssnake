/* jshint devel: true */
'use strict';

xss.debug.NS = 'DEBUG';

// Debug URL: debug.html?debug=level:0
xss.debug.debugLevelMatch = location.search.match(/debug=level:([0-9]+)$/);
if (xss.debug.debugLevelMatch) {
    document.addEventListener('DOMContentLoaded', function() {
        window.setTimeout(function() {
            xss.levels.onload = xss.debug.level;
        }, 0);
    });
}

xss.debug.level = function() {
    var game;

    xss.socket = {emit: xss.util.noop};
    xss.menuSnake.destruct();

    game = new xss.Game(0, xss.debug.debugLevelMatch, ['']);
    game.start();

    console.info(game.level.levelData);

    xss.event.on(xss.PUB_GAME_TICK, xss.debug.NS, function() {
        if (game.snakes[0].limbo) {
            console.log(game.snakes[0]);
            game.snakes[0].crash();

            xss.event.off(xss.PUB_GAME_TICK, xss.debug.NS);
        }
    });
};
