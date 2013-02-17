/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Room = require('./room.js');
var Util = require('../shared/util.js');
var form = require('../shared/form.js');
var events = require('../shared/events.js');

/**
 * @constructor
 */
function RoomManager(server) {
    this.server = server;
    this.rooms = {};
}

module.exports = RoomManager;

RoomManager.prototype = {

    /**
     * @param {number} id
     * @return {Room}
     */
    room: function(id) {
        return this.rooms[id];
    },

    /**
     * @param {Room} room
     */
    remove: function(room) {
        delete this.rooms[room.key];
        room.destruct();
    },

    handleAutoJoin: function(client, room) {
        if (this.rooms[room]) {
            // ...
        } else {
            client.emit(events.CLIENT_AUTO_JOIN, 404);
        }
    },

    /**
     * @param {Object.<string, number|boolean>} gameOptions
     * @return {Room}
     */
    getPreferredRoom: function(gameOptions) {
        var room = this._findRoom(gameOptions);
        if (!room) {
            room = this.createRoom(gameOptions);
        }
        return room;
    },

    /**
     * @param {Object.<string, number|boolean>} gameOptions
     * @return {Room}
     */
    createRoom: function(gameOptions) {
        var room, id = Util.randomStr(5);
        room = new Room(this.server, id, gameOptions);
        this.rooms[room.key] = room;
        return room;
    },

    /**
     * @param {Object.<string, number|boolean>} gameOptions
     * @return {?Room}
     * @private
     */
    _findRoom: function(gameOptions) {
        for (var k in this.rooms) {
            if (this.rooms.hasOwnProperty(k)) {
                var room = this.rooms[k];
                if (this._isFilterMatch(gameOptions, room)) {
                    return room;
                }
            }
        }
        return null;
    },

    /**
     * @param {Object.<string, number|boolean>} gameOptions
     * @param {Room} room
     * @return {boolean}
     * @private
     */
    _isFilterMatch: function(gameOptions, room) {
        var field = form.FIELD, roomOptions = room.options;
        switch (true) {
            case room.isFull():
            case room.inProgress:
            case roomOptions.priv:
            case roomOptions.difficulty !== gameOptions[field.DIFFICULTY]:
            case roomOptions.powerups   !== gameOptions[field.POWERUPS]:
            case roomOptions.xss        !== gameOptions[field.XSS]:
            case roomOptions.maxPlayers   > gameOptions[field.MAX_PLAYERS]:
                return false;
            default:
                return true;
        }
    }

};