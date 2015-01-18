'use strict';

/***
 * Game
 * @param {xss.level.Level} level
 * @param {xss.room.ClientPlayerRegistry} players
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
        xss.event.off(xss.EV_GAME_TICK, xss.NS_GAME);
        //xss.event.off(xss.NC_GAME_SPAWN, xss.NS_GAME);
        //xss.event.off(xss.NC_SNAKE_UPDATE, xss.NS_GAME);
        //xss.event.off(xss.NC_SNAKE_SIZE, xss.NS_GAME);
        //xss.event.off(xss.NC_SNAKE_CRASH, xss.NS_GAME);
        //xss.event.off(xss.NC_SNAKE_ACTION, xss.NS_GAME);
        //xss.event.off(xss.NC_SNAKE_SPEED, xss.NS_GAME);

        this.level = null;
        this.players = null;
        this.spawnables.destruct();
        this.spawnables = null;
    },

    /**
     * Update game before round has started.
     * Don't call this mid-game.
     * @param players
     */
    updatePlayers: function(players) {
        players.unsetSnakes();
        players.setSnakes(this.level);
        players.showMeta();
        return players;
    },

    updateLevel: function(level) {
        this.level.destruct();
        this.level = level;
        this.level.paint();
    },

    bindEvents: function() {
        var ns = xss.NS_GAME;

        xss.event.on(xss.EV_GAME_TICK, ns, this.gameloop.bind(this));

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
            xss.EV_WIN_FOCUS_CHANGE,
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
     * @param {number} elapsed
     * @private
     */
    gameloop: function(elapsed) {
        var shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);

        if (this.started) {
            this.players.moveSnakes(elapsed, shift);
        }
    }

};
