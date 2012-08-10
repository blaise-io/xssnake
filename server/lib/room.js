/*jshint globalstrict:true*/
'use strict';

/**
 * @constructor
 */
function Room(id, publik, friendly) {
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
     */
    join: function(client) {
        this.clients.push(client);
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

    emit: function(io, name, data) {
        io.sockets['in'](this.id).emit(name, data);
    },

    isFull: function() {
        return (this.clients.length === this.capacity);
    }
};