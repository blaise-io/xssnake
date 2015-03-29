'use strict';

/***
 * Game
 *
 * A Game does not start immediately after a new instance of the Game class
 * is created. It will show the snakes, level, name labels and directions
 * until ClientGame.start() is called.
 *
 * @param {xss.level.Level} level
 * @param {xss.room.ClientPlayerRegistry} players
 *
 * @constructor
 */
xss.game.ClientGame = function(level, players) {
    this.level = level;
    this.players = this.updatePlayers(players);

    this.level.paint();
    this.started = false;

    this.spawnables = new xss.game.SpawnableRegistry();
    this.bindEvents();
};

xss.game.ClientGame.prototype = {

    destruct: function() {
        this.unbindEvents();

        this.spawnables.destruct();

        this.level = null;
        this.players = null;
        this.spawnables = null;
    },

    bindEvents: function() {
        xss.event.on(xss.EV_GAME_TICK, xss.NS_GAME, this.gameloop.bind(this));
        xss.event.on(xss.NC_SNAKE_UPDATE, xss.NS_GAME, this.ncUpdateSnake.bind(this));
        xss.event.on(xss.NC_SNAKE_CRASH, xss.NS_GAME, this.ncSetSnakesCrashed.bind(this));

        //xss.event.on(xss.NC_GAME_SPAWN,     ns, this._evSpawn.bind(this));
        //xss.event.on(xss.NC_GAME_DESPAWN,   ns, this._evSpawnHit.bind(this));
        //
        //xss.event.on(xss.NC_SNAKE_SIZE,     ns, this._evSnakeSize.bind(this));
        //xss.event.on(xss.NC_SNAKE_CRASH,    ns, this._evSnakeCrash.bind(this));
        //xss.event.on(xss.NC_SNAKE_ACTION,   ns, this._evSnakeAction.bind(this));
        //xss.event.on(xss.NC_SNAKE_SPEED,    ns, this._evSnakeSpeed.bind(this));
    },

    unbindEvents: function() {
        xss.event.off(xss.EV_GAME_TICK, xss.NS_GAME);
        xss.event.off(xss.NC_SNAKE_UPDATE, xss.NS_GAME);
    },

    /**
     * Update game before round has started.
     * Don't call this mid-game.
     * @param {xss.room.ClientPlayerRegistry} players
     */
    updatePlayers: function(players) {
        players.unsetSnakes();
        players.setSnakes(this.level);
        players.showMeta();
        return players;
    },

    /**
     * @param {xss.level.Level} level
     */
    updateLevel: function(level) {
        this.level.destruct();
        this.level = level;
        this.level.paint();
        // Apply changes in spawns.
        this.updatePlayers(this.players);
    },

    /**
     * @param {Array} serializedSnake
     */
    ncUpdateSnake: function(serializedSnake) {
        var clientIndex = serializedSnake.shift();
        this.players.players[clientIndex].snake.deserialize(serializedSnake);
    },

    /**
     * @param {Array} serializedCollisions
     */
    ncSetSnakesCrashed: function(serializedCollisions) {
        for (var i = 0, m = serializedCollisions.length; i < m; i++) {
            var snake, collision = serializedCollisions[i];
            snake = this.players.players[collision[0]].snake;
            snake.parts = collision[1];
            snake.setCrashed(collision[2]);
        }
    },

    /**
     * Runs ~ every 16 ms (60 fps)
     * @param {number} elapsed
     */
    gameloop: function(elapsed) {
        var shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);

        if (this.started) {
            this.players.moveSnakes(this.level, elapsed, shift);
        }
    },

    /**
     * Start game.
     */
    start: function() {
        this.started = true;
        this.players.hideMeta();
        this.players.addControls();
    }
};
