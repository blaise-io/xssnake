/*jshint globalstrict:true, node:true, sub:true*/
'use strict';

var Room = require('./room.js');
var Validate = require('./validate.js');
var Util = require('../shared/util.js');
var CONST = require('../shared/const.js');

/**
 * @constructor
 */
function RoomManager(server) {
    this.server = server;
    this.bindEvents();

    /** @type {Object.<string,Room>} */
    this.rooms = {};
}

module.exports = RoomManager;

RoomManager.prototype = {

    bindEvents: function() {
        var pubsub = this.server.pubsub;
        pubsub.on(CONST.EVENT_ROOM_STATUS, this._evRoomStatus.bind(this));
        pubsub.on(CONST.EVENT_ROOM_JOIN, this._evJoinRoom.bind(this));
        pubsub.on(CONST.EVENT_ROOM_MATCH, this._evMatchRoom.bind(this));
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
     * @param {Client} client
     * @param {string} key
     */
    joinRoomByKey: function(client, key) {
        var room, data;
        if (this._validRoomKey(key)) {
            data = this.getRoomData(key);
            if (data[0]) { // Room can be joined
                room = this.rooms[key];
                room.addClient(client);
            } else {
                client.emit(CONST.EVENT_ROOM_STATUS, data); // Nope
            }
        }
    },

    /**
     * @param {Object.<string, number|boolean>} gameOptions
     * @return {Room}
     */
    getOrCreateRoom: function(gameOptions) {
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
        var room, id = Util.randomStr(CONST.ROOM_KEY_LENGTH);
        room = new Room(this.server, id, gameOptions);
        this.rooms[room.key] = room;
        return room;
    },

    /**
     * @param {Object.<string, number|boolean>} reqOptions
     * @param {Room} room
     * @return {boolean}
     */
    gameOptionsMatch: function(reqOptions, room) {
        var options = room.options;
        switch (true) {
            case room.isFull():
            case !!room.rounds.started:
            case options[CONST.FIELD_PRIVATE]:
            case reqOptions[CONST.FIELD_PRIVATE]:
            case options[CONST.FIELD_DIFFICULTY] !== reqOptions[CONST.FIELD_DIFFICULTY]:
            case options[CONST.FIELD_POWERUPS]   !== reqOptions[CONST.FIELD_POWERUPS]:
            case options[CONST.FIELD_XSS]        !== reqOptions[CONST.FIELD_XSS]:
            case options[CONST.FIELD_MAX_PLAYERS]  > reqOptions[CONST.FIELD_MAX_PLAYERS]:
                return false;
            default:
                return true;
        }
    },

    /**
     * @param {*} key
     * @return {boolean}
     */
    _validRoomKey: function(key) {
        var len = CONST.ROOM_KEY_LENGTH;
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
        if (new Validate(data).assertArrayOfLength(2, 2).valid()) {
            client.name = this._cleanUsername(data[1]);
            this.joinRoomByKey(client, data[0]);
        }
    },

    /**
     * @param {Object} preferences
     * @param {Client} client
     * @private
     */
    _evMatchRoom: function(preferences, client) {
        var room;
        if (preferences) {
            client.name = this._cleanUsername(preferences[CONST.FIELD_NAME]);
            room = this.getOrCreateRoom(preferences);
            room.addClient(client);
        }
    },

    /**
     * @param {string} key
     * @param {Client} client
     */
    _evRoomStatus: function(key, client) {
        var data = this.getRoomData(key);
        client.emit(CONST.EVENT_ROOM_STATUS, data);
    },

    /**
     * @param {Object.<string, number|boolean>} gameOptions
     * @return {Room}
     * @private
     */
    _findRoom: function(gameOptions) {
        var rooms = this.rooms;
        for (var k in rooms) {
            if (rooms.hasOwnProperty(k)) {
                var room = rooms[k];
                if (this.gameOptionsMatch(gameOptions, room)) {
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
    getRoomData: function(key) {
        var room, data = [0];
        if (!this._validRoomKey(key)) {
            data.push(CONST.ROOM_INVALID);
        } else {
            room = this.rooms[key];
            if (!room) {
                data.push(CONST.ROOM_NOT_FOUND);
            } else if (room.isFull()) {
                data.push(CONST.ROOM_FULL);
            } else if (room.rounds.started) {
                data.push(CONST.ROOM_IN_PROGRESS);
            } else {
                data = [1, room.options, room.names()];
            }
        }

        return data;
    }

};
