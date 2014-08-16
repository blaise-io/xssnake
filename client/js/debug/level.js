'use strict';

// Debug URL: debug.html?debug=level:0
xss.debug.debugLevelMatch = location.search.match(/debug=(.+Level)$/);
if (xss.debug.debugLevelMatch) {
    xss.menuSnake = true; // Prevent spawn.
    document.addEventListener('DOMContentLoaded', function() {
        xss.debug.level();
    });
}

xss.debug.level = function() {
    var players = new xss.room.PlayerRegistry([''], 0);
    var levelObject = xss.debug.debugLevelMatch[1];
    var levelset = new xss.levelset.Levelset();
    var levelInstance = new xss.levels[levelObject](levelset.options);
    levelInstance.preload(function() {
        xss.flow.destruct();
        var game = new xss.game.Game(players, levelInstance);
        game.start();
    });
};
