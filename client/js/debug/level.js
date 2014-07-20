'use strict';

xss.debug.NS = 'DEBUG';

// Debug URL: debug.html?debug=level:0
xss.debug.debugLevelMatch = location.search.match(/debug=level:([0-9]+)$/);
if (xss.debug.debugLevelMatch) {
    xss.menuSnake = true; // Prevent spawn.
    document.addEventListener('DOMContentLoaded', function() {
        xss.debug.level();
    });
}

xss.debug.level = function() {
    if (!xss.levels || !xss.levels.loaded) {
        xss.event.off(xss.PUB_FONT_LOAD);
        return setTimeout(xss.debug.level);
    }

    var levelIndex = Number(xss.debug.debugLevelMatch[1]);
    var game = new xss.Game(0, Math.random(), levelIndex, ['Dummy']);
    game.start();
    game.snakes[0].size = 4;
};
