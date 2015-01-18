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
    this.prevtick = +new Date();

    this.players.setSnakes(this.level);

    this.bindEvents();
    this.tickInterval = setInterval(this.tick.bind(this), xss.SERVER_TICK_INTERVAL);
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
        this.roomEmitter.on(xss.NC_SNAKE_UPDATE, this.handleSnakeUpdate);
    },

    unbindEvents: function() {
        this.roomEmitter.off(xss.NC_SNAKE_UPDATE);
    },

    tick: function() {
        var now = +new Date();
        this.gameloop(now - this.prevtick);
        this.prevtick = now;
    },

    gameloop: function(elapsed) {
        var shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);
        this.players.moveSnakes(elapsed, shift);
    },

    /**
     * @param {?} dirtySnake
     * @param {xss.room.ServerPlayer} player
     */
    handleSnakeUpdate: function(dirtySnake, player) {
        var move = new xss.game.ServerSnakeMove(dirtySnake, player);
        if (move.isValid()) {
            player.snake.direction = move.direction;
            player.snake.parts = move.parts;
            player.snake.trimParts();
        } else {
            console.log('invalid', move.status);
            // TODO: Emit our snake to player
        }
    }

};
