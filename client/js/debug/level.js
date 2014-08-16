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
    var players = new xss.room.PlayerRegistry(['']);
    var levelObject = xss.debug.debugLevelMatch[1];
    var levelInstance = new xss.levels[levelObject](new xss.levelset.Levelset());
    levelInstance.preload(function() {
        xss.flow.destruct();
        new xss.room.Round(players, levelInstance).start();
    });
};
