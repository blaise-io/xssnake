'use strict';

/**
 * @constructor
 * @extends {xss.room.PlayerRegistry}
 */
xss.room.ServerPlayerRegistry = function() {
    /** type {Array.<Array>} */
    this.emitBuffer = [];

    xss.room.PlayerRegistry.call(this);
};

xss.util.extend(xss.room.ServerPlayerRegistry.prototype, xss.room.PlayerRegistry.prototype);
xss.util.extend(xss.room.ServerPlayerRegistry.prototype, {

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
     * Players get their own version because seriaize contains local flag.
     */
    emitPlayers: function() {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].emit(
                xss.NC_ROOM_PLAYERS_SERIALIZE,
                this.serialize(this.players[i])
            );
        }
    },

    /**
     * Buffer events to be sent later using flush()
     * @param {number} type
     * @param {*} data
     */
    buffer: function(type, data) {
        this.emitBuffer.push([type, data]);
    },

    /**
     * Send buffer
     */
    flush: function() {
        if (this.emitBuffer.length > 1) {
            this.emit(xss.NC_COMBI, this.emitBuffer);
        } else if (this.emitBuffer.length) {
            this.emit(this.emitBuffer[0][0], this.emitBuffer[0][1]);
        }
        this.emitBuffer.length = 0;
    }

});
