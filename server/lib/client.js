/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var events = require('../shared/events.js');
var EventHandler = require('./event_handler.js');

/**
 * @param {number} id
 * @param {Server} server
 * @param {Object} connection
 * @constructor
 */
function Client(id, server, connection) {
    this.id = id;
    this.server = server;
    this.connection = connection;

    /** @type {EventHandler} */
    this.eventHandler = new EventHandler(this.server, this, connection);

    /** @type {number} */
    this.latency = 0;
    /** @type {number} */
    this.index = -1;
    /** @type {boolean} */
    this.limbo = false;
    /** @type {string} */
    this.name = '';
    /** @type {Snake} */
    this.snake = null;
    /** @type {string} */
    this.room = null;
}

module.exports = Client;

Client.prototype = {

    destruct: function() {
        this.eventHandler.destruct();
        this.eventHandler = null;
        this.connection = null;
        this.snake = null;
        this.room = null;
    },

    /**
     * Send data to client
     * @param {string} name
     * @param {*} data
     */
    emit: function(name, data) {
        this.connection.write(JSON.stringify([name, data]));
    },

    /**
     * @param {string} name
     * @param {*=} data
     */
    broadcast: function(name, data) {
        var room = this.room;
        if (room) {
            for (var i = 0, m = room.clients.length; i < m; i++) {
                if (room.clients[i] !== this) {
                    room.clients[i].emit(name, data);
                }
            }
        }
    },

    /**
     * Buffer events to be sent later using flush()
     * @param {string} type
     * @param {*} data
     * @return {Room}
     */
    buffer: function(type, data) {
        this._buffer.push([type, data]);
        return this;
    },

    /**
     * Send buffer
     * @return {Room}
     */
    flush: function() {
        this.emit(events.COMBI, this._buffer);
        this._buffer = [];
        return this;
    }

};
