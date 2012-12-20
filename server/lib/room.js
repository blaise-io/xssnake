/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var Game = require('./game.js'),
    events = require('../shared/events.js'),
    config = require('../shared/config.js');

/**
 * @param {Server} server
 * @param {string} id
 * @param {Object} filter
 * @constructor
 */
function Room(server, id, filter) {
    this.server = server;

    this.id = id;
    this.clients = [];
    this.points = [];
    this.inProgress = false;

    this.pub      = !!filter.pub;
    this.friendly = !!filter.friendly;
    this.capacity = config.shared.game.capacity;

    this.level = 0;
    this.game = new Game(this, this.level);
}

module.exports = Room;

Room.prototype = {

    destruct: function() {
        this.game.destruct();
        delete this.game;
        delete this.clients;
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
    leave: function(client) {
        var index = this.clients.indexOf(client);

        // Leave during game, clean up after round ends
        if (this.inProgress) {
            this.game.clientQuit(client);
            this._leftClients = this._leftClients || [];
            this._leftClients.push(client);
        }

        // Leave before game, clean up immediately
        else {
            this.clients.splice(index, 1);
            this.emitState();
            this._removeIfEmpty();
        }

        this.emit(events.CLIENT_CHAT_NOTICE, '{' + index + '} left');
    },

    /**
     * @return {Game}
     */
    newRound: function() {
        // Before round starts
        this.game.destruct();
        this._removeLeftClients(this._leftClients);

        if (!this.clients) {
            return null; // Room was destroyed
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
        this.server.io.sockets['in'](this.id).emit(name, data);
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
    _removeLeftClients: function(clients) {
        if (clients) {
            for (var i = 0, m = clients.length; i < m; i++) {
                this.clients.splice(this.clients.indexOf(clients[i]), 1);
                this.server.state.removeClient(clients[i]);
            }
        }
        this._removeIfEmpty();
    },

    /**
     * @private
     */
    _removeIfEmpty: function() {
        if (!this.clients.length) {
            this.server.roomManager.remove(this);
        }
    }

};