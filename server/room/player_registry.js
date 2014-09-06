'use strict';

xss.room.PlayerRegistry = function() {
    /** @type {Array.<xss.room.Player>} */
    this.players = [];

    /** @deprecated */
    this.clients = null;

    /** type {Array.<Array>} */
    this.emitBuffer = [];
};

xss.room.PlayerRegistry.prototype = {

    destruct: function() {
        this.players.length = 0;
        this.emitBuffer.length = 0;
    },

    /**
     * @param player
     */
    add: function(player) {
        this.players.push(player);
    },

    getTotal: function() {
        return this.players.length;
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
};
