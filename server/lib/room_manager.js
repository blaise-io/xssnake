/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Room = require('./room.js');
var Validate = require('./validate.js');
var Util = require('../shared/util.js');
var map = require('../shared/map.js');
var events = require('../shared/events.js');

/**
 * @constructor
 */
function RoomManager(server) {
    this.server = server;
    this.rooms = {};
    this.bindEvents();
}

module.exports = RoomManager;

RoomManager.ROOM_KEY_LENGTH = 5;

RoomManager.prototype = {

    bindEvents: function() {
        this.server.pubsub.on(events.ROOM_STATUS, this._evRoomStatus.bind(this));
        this.server.pubsub.on(events.ROOM_JOIN, this._evJoinRoom.bind(this));
        this.server.pubsub.on(events.ROOM_MATCH, this._evMatchRoom.bind(this));
    },

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
     * @param {*} key
     * @return {boolean}
     */
    _validRoomKey: function(key) {
        var len = RoomManager.ROOM_KEY_LENGTH;
        return new Validate(key).assertStringOfLength(len, len).valid();
    },

    /**
     * @param {*} name
     * @return {string}
     */
    _cleanUsername: function(name) {
        if (new Validate(name).assertStringOfLength(2, 20).valid()) {
            return String(name);
        } else {
            return 'Idiot' + Util.randomStr(3);
        }
    },

    /**
     * @param {Array} data [roomKey, name]
     * @param {Client} client
     * @private
     */
    _evJoinRoom: function(data, client) {
        client.name = this._cleanUsername(data[1]);
        this._attemptJoinRoom(client, data[0]);
    },

    /**
     * @param {Object} preferences
     * @param {Client} client
     * @private
     */
    _evMatchRoom: function(preferences, client) {
        client.name = this._cleanUsername(preferences[map.FIELD.NAME]);
        this.getPreferredRoom(preferences).join(client);
    },

    /**
     * @param {string} key
     * @param {Client} client
     */
    _evRoomStatus: function(key, client) {
        var data = this._getRoomJoinData(key);
        client.emit(events.ROOM_STATUS, data);
    },

    /**
     * @param {Client} client
     * @param {string} key
     */
    _attemptJoinRoom: function(client, key) {
        var room, data;
        if (this._validRoomKey(key)) {
            data = this._getRoomJoinData(key);
            if (data[0]) {
                room = this.rooms[key];
                room.join(client); // Room can be joined
            } else {
                client.emit(events.ROOM_STATUS, data); // Nope
            }
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
        var room, id = Util.randomStr(RoomManager.ROOM_KEY_LENGTH);
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
        var rooms = this.rooms;
        for (var k in rooms) {
            if (rooms.hasOwnProperty(k)) {
                var room = rooms[k];
                if (this._isFilterMatch(gameOptions, room)) {
                    return room;
                }
            }
        }
        return null;
    },

    /**
     * @param {string} key
     * @return {Array}
     * @private
     */
    _getRoomJoinData: function(key) {
        var room, data = [0];
        if (!this._validRoomKey(key)) {
            data.push(map.ROOM.INVALID);
        } else {
            room = this.rooms[key];
            if (!room) {
                data.push(map.ROOM.NOT_FOUND);
            } else if (room.isFull()) {
                data.push(map.ROOM.FULL);
            } else if (room.round) {
                data.push(map.ROOM.IN_PROGRESS);
            } else {
                data = [1, room.options, room.names()];
            }
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
