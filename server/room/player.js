'use strict';

var events = require('events');

/**
 * @param {xss.netcode.Server} server
 * @param {EventEmitter} connection
 * @constructor
 */
xss.room.Player = function(server, connection) {
    this.emitter = new events.EventEmitter();
    this.server = server;

    this.connection = connection;
    this.connection.on('message', this.onmessage.bind(this));
    this.connection.on('close', this.onclose.bind(this));

    this.name = null;
    this.snake = null;

    this.heartbeat = new xss.netcode.ServerHeartbeat(this);
    this.emitBuffer = [];
};

xss.room.Player.prototype = {

    destruct: function() {
        this.emitter.removeAllListeners();
        this.emitBuffer.length = 0;
        this.server = null;
        this.connection = null;
        this.snake = null;
    },

    /**
     * @param {string} jsonStr
     */
    onmessage: function(jsonStr) {
        var message = new xss.netcode.Message(jsonStr);
        console.log(message.event, message.data);
        if (message.isClean) {
            // Emit the message on global emitter first,
            // Any class can pick this up.
            if (!this.emitter.emit(message.event, message.data)) {
                // If the event was not picked up, emit the message
                // using the local emitter.
                this.server.emitter.emit(message.event, message.data, this);
            }
        }
    },

    onclose: function() {
        this.destruct();
    },

    /**
     * @param {*} dirtyName
     * @returns {string}
     */
    setName: function(dirtyName) {
        this.name = xss.util.clean.username(dirtyName);
        return this.name;
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
            for (var i = 0, m = room.players.length; i < m; i++) { /*a*/
                if (room.players[i] !== this) {
                    room.players[i].emit(name, data);
                }
            }
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
