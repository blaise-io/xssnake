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
    this.averageLatencyInTicks = 1;

    this.players.setSnakes(this.level);

    this.bindEvents();

    this.tickInterval = setInterval(
        this.handleTick.bind(this),
        xss.SERVER_TICK_INTERVAL
    );
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
        this.roomEmitter.on(xss.NC_SNAKE_UPDATE, this.ncSnakeUpdate.bind(this));
        this.roomEmitter.on(xss.NC_PONG, this.ncPong.bind(this));
    },

    unbindEvents: function() {
        this.roomEmitter.removeAllListeners(xss.NC_SNAKE_UPDATE);
        this.roomEmitter.removeAllListeners(xss.NC_PONG);
    },

    /**
     * @param {?} dirtySnake
     * @param {xss.room.ServerPlayer} player
     */
    ncSnakeUpdate: function(dirtySnake, player) {
        var move = new xss.game.ServerSnakeMove(dirtySnake, player);
        if (move.isValid()) {
            this.applyMove(player.snake, move);
            this.players.emit(xss.NC_SNAKE_UPDATE, player.snake.serialize(), player);
        } else {
            this.players.emit(xss.NC_SNAKE_UPDATE, player.snake.serialize());
        }
    },

    /**
     * Update averge latency of all players in this room.
     * Affects tolerance of clients overriding server prediction.
     */
    ncPong: function() {
        this.averageLatencyInTicks = this.getAverageLatencyInTicks();
    },

    /**
     * @return {number}
     */
    getCrashedCount: function() {
        var count = 0;
        for (var i = 0, m = this.players.players.length; i < m; i++) {
            if (this.players.players[i].snake.crashed) {
                count++;
            }
        }
        return count;
    },

    /**
     * @return {number}
     */
    getAverageLatencyInTicks: function() {
        var latencies = [];
        for (var i = 0, m = this.players.length; i < m; i++) {
            latencies.push(this.players[i].player.heartbeat.latency);
        }
        return Math.round(xss.util.average(latencies) / xss.SERVER_TICK_INTERVAL);
    },

    handleTick: function() {
        var now = +new Date();
        this.gameloop(++this.tick, now - this.lastTick);
        this.lastTick = now;
    },

    gameloop: function(tick, elapsed) {
        var shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);
        this.handleCrashingPlayers(tick - this.averageLatencyInTicks);
        this.players.moveSnakes(tick, elapsed, shift);
    },

    handleCrashingPlayers: function(tick) {
        var collisions = [], crashingPlayers;

        crashingPlayers = this.players.getCollisionsOnTick(tick);

        if (crashingPlayers.length) {
            for (var i = 0, m = crashingPlayers.length; i < m; i++) {
                var snake = crashingPlayers[i].snake;
                snake.crashed = true;
                collisions.push([
                    snake.index,
                    snake.parts,
                    snake.collision.serialize()
                ]);
            }

            // Emit crashed snakes.
            this.players.emit(xss.NC_SNAKE_CRASH, collisions);

            // Let round manager know.
            this.roomEmitter.emit(xss.SE_PLAYER_COLLISION, crashingPlayers);
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
