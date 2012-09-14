/*jshint globalstrict:true,es5:true*/
'use strict';

var Level = require('./level.js'),
    Snake = require('./snake.js');

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
    this.inprogress = false;

    this.apples = [];

    // Sanitize user input
    capacity = parseInt(filter.capacity, 10);
    capacity = (typeof capacity === 'number') ? capacity : 4;
    capacity = (capacity >= 1 && capacity <= 4) ? capacity : 4;

    this.pub      = !!filter.pub;
    this.friendly = !!filter.friendly;
    this.capacity = capacity;
}

module.exports = Room;

Room.prototype = {

    /**
     * @param {Client} client
     * @return {Room}
     */
    join: function(client) {
        this.clients.push(client);
        client.socket.join(this.id);
        client.roomid = this.id;
        return this;
    },

    /**
     * @param {Client} client
     * @return {boolean}
     */
    leave: function(client) {
        var index = this.indexOf(client);

        if (-1 !== index) {
            this.clients.splice(index, 1);
            this.emit('/c/notice', client.name + ' left');
            return true;
        }

        return false;
    },

    /**
     * @return {boolean}
     */
    full: function() {
        return (this.clients.length === this.capacity);
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
     * @param {Client} client
     * @return {number}
     */
    indexOf: function(client) {
        for (var i = 0, m = this.clients.length; i < m; i++) {
            if (client === this.clients[i]) {
                return i;
            }
        }
        return -1;
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

    start: function() {
        this.levelID = 2;
        this.level = new Level(this.server, this.levelID);
        this._setupClients();
        this.inprogress = true;
    },

    respawnApple: function() {
        this.apple = this.level.getRandomOpenTile();
        this.emit('/c/apple', [0, this.apple]);
    },

    _setupClients: function() {
        var names = this.names();
        this.apple = this.level.getRandomOpenTile();
        for (var i = 0, m = this.clients.length; i < m; i++) {
            this._spawnClientSnake(i);
            this._emitGameStart(i, names);
        }
    },

    _spawnClientSnake: function(index) {
        var spawn, direction, level = this.level;
        spawn = level.getSpawn(index);
        direction = level.getSpawnDirection(index);
        this.clients[index].snake = new Snake(this, index, spawn, direction);
    },

    _emitGameStart: function(index, names) {
        this.clients[index].emit('/c/start', {
            level   : this.levelID,
            apple   : this.apple,
            capacity: this.capacity,
            index   : index,
            names   : names
        });
    }

};