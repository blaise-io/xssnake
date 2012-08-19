/*jshint globalstrict:true,es5:true*/
'use strict';

var Client = require('./client.js');

/**
 * @constructor
 */
function State() {
    /* @typedef {number} */
    this.curid = 0;
    /* @typedef {Object.<number, {Client}>} */
    this.clients = {};
}

State.prototype = {

    /**
     * @param {EventEmitter} socket
     * @return {Client}
     */
    addClient: function(socket) {
        var id = ++this.curid;
        this.clients[id] = new Client(id, socket);
        return this.clients[id];
    },

    /**
     * @param {Client} client
     */
    removeClient: function(client) {
        delete this.clients[client.id];
    }

};

module.exports = State;