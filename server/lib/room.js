/*jshint globalstrict:true*/
'use strict';


/**
 * @param {Server} server
 * @param {string} id
 * @param {boolean} publik
 * @param {boolean} friendly
 * @constructor
 */
function Room(server, id, publik, friendly) {
    this.server = server;

    this.id = id;
    this.publik = publik;
    this.friendly = friendly;

    this.capacity = 4;
    this.clients = [];
    this.inprogress = false;
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
    removeClient: function(client) {
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
    isFull: function() {
        return (this.clients.length === this.capacity);
    },

    /**
     * @param {string} name
     * @param {*} data
     */
    emit: function(name, data) {
        this.server.io.sockets['in'](this.id).emit(name, data);
    },

    /**
     * @param {string} name
     * @param {*} data
     * @param {Client} exclude
     */
    broadcast: function(name, data, exclude) {
        var socket = this.server.getSocket(exclude);
        socket.broadcast.to(this.id).emit(name, data);
    }
};