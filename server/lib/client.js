/*jshint globalstrict:true,es5:true*/
'use strict';

var Snake = require('./snake.js');

/**
 * @constructor
 * @param {Server} server
 * @param {number} id
 * @param {EventEmitter} socket
 */
function Client (server, id, socket) {
    this.server = server;
    this.id = id;
    this.roomid = null;
    this.socket = socket;
    this.name = 'Anonymous';
    this.snake = new Snake(this.server);
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
    }

};
