'use strict';

// Debug URL: debug.html?debug=LinesLevel
xss.debug.locationLevel = location.search.match(/debug=(.+Level)$/);
if (xss.debug.locationLevel) {
    xss.menuSnake = true; // Prevent spawn.
    document.addEventListener('DOMContentLoaded', function() {
        xss.debug.level();
    });
}

xss.debug.level = function() {
    var player = new xss.room.ClientPlayer();
    player.local = true;

    var players = new xss.room.ClientPlayerRegistry();
    players.add(player);
    players.localPlayer = player;

    var levelObject = xss.debug.locationLevel[1];
    var levelset = new xss.levelset.Levelset();
    var level = new xss.levels[levelObject](levelset.getConfig());

    level.preload(function() {
        xss.flow.destruct();
        var game = new xss.game.ClientGame(level, players);
        game.start();
    });
};
