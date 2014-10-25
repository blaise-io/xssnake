'use strict';

/***
 * Game
 * @param {xss.room.ClientPlayerRegistry} players
 * @param {xss.level.Level} level
 * @constructor
 */
xss.game.ClientGame = function(players, level) {
    this.setPlayersAndSnakes(players);

    this.level = level;
    this.level.paint();

    this.spawnables = new xss.game.SpawnableRegistry();

    this.started = false;

    this.bindEvents();
};

xss.game.ClientGame.prototype = {

    destruct: function() {
        xss.event.off(xss.PUB_GAME_TICK, xss.NS_GAME);
        //xss.event.off(xss.NC_GAME_SPAWN, xss.NS_GAME);
        //xss.event.off(xss.NC_SNAKE_UPDATE, xss.NS_GAME);
        //xss.event.off(xss.NC_SNAKE_SIZE, xss.NS_GAME);
        //xss.event.off(xss.NC_SNAKE_CRASH, xss.NS_GAME);
        //xss.event.off(xss.NC_SNAKE_ACTION, xss.NS_GAME);
        //xss.event.off(xss.NC_SNAKE_SPEED, xss.NS_GAME);

        this.players = null;
        this.level = null;
        this.spawnables.destruct();
    },

    updatePlayers: function(players) {
        this.players.unsetSnakes();
        this.setPlayersAndSnakes(players);
    },

    setPlayersAndSnakes: function(players) {
        this.players = players;
        this.players.setSnakes(this.level);
        this.players.showMeta();
    },

    updateLevel: function(level) {
        this.level.destruct();
        this.level = level;
        this.level.paint();
    },

    bindEvents: function() {
        var ns = xss.NS_GAME;

        xss.event.on(xss.PUB_GAME_TICK, ns, this._clientGameLoop.bind(this));

        //// @todo put in SpawnableRegistry
        //xss.event.on(xss.NC_GAME_SPAWN,     ns, this._evSpawn.bind(this));
        //xss.event.on(xss.NC_GAME_DESPAWN,   ns, this._evSpawnHit.bind(this));
        //
        //// @todo put in SnakeRegistry
        //xss.event.on(xss.NC_SNAKE_UPDATE,   ns, this._evSnakeUpdate.bind(this));
        //xss.event.on(xss.NC_SNAKE_SIZE,     ns, this._evSnakeSize.bind(this));
        //xss.event.on(xss.NC_SNAKE_CRASH,    ns, this._evSnakeCrash.bind(this));
        //xss.event.on(xss.NC_SNAKE_ACTION,   ns, this._evSnakeAction.bind(this));
        //xss.event.on(xss.NC_SNAKE_SPEED,    ns, this._evSnakeSpeed.bind(this));
    },

    /**
     * A Game does not start immediately after a new instance of the Game class
     * is created. It will show the snakes, level, name labels and directions
     * until this function is called.
     */
    start: function() {
        xss.event.on(
            xss.PUB_WIN_FOCUS_CHANGE,
            xss.NS_GAME,
            this._handleFocus.bind(this)
        );

        this.started = true;
        this.players.hideMeta();
        this.players.addControls();
    },

    _evSpawn: function(data) {
        var spawn, type = data[0], index = data[1];
        spawn = new xss.Spawnable(type, index, data[2]);
        this.spawnables[index] = spawn;
    },

    /**
     * @param {number} index
     */
    _evSpawnHit: function(index) {
        var spawnable = this.spawnables[index];
        if (spawnable) {
            spawnable.destruct();
            spawnable[index] = null;
        }
    },

    /**
     * @param {Array} data
     */
    _evSnakeUpdate: function(data) {
        var snake = this.snakes[data[0]];
        snake.limbo = false;
        snake.parts = data[1];
        snake.direction = data[2];
    },

    /**
     * @param {Array} data
     */
    _evSnakeSize: function(data) {
        this.snakes[data[0]].size = data[1];
    },

    /**
     * @param {Array} data
     */
    _evSnakeCrash: function(data) {
        var snake = this.snakes[data[0]];
        snake.parts = data[1];
        snake.crash(data[2]);
    },

    /**
     * @param {Array} data
     */
    _evSnakeAction: function(data) {
        this.snakes[data[0]].showAction(data[1]);
    },

    /**
     * @param {Array} data
     */
    _evSnakeSpeed: function(data) {
        this.snakes[data[0]].speed = data[1];
    },

    /**
     * @param {boolean} focus
     * @private
     */
    _handleFocus: function(focus) {
        if (focus && xss.player) {
            xss.player.emit(xss.NC_GAME_STATE);
        }
    },

    /**
     * Runs ~ every 16 ms (60 fps)
     * @param {number} delta
     * @private
     */
    _clientGameLoop: function(delta) {
        var shift = this.level.gravity.getShift(delta);
        this.level.animations.update(delta, this.started);

        if (this.started) {
            this.players.moveSnakes(delta, shift);
        }
    }

};
