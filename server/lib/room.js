/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var Game = require('./game.js'),
    events = require('../shared/events.js');

/**
 * @param {Server} server
 * @param {string} id
 * @param {Object} filter
 * @constructor
 */
function Room(server, id, filter) {
    var capacity;

    this.server = server;

    this.id = id;
    this.clients = [];
    this.inProgress = false;

    // Sanitize user input
    capacity = parseInt(filter.capacity, 10);
    capacity = (typeof capacity === 'number') ? capacity : 4;
    capacity = (capacity >= 1 && capacity <= 4) ? capacity : 4;

    this.pub      = !!filter.pub;
    this.friendly = !!filter.friendly;
    this.capacity = capacity;

    this.level = 0;
    this.game = new Game(this, this.level);
}

module.exports = Room;

Room.prototype = {

    emitState: function() {
        var names = this.names();
        for (var i = 0, m = this.clients.length; i < m; i++) {
            var data = [i, this.level, names];
            this.clients[i].emit(events.CLIENT_ROOM_INDEX, data);
        }
    },

    /**
     * @param {Client} client
     * @return {Room}
     */
    join: function(client) {
        this.clients.push(client);
        client.socket.join(this.id);
        client.roomid = this.id;
        this.emitState();
        this.broadcast(events.CLIENT_CHAT_NOTICE, client.name + ' joined', client);

        if (this.isFull()) {
            this.game.countdown();
        }

        return this;
    },

    /**
     * @param {Client} client
     * @return {boolean}
     */
    leave: function(client) {
        var index = this.clients.indexOf(client);
        if (-1 !== index) {
            this.clients.splice(index, 1);
            this.emit(events.CLIENT_CHAT_NOTICE, client.name + ' left');
            this.emitState();
            return true;
        }
        this.emitState();
        return false;
    },

    /**
     * @return {Game}
     */
    newRound: function() {
        this.game.destruct();

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
    }

};