/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Game = require('./game.js'),
    events = require('../shared/events.js'),
    config = require('../shared/config.js');

/**
 * @param {Server} server
 * @param {number} id
 * @param {Object} filter
 * @constructor
 */
function Room(server, id, filter) {
    this.server = server;

    this.id = id;
    this.clients = [];
    this.points = [];
    this.inProgress = false;

    this.pub      = !!filter['public'];
    this.friendly = !!filter['friendly'];
    this.capacity = config.ROOM_CAPACITY;

    this.level = 0;
    this.game = new Game(this, this.level);

    this._disconnected = [];
}

module.exports = Room;

Room.prototype = {

    destruct: function() {
        this.game.destruct();
        this.game = null;
        this.clients = null;
    },

    emitState: function() {
        var names = this.names();
        for (var i = 0, m = this.clients.length; i < m; i++) {
            var data = [i, this.level, names, this.points];
            this.clients[i].emit(events.CLIENT_ROOM_INDEX, data);
        }
    },

    /**
     * @param {Client} client
     * @return {Room}
     */
    join: function(client) {
        var index = this.clients.push(client) - 1;
        client.socket.join(this.id);
        client.roomid = this.id;
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
        return (this.clients.length === this.capacity);
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
        this.server.io.sockets.in(this.id).emit(name, data);
    },

    /**
     * Send data to everyone else in the room.
     * @param {string} name
     * @param {*} data
     * @param {Client} exclude
     */
    broadcast: function(name, data, exclude) {
        exclude.socket.broadcast.to(this.id).emit(name, data);
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