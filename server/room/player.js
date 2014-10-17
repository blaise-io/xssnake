'use strict';

var events = require('events');

/**
 * @param {xss.netcode.Server} server
 * @param {ws.WebSocket} connection
 * @constructor
 */
xss.room.Player = function(server, connection) {
    this.emitter = new events.EventEmitter();
    this.server = server;

    this.connection = connection;
    this.connection.on('message', this.onmessage.bind(this));
    this.connection.on('close', this.onclose.bind(this));

    this.ondisconnect = null;

    this.name = null;
    this.snake = null;

    this.heartbeat = new xss.netcode.ServerHeartbeat(this);
    this.emitBuffer = [];
};

xss.room.Player.prototype = {

    destruct: function() {
        this.disconnect();
        this.server = null;
        this.snake = null;
    },

    disconnect: function() {
        console.log('xss.room.Player disconnect');
        if (this.ondisconnect) {
            this.ondisconnect(this);
        }
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        this.emitter.removeAllListeners();
    },

    /**
     * @returns {String}
     */
    serialize: function() {
        return this.name;
    },

    /**
     * @param {string} jsonStr
     */
    onmessage: function(jsonStr) {
        var message = new xss.netcode.Message(jsonStr);
        console.log('<--', this.name, jsonStr);
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
        this.name = new xss.util.Validator(dirtyName)
            .assertStringOfLength(2, 20)
            .value(xss.util.getRandomName());
        return this.name;
    },

    /**
     * Send data to client
     * @param {string} name
     * @param {*=} data
     */
    emit: function(name, data) {
        var emit = [name];

        if (!this.heartbeat.isAlive()) {
            this.disconnect();
        } else if (this.connection) {
            if (data) {
                emit.push(data);
            }
            console.log('-->', this.name, JSON.stringify(emit));
            this.connection.send(JSON.stringify(emit), function(error) {
                if (error) {
                    console.error(error);
                }
            }.bind(this));
        }
    },

    /**
     * @param {string} name
     * @param {*=} data
     */
    broadcast: function(name, data) {
        var room = this.room;
        if (room) {
            for (var i = 0, m = room.players.length; i < m; i++) {
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
