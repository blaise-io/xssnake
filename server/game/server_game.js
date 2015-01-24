'use strict';

/***
 * Game
 * @param {EventEmitter} roomEmitter
 * @param {xss.level.Level} level
 * @param {xss.room.ServerPlayerRegistry} players
 * @constructor
 */
xss.game.ServerGame = function(roomEmitter, level, players) {
    this.roomEmitter = roomEmitter;
    this.level = level;
    this.players = players;
    this.items = new xss.game.ServerItems(level, players);

    this.tick = 0;
    this.lastTick = +new Date();

    this.players.setSnakes(this.level);

    this.bindEvents();
    this.tickInterval = setInterval(this.handleTick.bind(this), xss.SERVER_TICK_INTERVAL);
};

xss.game.ServerGame.prototype = {

    destruct: function() {
        clearInterval(this.tickInterval);
        this.unbindEvents();
        this.items.destruct();
        this.level = null;
        this.players = null;
        this.items = null;
    },

    bindEvents: function() {
        this.roomEmitter.on(
            xss.NC_SNAKE_UPDATE,
            this.handlePlayerSnakeUpdate.bind(this)
        );
    },

    unbindEvents: function() {
        this.roomEmitter.off(xss.NC_SNAKE_UPDATE);
    },

    handleTick: function() {
        var now = +new Date();
        this.gameloop(++this.tick, now - this.lastTick);
        this.lastTick = now;
    },

    gameloop: function(tick, elapsed) {
        var shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);
        this.handleCrashingPlayers(tick);
        this.players.moveSnakes(tick, elapsed, shift);
    },

    handleCrashingPlayers: function(tick) {
        var indexes, crashingPlayers;

        crashingPlayers = this.players.getCollisionsOnTick(
            tick - xss.SERVER_TICK_NUM_REWRITABLE
        );

        if (crashingPlayers.length) {
            for (var i = 0, m = crashingPlayers.length; i < m; i++) {
                crashingPlayers[i].snake.crashed = true;
                indexes = crashingPlayers[i].snake.index;
            }
            // Emit crashed snakes.
            this.players.emit(xss.NC_SNAKE_CRASH, indexes);

            // TODO:

            // Emit snake parts, crashing part of snake.
            // Client should flash snake [?] and show particles.
            // Cannot crash into dead snake [?]

            // Handout knockout points for remaining snakes.

            // Detect round end.
        }
    },

    /**
     * @param {?} dirtySnake
     * @param {xss.room.ServerPlayer} player
     */
    handlePlayerSnakeUpdate: function(dirtySnake, player) {
        var move = new xss.game.ServerSnakeMove(dirtySnake, player);
        if (move.isValid()) {
            this.applyMove(player.snake, move);
            this.players.emit(xss.NC_SNAKE_UPDATE, player.snake.serialize(), player);
        } else {
            this.players.emit(xss.NC_SNAKE_UPDATE, player.snake.serialize());
        }
    },

    /**
     * @param {xss.game.Snake} snake
     * @param {xss.game.ServerSnakeMove} move
     */
    applyMove: function(snake, move) {
        snake.direction = move.direction;
        snake.parts = move.parts;
        snake.trimParts();
    }

};
