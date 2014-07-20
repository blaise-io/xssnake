/* jshint devel: true */
'use strict';

xss.debug.NS = 'DEBUG';

// Debug URL: debug.html?debug=level:0
xss.debug.debugLevelMatch = location.search.match(/debug=level:([0-9]+)$/);
if (xss.debug.debugLevelMatch) {
    xss.menuSnake = true; // Prevent spawn.
    document.addEventListener('DOMContentLoaded', function() {
        window.setTimeout(xss.debug.level, 2000);
    });
}

xss.debug.level = function() {
    var levelIndex = Number(xss.debug.debugLevelMatch[1]);
    var game = new xss.Game(0, Math.random(), levelIndex, ['Dummy']);
    game.start();
    game.snakes[0].size = 4;
};
