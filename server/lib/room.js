/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Game = require('./game.js');
var map = require('../shared/map.js');
var events = require('../shared/events.js');
var config = require('../shared/config.js');
var levels = require('../shared/levels.js');

/**
 * @param {Server} server
 * @param {string} key
 * @param {Object} gameOptions
 * @constructor
 */
function Room(server, key, gameOptions) {
    this.server = server;

    this.key = key;
    this.clients = [];
    this.points = [];
    this.inProgress = false;
    this.level = 0;

    this.options = this.cleanGameOptions(gameOptions);
    this.game = new Game(this, this.level);

    this._disconnected = [];
    this._buffer = [];
}

module.exports = Room;

/**
 * @enum {number}
 */
Room.RANK = {
    LEADING: 0,
    NEUTRAL: 1,
    LOSING : 2
};

Room.prototype = {

    destruct: function() {
        this.game.destruct();
        this.game = null;
        this.clients = null;
    },

    emitState: function() {
        var names = this.names();
        for (var i = 0, m = this.clients.length; i < m; i++) {
            var data = [i, this.key, this.level, names, this.points];
            this.clients[i].emit(events.CLIENT_ROOM_INDEX, data);
        }
    },

    /**
     * @param options
     * @return {Object}
     */
    cleanGameOptions: function(options) {
        var players = [], difficulties, field = map.FIELD;

        for (var i = 1; i <= config.ROOM_CAPACITY; i++) {
            players.push(i);
        }

        difficulties = [map.VALUE.EASY, map.VALUE.MEDIUM, map.VALUE.HARD];

        options[field.MAX_PLAYERS] = options[field.MAX_PLAYERS];
        options[field.DIFFICULTY] = options[field.DIFFICULTY];
        options[field.POWERUPS] = !!options[field.POWERUPS];
        options[field.PRIVATE] = !!options[field.PRIVATE];
        options[field.XSS] = !!options[field.XSS];

        if (-1 === players.indexOf(options[field.MAX_PLAYERS])) {
            options[field.MAX_PLAYERS] = config.ROOM_CAPACITY;
        }

        if (-1 === difficulties.indexOf(options[field.DIFFICULTY])) {
            options[field.DIFFICULTY] = map.VALUE.MEDIUM;
        }

        return options;
    },

    /**
     * @param {Client} client
     * @return {Room}
     */
    join: function(client) {
        var index = this.clients.push(client) - 1;
        client.socket.join(this.key);
        client.roomKey = this.key;
        this.points[index] = 0;

        this.emitState();
        this.broadcast(events.CLIENT_CHAT_NOTICE, '{' + index + '} joined', client);

        if (this.isFull()) {
            this.game.countdown();
        }

        return this;
    },

    /**
     * @param {Client} client
     */
    disconnect: function(client) {
        var index = this.clients.indexOf(client);

        // Leave during game, clean up after round ends
        if (this.inProgress) {
            this.game.clientDisconnect(client);
            this._disconnected.push(client);
        }

        // Leave before game, clean up immediately
        else {
            this.clients.splice(index, 1);
            this.emitState();
            if (!this.clients.length) {
                this.server.roomManager.remove(this);
            }
        }

        this.emit(events.CLIENT_CHAT_NOTICE, '{' + index + '} left');
    },

    /**
     * @return {Game}
     */
    newRound: function() {
        // Before round starts
        this.game.destruct();
        this._removeDisconnectedClients(this._disconnected);

        // Check if Room was destructed
        if (!this.clients.length) {
            this.server.roomManager.remove(this);
            return null;
        }

        // Next level
        ++this.level;
        if (typeof levels[this.level] === 'undefined') {
            this.level = 0;
        }

        // Round start
        this.game = new Game(this, this.level);
        this.emitState();
        this.game.countdown();
        return this.game;
    },

    /**
     * @return {boolean}
     */
    isFull: function() {
        return (this.clients.length === this.options[map.FIELD.MAX_PLAYERS]);
    },

    /**
     * @return {Array.<string>}
     */
    names: function() {
        var names = [];
        for (var i = 0, m = this.clients.length; i < m; i++) {
            names.push(this.clients[i].name);
        }
        return names;
    },

    /**
     * Send data to everyone in the room.
     * @param {string} name
     * @param {*} data
     */
    emit: function(name, data) {
        this.server.io.sockets.in(this.key).emit(name, data);
    },

    /**
     * Buffer events to be sent later using flush()
     * @param {string} name
     * @param {*} data
     * @return {Room}
     */
    buffer: function(name, data) {
        this._buffer.push([name, data]);
        return this;
    },

    /**
     * Send buffer
     * @return {Room}
     */
    flush: function() {
        this.emit(events.CLIENT_COMBI_EVENTS, this._buffer);
        this._buffer = [];
        return this;
    },

    /**
     * Send data to everyone else in the room.
     * @param {string} name
     * @param {*} data
     * @param {Client} exclude
     */
    broadcast: function(name, data, exclude) {
        exclude.socket.broadcast.to(this.key).emit(name, data);
    },

    /**
     * @param client
     * @param {*} losing
     * @param {*} leading
     * @param {*} neutral
     * @return {*}
     */
    rank: function(client, leading, neutral, losing) {
        var clientPoints, rankTmp = 0;
        if (this.clients.length === 1) {
            return neutral;
        } else {
            clientPoints = this.points[this.clients.indexOf(client)];
            for (var i = 0, m = this.points.length; i < m; i++) {
                if (clientPoints > this.points[i]) {
                    rankTmp++;
                } else if (clientPoints < this.points[i]) {
                    rankTmp--;
                }
            }
            if (rankTmp > 0) {
                return leading;
            } else if (rankTmp === 0) {
                return neutral;
            } else {
                return losing;
            }
        }
    },

    /**
     * @param {Array.<Client>} clients
     * @private
     */
    _removeDisconnectedClients: function(clients) {
        if (clients) {
            for (var i = 0, m = clients.length; i < m; i++) {
                this.clients.splice(this.clients.indexOf(clients[i]), 1);
                this.server.removeClient(clients[i]);
            }
        }
        this._disconnected = [];
    }

};