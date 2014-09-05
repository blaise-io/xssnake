'use strict';


/**
 * @param {EventEmitter} emitter
 * @param {Object} connection
 * @constructor
 */
xss.netcode.Client = function(emitter, connection) {
    this.model = new xss.model.Client();
    this.connection = connection;
    this.socket = new xss.netcode.Dispatcher(this, emitter, connection);

    /** @type {xss.game.Snake} */
    this.snake = null;

    /** @type {xss.room.Room} */
    this.room = null;
};

xss.netcode.Client.prototype = {

    destruct: function() {
        this.socket.destruct();
        this.model = null;
        this.snake = null;
        this.room = null;
    },

    /**
     * @return {xss.game.Game}
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
        this.connection.send(JSON.stringify(emit), function(error) {
            if (error){
                console.error(error);
            }
        }.bind(this));
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
     * @return {xss.netcode.Client}
     */
    buffer: function(type, data) {
        this.socket.model.emitBuffer.push([type, data]);
        return this;
    },

    /**
     * Send buffer
     * @return {xss.netcode.Client}
     */
    flush: function() {
        var emitBuffer = this.socket.model.emitBuffer;
        if (emitBuffer.length > 1) {
            this.emit(xss.EVENT_COMBI, emitBuffer);
        } else if (emitBuffer.length) {
            this.emit(emitBuffer[0][0], emitBuffer[0][1]);
        }
        emitBuffer.length = 0;
        return this;
    }

};
