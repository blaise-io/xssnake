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
    emitRoomStatus: function(client, key) {
        var room, data;
        room = this.rooms[key];
        data = this._getRoomJoinData(room);
        client.emit(events.CLIENT_ROOM_STATUS, data);
    },

    /**
     * @param {Client} client
     * @param {string} key
     */
    attemptJoinRoom: function(client, key) {
        var room, data;
        room = this.rooms[key];
        data = this._getRoomJoinData(room);

        if (data[0]) {
            room.join(client); // Room can be joined
        } else {
            client.emit(events.CLIENT_ROOM_STATUS, data); // Nope
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
     * @param {Room|undefined} room
     * @return {Array}
     * @private
     */
    _getRoomJoinData: function(room) {
        var data = [0];

        if (!room) {
            data.push(map.ROOM.NOT_FOUND);
        } else if (room.isFull()) {
            data.push(map.ROOM.FULL);
        } else if (room.round) {
            data.push(map.ROOM.IN_PROGRESS);
        } else {
            data = [1, room.options, room.names()];
        }

        return data;
    },

    /**
     * @param {Object.<string, number|boolean>} reqOptions
     * @param {Room} room
     * @return {boolean}
     * @private
     */
    _isFilterMatch: function(reqOptions, room) {
        var field = map.FIELD, options = room.options;
        switch (true) {
            case room.isFull():
            case !!room.round:
            case options[field.PRIVATE]:
            case options[field.DIFFICULTY] !== reqOptions[field.DIFFICULTY]:
            case options[field.POWERUPS]   !== reqOptions[field.POWERUPS]:
            case options[field.XSS]        !== reqOptions[field.XSS]:
            case options[field.MAX_PLAYERS]  > reqOptions[field.MAX_PLAYERS]:
                return false;
            default:
                return true;
        }
    }

};