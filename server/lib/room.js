/*jshint globalstrict:true,es5:true*/
'use strict';


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
        return this;
    },

    /**
     * @param {Client} client
     * @return {boolean}
     */
    leave: function(client) {
        for (var i = 0, m = this.clients.length; i < m; i++) {
            if (this.clients[i] === client) {
                this.clients.splice(i, 1);
                return true;
            }
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

    index: function() {
        for (var i = 0, m = this.clients.length; i < m; i++) {
            this.clients[i].emit('/c/player/index', i);
        }
    }
};