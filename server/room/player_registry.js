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
     * @param {xss.room.ServerPlayer} player
     */
    disconnect: function(player) {
        this.emit(xss.EVENT_CHAT_NOTICE, [
            xss.NOTICE_DISCONNECT,
            this.players.indexOf(player)
        ]);
        // Keep player data until rounds have ended.
        // this.remove(player);
    },

    /**
     * Send data to everyone in the room.
     * @param {string} name
     * @param {*=} data
     */
    emit: function(name, data) {
        for (var i = 0, m = this.players.length; i < m; i++) {
            this.players[i].emit(name, data);
        }
    },

    /**
     * Buffer events to be sent later using flush()
     * @param {string} type
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
            this.emit(xss.EVENT_COMBI, this.emitBuffer);
        } else if (this.emitBuffer.length) {
            this.emit(this.emitBuffer[0][0], this.emitBuffer[0][1]);
        }
        this.emitBuffer.length = 0;
    }

});
