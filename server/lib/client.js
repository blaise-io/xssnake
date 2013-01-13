/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

/**
 * @param {number} id
 * @param {Server} server
 * @param {EventEmitter} socket
 * @constructor
 */
function Client(id, server, socket) {
    this.server = server;
    this.id = id;
    this.socket = socket;
    this.latency = 0;

    /** @type {?string} */
    this.name = null;
    /** @type {Snake} */
    this.snake = null;
    /** @type {?number} */
    this.roomid = null;
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
        this.socket.emit(name, data);
    },

    destruct: function() {
        this.eventHandler.destruct();
        this.eventHandler = null;
        this.snake = null;
        this.socket = null;
    }

};