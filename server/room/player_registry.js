'use strict';

/**
 * @constructor
 */
xss.room.PlayerRegistry = function() {
    /** @type {Array.<xss.room.Player>} */
    this.players = [];

    /** type {Array.<Array>} */
    this.emitBuffer = [];
};

xss.room.PlayerRegistry.prototype = {

    destruct: function() {
        this.players.length = 0;
        this.emitBuffer.length = 0;
    },

    /**
     * @param {xss.room.Player} player
     */
    add: function(player) {
        this.players.push(player);
        player.ondisconnect = this.disconnect.bind(this);
    },

    /**
     * @param {xss.room.Player} player
     */
    remove: function(player) {
        var index = this.players.indexOf(player);
        if (-1 !== index) {
            this.players.splice(this.players.indexOf(player), 1);
        }
    },

    /**
     * @param {xss.room.Player} player
     */
    disconnect: function(player) {
        this.emit(xss.EVENT_CHAT_NOTICE, [
            xss.NOTICE_DISCONNECT,
            this.players.indexOf(player)
        ]);
        // Keep player data until rounds have ended.
        // this.remove(player);
    },

    getTotal: function() {
        return this.players.length;
    },

    /**
     * @returns {Array}
     */
    serialize: function() {
        var serialized = [];
        for (var i = 0, m = this.players.length; i < m; i++) {
            serialized.push(this.players[i].serialize());
        }
        return serialized;
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
