/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var CONST = require('../shared/const.js');

/**
 * @param {Object} connection
 * @constructor
 */
function Client(connection) {
    this.connection = connection;
}

module.exports = Client;

Client.prototype = {

    connected: true,
    rtt      : 0,
    index    : -1,
    limbo    : false,
    name     : '',

    /** @type {EventHandler} */
    eventHandler: null,

    /** @type {Snake} */
    snake: null,

    /** @type {Room} */
    room: null,

    /** @type {Array.<Array>} */
    _emitBuffer: [],

    destruct: function() {
        this.eventHandler.destruct();
        this.connection = null;
        this.eventHandler = null;
        this.snake = null;
        this.room = null;
    },

    /**
     * @return {boolean}
     */
    playing: function() {
        return !!(this.room && this.room.rounds.started);
    },

    /**
     * Send data to client
     * @param {string} name
     * @param {*=} data
     */
    emit: function(name, data) {
        var emit = [name];
        if (data) {
            emit.push(data);
        }
        this.connection.write(JSON.stringify(emit));
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
     * @return {Client}
     */
    buffer: function(type, data) {
        this._emitBuffer.push([type, data]);
        return this;
    },

    /**
     * Send buffer
     * @return {Client}
     */
    flush: function() {
        if (this._emitBuffer.length > 1) {
            this.emit(CONST.EVENT_COMBI, this._emitBuffer);
        } else if (this._emitBuffer.length) {
            this.emit(this._emitBuffer[0][0], this._emitBuffer[0][1]);
        }
        this._emitBuffer = [];
        return this;
    }

};
