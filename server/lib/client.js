/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

/**
 * @constructor
 * @param {Server} server
 * @param {number} id
 * @param {EventEmitter} socket
 */
function Client (server, id, socket) {
    this.server = server;
    this.id = id;
    this.socket = socket;
    this.roomid = null;
    this.name = 'Anonymous';
    this.wins = 0;
    /** @type {Snake} */
    this.snake = null;
}

module.exports = Client;

Client.prototype = {

    /**
     * Send data to client
     * @param {string} name
     * @param {*} data
     */
    emit: function(name, data) {
        this.socket.emit(name, data);
    },

    destruct: function() {
        this.snake = null;
        this.socket = null;
        this.server = null;
    }

};