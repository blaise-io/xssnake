'use strict';

/**
 * @constructor
 * @extends {xss.room.PlayerRegistry}
 */
xss.room.ServerPlayerRegistry = function() {
    xss.room.PlayerRegistry.call(this);
    this.averageLatencyInTicks = 0;
};

xss.extend(xss.room.ServerPlayerRegistry.prototype, xss.room.PlayerRegistry.prototype);
xss.extend(xss.room.ServerPlayerRegistry.prototype, /** @lends {xss.room.ServerPlayerRegistry.prototype} */ {

    /**
     * Send data to everyone in the room.
     * @param {number} type
     * @param {*=} data
     * @param {xss.room.ServerPlayer=} exclude
     */
    emit: function(type, data, exclude) {
        for (var i = 0, m = this.players.length; i < m; i++) {
            if (exclude !== this.players[i]) {
                this.players[i].emit(type, data);
            }
        }
    },

    /**
     * Emit players.
     * Players get their own version because serialize contains local flag.
     */
    emitPlayers: function() {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].emit(
                xss.NC_PLAYERS_SERIALIZE,
                this.serialize(this.players[i])
            );
        }
    },

    removeDisconnectedPlayers: function() {
        for (var i = 0; i < this.players.length; i++) {
            if (!this.players[i].connected) {
                this.players[i].destruct();
                this.remove(this.players[i]);
                this.emitPlayers();
            }
        }
    },

    /**
     * @param {xss.level.Level} level
     */
    setSnakes: function(level) {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].setSnake(i, level);
        }
    },

    /**
     * @param {number} tick
     * @return {Array.<xss.room.ServerPlayer>}
     */
    getCollisionsOnTick: function(tick) {
        var crashingPlayers = [];
        for (var i = 0, m = this.players.length; i < m; i++) {
            if (this.players[i].snake.hasCollisionLteTick(tick)) {
                crashingPlayers.push(this.players[i]);
            }
        }
        return crashingPlayers;
    },

    /**
     * @param {number} tick
     * @param {number} elapsed
     * @param {xss.Shift} shift
     */
    moveSnakes: function(tick, elapsed, shift) {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.handleNextMove(tick, elapsed, shift, this.players);
            this.players[i].snake.shiftParts(shift);
        }
    }

});
