'use strict';

var events = require('events');

/**
 * @param {xss.netcode.Server} server
 * @param {ws.WebSocket} connection
 * @constructor
 * @extends {xss.room.Player}
 */
xss.room.ServerPlayer = function(server, connection) {
    xss.room.Player.call(this);

    this.emitter = new events.EventEmitter();
    this.server = server;

    this.connection = connection;
    this.connection.on('message', this.onmessage.bind(this));
    this.connection.on('close', this.onclose.bind(this));

    this.connected = true;

    this.bindEvents();

    this.ondisconnect = null;

    this.heartbeat = new xss.netcode.ServerHeartbeat(this);
    this.emitBuffer = [];
};

xss.util.extend(xss.room.ServerPlayer.prototype, xss.room.Player.prototype);
xss.util.extend(xss.room.ServerPlayer.prototype, {

    destruct: function() {
        this.connected = false;
        this.unbindEvents();
        this.server = null;
        this.snake = null;
        this.disconnect();
    },

    disconnect: function() {
        console.log('xss.room.ServerPlayer disconnect');
        if (this.ondisconnect) {
            this.ondisconnect(this);
            this.ondisconnect = null;
        }
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        this.emitter.removeAllListeners();
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

    bindEvents: function() {
        this.emitter.on(xss.EVENT_PLAYER_NAME, this.setName.bind(this));
    },

    unbindEvents: function() {
        this.emitter.removeAllListeners(xss.EVENT_PLAYER_NAME);
    },

    /**
     * @param {?} dirtyName
     * @return {string}
     */
    setName: function(dirtyName) {
        this.name = new xss.util.Sanitizer(dirtyName)
            .assertStringOfLength(2, 20)
            .getValueOr(xss.util.getRandomName());
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

});
