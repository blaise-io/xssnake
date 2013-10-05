'use strict';


/**
 * @param {Object} connection
 * @constructor
 */
xss.Client = function(connection) {
    this.connection = connection;

    this.name = '';
    this.connected = true;
    this.rtt = 0;
    this.index = -1;
    this.limbo = false;

    /** @type {xss.EventHandler} */
    this.eventHandler = null;

    /** @type {xss.Snake} */
    this.snake = null;

    /** @type {xss.Room} */
    this.room = null;

    /** @type {Array.<Array>} */
    this._emitBuffer = [];
};

xss.Client.prototype = {

    destruct: function() {
        this.eventHandler.destruct();
        this.connection = null;
        this.eventHandler = null;
        this.snake = null;
        this.room = null;
    },

    /**
     * @return {xss.Game}
     */
    getGame: function() {
        var room = this.room, rounds = room.rounds;
        return (room && rounds.started) ? rounds.round.game : null;
    },

    /**
     * Send data to client
     * @param {string} name
     * @param {*=} data
     */
    emit: function(name, data) {
        var emit = [name];
        if (data) {
            emit.push(data);
        }
        this.connection.write(JSON.stringify(emit));
    },

    /**
     * @param {string} name
     * @param {*=} data
     */
    broadcast: function(name, data) {
        var room = this.room;
        if (room) {
            for (var i = 0, m = room.clients.length; i < m; i++) {
                if (room.clients[i] !== this) {
                    room.clients[i].emit(name, data);
                }
            }
        }
    },

    /**
     * Buffer events to be sent later using flush()
     * @param {string} type
     * @param {*} data
     * @return {xss.Client}
     */
    buffer: function(type, data) {
        this._emitBuffer.push([type, data]);
        return this;
    },

    /**
     * Send buffer
     * @return {xss.Client}
     */
    flush: function() {
        if (this._emitBuffer.length > 1) {
            this.emit(xss.EVENT_COMBI, this._emitBuffer);
        } else if (this._emitBuffer.length) {
            this.emit(this._emitBuffer[0][0], this._emitBuffer[0][1]);
        }
        this._emitBuffer = [];
        return this;
    }

};
