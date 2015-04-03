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
};

xss.extend(xss.room.ServerPlayer.prototype, xss.room.Player.prototype);
xss.extend(xss.room.ServerPlayer.prototype, /** @lends {xss.room.ServerPlayer.prototype} */ {

    destruct: function() {
        if (this.connected) {
            this.disconnect();
        }
        this.unbindEvents();
        this.heartbeat.destruct(); // Awww.

        this.server = null;
        this.snake = null;
        this.room = null;
        this.heartbeat = null;
    },

    disconnect: function() {
        this.connected = false;
        if (this.snake) {
            this.snake.crashed = true;
            this.room.emitter.emit(xss.SE_PLAYER_COLLISION, [this]);
        }
        this.emitMessage(xss.SE_PLAYER_DISCONNECT, this);
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
        console.log('IN ', this.name, jsonStr);
        if (message.isClean) {
            this.emitMessage(message.event, message.data);
        }
    },

    emitMessage: function(event, data) {
        var playerEmits, roomEmits;

        playerEmits = this.emitter.emit(event, data);
        roomEmits = this.room && this.room.emitter.emit(event, data, this);

        // Global events (connecting, finding room).
        if (!playerEmits && !roomEmits) {
            this.server.emitter.emit(event, data, this);
        }
    },

    onclose: function() {
        if (this.room && this.room.rounds && this.room.rounds.hasStarted()) {
            // Cannot destruct immediately, game expects player.
            // Room should destruct player at end of round, or
            // when all players in room have disconnected.
            this.disconnect();
        } else {
            this.destruct();
        }
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

        if (!this.connected) {
            return false;
        } else if (!this.heartbeat.isAlive()) {
            this.disconnect();
            return false;
        } else if (this.connection) {
            if (data) {
                emit = data.slice();
                emit.unshift(event);
            } else {
                emit = [event];
            }
            console.log('OUT', this.name, JSON.stringify(emit));
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
     * @param {number} index
     * @param {xss.level.Level} level
     */
    setSnake: function(index, level) {
        this.snake = new xss.game.ServerSnake(index, level);
    },

    unsetSnake: function() {
        if (this.snake) {
            this.snake.destruct();
        }
    },

    /**
     * @return {number}
     */
    getMaxMismatchesAllowed: function() {
        var latency = Math.min(xss.NETCODE_SYNC_MS, this.heartbeat.latency);
        return Math.ceil(latency / this.snake.speed);
    }

});
