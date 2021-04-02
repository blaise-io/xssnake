// Debug URL: debug.html?debug=LinesLevel
debug.locationLevel = location.search.match(/debug=(.+Level)$/);
if (debug.locationLevel) {
    State.menuSnake = true; // Prevent spawn.
    document.addEventListener('DOMContentLoaded', function() {
        debug.level();
    });
}

export class level {
    constructor(level) {
    var player = new ClientPlayer();
    player.local = true;

    var players = new ClientPlayerRegistry();
    players.add(player);
    players.localPlayer = player;

    var levelObject = debug.locationLevel[1];
    var levelset = new levelset.Levelset();
    var level = new levels[levelObject](levelset.getConfig());

    level.preload(function() {
        State.flow.destruct();
        var game = new ClientGame(level, players);
        game.start();
    });
};
