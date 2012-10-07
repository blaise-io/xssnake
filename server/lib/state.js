/*jshint globalstrict:true,es5:true*/
'use strict';

var Client = require('./client.js');

/**
 * @param {Server} server
 * @constructor
 */
function State(server) {
    this.server = server;
    /** @typedef {number} */
    this.curid = 0;
    /** @typedef {Object.<number, {Client}>} */
    this.clients = {};
}

module.exports = State;

State.prototype = {

    /**
     * @param {EventEmitter} socket
     * @return {Client}
     */
    addClient: function(socket) {
        var id = ++this.curid;
        this.clients[id] = new Client(this.server, id, socket);
        return this.clients[id];
    },

    /**
     * @param {Client} client
     */
    removeClient: function(client) {
        delete this.clients[client.id];
        client.snake = null;
        client = null;
    }

};