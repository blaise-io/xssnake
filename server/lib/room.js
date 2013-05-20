/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Game = require('./game.js');
var map = require('../shared/map.js');
var events = require('../shared/events.js');
var config = require('../shared/config.js');

/**
 * @param {Server} server
 * @param {string} key
 * @param {Object} options
 * @constructor
 */
function Room(server, key, options) {
    this.server = server;

    this.key = key;
    this.clients = [];
    this.points = [];
    this.round = 0;
    this.level = 0;

    this.options = this.cleanOptions(options);
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
        if (this.game) {
            this.game.destruct();
            this.game = null;
        }
        if (this._disconnected.length) {
            this._removeDisconnectedClients(this._disconnected);
        }
        this.clients = [];
        this.points = [];
    },

    updateIndices: function() {
        for (var i = 0, m = this.clients.length; i < m; i++) {
            this.clients[i].index = i;
        }
    },

    emitState: function() {
        var capacity = this.options[map.FIELD.MAX_PLAYERS];
        for (var i = 0, m = this.clients.length; i < m; i++) {
            var data = [
                i, capacity, this.round, this.key,
                this.level, this.names(), this.points
            ];
            this.clients[i].emit(events.ROOM_INDEX, data);
        }
    },

    /**
     * @param {Client} client
     * @returns {boolean}
     */
    isHost: function(client) {
        return (0 === client.index);
    },

    /**
     * @param {Object} options
     * @return {Object}
     */
    cleanOptions: function(options) {
        var players = [], difficulties, field = map.FIELD;

        for (var i = 1; i <= config.ROOM_CAPACITY; i++) {
            players.push(i);
        }

        difficulties = [map.VALUE.EASY, map.VALUE.MEDIUM, map.VALUE.HARD];

        options[field.MAX_PLAYERS] = +options[field.MAX_PLAYERS];
        options[field.DIFFICULTY] = +options[field.DIFFICULTY];
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

        client.room = this;
        client.index = index;

        this.emitState();

        client.broadcast(events.CHAT_NOTICE, '{' + index + '} joined');

        this.points[index] = 0;

        if (this.isFull()) {
            this.game.countdown();
        }

        return this;
    },

    /**
     * @param {Client} client
     */
    disconnect: function(client) {
        var index = client.index;

        // Wait until round end if user is playing with others.
        if (this.round && this.clients.length > 1) {
            this.game.clientDisconnect(client);
            this._disconnected.push(client);
        } else {
            this.clients.splice(index, 1);
            this.server.removeClient(client);
        }

        if (this.clients.length) {
            // Emit chat notice first or client cannot replace index with name.
            this.emit(events.CHAT_NOTICE, '{' + index + '} left');
            this.updateIndices();
            this.emitState();
        } else {
            this.server.roomManager.remove(this);
        }
    },

    nextRound: function() {

        this._removeDisconnectedClients(this._disconnected);

        if (this.clients.length) {
            this.level++;

            if (this.hasWinner()) {
                this.roundsEnded();
            } else {
                this.nextRoundStart();
            }
        } else {
            this.server.roomManager.remove(this);
        }
    },

    /**
     * @returns {boolean}
     */
    hasWinner: function() {
        if (this.round + 1 >= config.ROOM_ROUNDS && this.points.length > 1) {
            var sorted = this.points.slice().sort().reverse();
            if (sorted[0] - config.ROOM_WIN_BY_MIN > sorted[1]) {
                return true;
            }
        }
        return false;
    },

    roundsEnded: function() {
        if (this.options[map.FIELD.XSS]) {
            // TODO: Implement this.game.fireXSS
            console.log('this.game.fireXSS()');
        } else {
            // TODO: Implement this.game.showHeaven
            console.log('this.game.showHeaven()');
        }
    },

    nextRoundStart: function() {
        this.game.destruct();
        this.game = new Game(this, this.level);
        this.game.countdown();
        this.emitState();
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
     * @param {*=} data
     */
    emit: function(name, data) {
        for (var i = 0, m = this.clients.length; i < m; i++) {
            this.clients[i].emit(name, data);
        }
    },

    /**
     * Buffer events to be sent later using flush()
     * @param {string} type
     * @param {*} data
     * @return {Room}
     */
    buffer: function(type, data) {
        this._buffer.push([type, data]);
        return this;
    },

    /**
     * Send buffer
     * @return {Room}
     */
    flush: function() {
        this.emit(events.COMBI, this._buffer);
        this._buffer = [];
        return this;
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
            clientPoints = this.points[client.index];
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
                this.clients.splice(clients[i].index, 1);
                this.updateIndices();
                this.server.removeClient(clients[i]);
            }
        }
        this._disconnected = [];
    }

};
