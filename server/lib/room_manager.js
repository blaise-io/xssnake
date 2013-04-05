/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Room = require('./room.js');
var Util = require('../shared/util.js');
var map = require('../shared/map.js');
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
     * @param {string} key
     * @return {Room}
     */
    room: function(key) {
        return this.rooms[key];
    },

    /**
     * @param {Room} room
     */
    remove: function(room) {
        delete this.rooms[room.key];
        room.destruct();
    },

    /**
     * @param {Client} client
     * @param {string} key
     */
    handleAutoJoin: function(client, key) {
        var error, data, room = this.rooms[key];

        if (!room) {
            error = map.ROOM.NOT_FOUND;
        } else if (room.isFull()) {
            error = map.ROOM.FULL;
        } else if (room.inProgress) {
            error = map.ROOM.IN_PROGRESS;
        }

        if (error) {
            client.emit(events.CLIENT_AUTOJOIN_ERR, error);
        } else {
            data = [room.id, room.names, room.options];
            client.emit(events.CLIENT_AUTOJOIN_SUCC, data);
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
        var field = map.FIELD, roomOptions = room.options;
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