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

    /** @type {xss.room.ServerRoom} */
    this.room = null;

    this.connection = connection;
    this.connection.on('message', this.onmessage.bind(this));
    this.connection.on('close', this.onclose.bind(this));

    this.connected = true;

    this.bindEvents();

    this.heartbeat = new xss.netcode.ServerHeartbeat(this);
    this.emitBuffer = [];
};

xss.util.extend(xss.room.ServerPlayer.prototype, xss.room.Player.prototype);
xss.util.extend(xss.room.ServerPlayer.prototype, {

    destruct: function() {
        this.disconnect();
        this.unbindEvents();
        this.connected = false;
        this.server = null;
        this.snake = null;
        this.room = null;
    },

    disconnect: function() {
        if (this.room) {
            this.room.removePlayer(this);
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
        this.emitter.on(xss.NC_PLAYER_NAME, this.setName.bind(this));
    },

    unbindEvents: function() {
        this.emitter.removeAllListeners(xss.NC_PLAYER_NAME);
    },

    /**
     * @param {?} dirtyNameArr
     * @return {string}
     */
    setName: function(dirtyNameArr) {
        this.name = new xss.util.Sanitizer(dirtyNameArr[0])
            .assertStringOfLength(xss.PLAYER_NAME_MINLENGTH, 20)
            .getValueOr(xss.util.getRandomName());
        return this.name;
    },

    /**
     * Send data to client
     * @param {number} event
     * @param {Array.<string|number|Array>=} data
     */
    emit: function(event, data) {
        var emit;

        if (!this.heartbeat.isAlive()) {
            this.disconnect();
        } else if (this.connection) {
            if (data) {
                emit = data;
                emit.unshift(event);
            } else {
                emit = [event];
            }
            console.log('-->', this.name, JSON.stringify(emit));
            this.connection.send(JSON.stringify(emit), function(error) {
                if (error) {
                    console.error('Error sending message', error);
                }
            }.bind(this));
        }
    },

    /**
     * @param {string} type
     * @param {*=} data
     */
    broadcast: function(type, data) {
        if (this.room) {
            this.room.players.emit(type, data, this);
        }
    },

    /**
     * Buffer events to be sent later using flush()
     * @param {string} type
     * @param {*} data
     * @deprecated Not that much overhead in separate messages
     */
    buffer: function(type, data) {
        this.emitBuffer.push([type, data]);
    },

    /**
     * Send buffer
     * @deprecated Not that much overhead in separate messages
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
