/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

/**
 * @param {number} id
 * @param {Server} server
 * @param {Object} connection
 * @constructor
 */
function Client(id, server, connection) {
    this.server = server;
    this.id = id;
    this.connection = connection;
    this.latency = 0;

    /** @type {?string} */
    this.name = null;
    /** @type {Snake} */
    this.snake = null;
    /** @type {?string} */
    this.roomKey = null;
    /** @type {EventHandler} */
    this.eventHandler = null;
    /** @type {boolean} */
    this.limbo = false;
}

module.exports = Client;

Client.prototype = {

    /**
     * Send data to client
     * @param {string} name
     * @param {*} data
     */
    emit: function(name, data) {
        this.connection.write(JSON.stringify([name, data]));
    },

    broadcast: function(name, data) {
        var room = this.server.roomManager.room[this.roomKey];
        if (room) {
            for (var i = 0, m = room.clients.length; i < m; i++) {
                if (room.clients[i] !== this) {
                    room.clients[i].emit(name, data);
                }
            }
        }
    },

    destruct: function() {
        this.eventHandler.destruct();
        this.eventHandler = null;
        this.snake = null;
        this.connection = null;
    }

};
