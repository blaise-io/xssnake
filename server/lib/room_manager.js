'use strict';

/**
 * @constructor
 */
xss.RoomManager = function(server) {
    this.server = server;
    this.bindEvents();

    /** @type {Object.<string,xss.Room>} */
    this.rooms = {};
};

xss.RoomManager.prototype = {

    bindEvents: function() {
        var pubsub = this.server.pubsub;
        pubsub.on(xss.EVENT_ROOM_STATUS, this._evRoomStatus.bind(this));
        pubsub.on(xss.EVENT_ROOM_JOIN, this._evJoinRoom.bind(this));
        pubsub.on(xss.EVENT_ROOM_MATCH, this._evMatchRoom.bind(this));
    },

    /**
     * @param {string} key
     * @return {xss.Room}
     */
    room: function(key) {
        return this.rooms[key];
    },

    /**
     * @param {xss.Room} room
     */
    remove: function(room) {
        delete this.rooms[room.key];
        room.destruct();
    },

    /**
     * @param {xss.Client} client
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
                client.emit(xss.EVENT_ROOM_STATUS, data); // Nope
            }
        }
    },

    /**
     * @param {Object.<string, number|boolean>} gameOptions
     * @return {xss.Room}
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
     * @return {xss.Room}
     */
    createRoom: function(gameOptions) {
        var room, id = xss.util.randomStr(xss.ROOM_KEY_LENGTH);
        room = new xss.Room(this.server, id, gameOptions);
        this.rooms[room.key] = room;
        return room;
    },

    /**
     * @param {Object.<string, number|boolean>} reqOptions
     * @param {xss.Room} room
     * @return {boolean}
     */
    gameOptionsMatch: function(reqOptions, room) {
        var options = room.options;
        switch (true) {
            case room.isFull():
            case !!room.rounds.started:
            case options[xss.FIELD_PRIVATE]:
            case reqOptions[xss.FIELD_PRIVATE]:
            case options[xss.FIELD_DIFFICULTY] !== reqOptions[xss.FIELD_DIFFICULTY]:
            case options[xss.FIELD_POWERUPS]   !== reqOptions[xss.FIELD_POWERUPS]:
            case options[xss.FIELD_xss]        !== reqOptions[xss.FIELD_xss]:
            case options[xss.FIELD_MAX_PLAYERS]  > reqOptions[xss.FIELD_MAX_PLAYERS]:
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
        var len = xss.ROOM_KEY_LENGTH;
        return new xss.Validate(key).assertStringOfLength(len, len).valid();
    },

    /**
     * @param {*} name
     * @return {string}
     */
    _cleanUsername: function(name) {
        if (new xss.Validate(name).assertStringOfLength(2, 20).valid()) {
            return String(name);
        } else {
            return 'Idiot' + xss.util.randomStr(3);
        }
    },

    /**
     * @param {Array} data [roomKey, name]
     * @param {xss.Client} client
     * @private
     */
    _evJoinRoom: function(data, client) {
        if (new xss.Validate(data).assertArrayOfLength(2, 2).valid()) {
            client.name = this._cleanUsername(data[1]);
            this.joinRoomByKey(client, data[0]);
        }
    },

    /**
     * @param {Object} preferences
     * @param {xss.Client} client
     * @private
     */
    _evMatchRoom: function(preferences, client) {
        var room;
        if (preferences) {
            client.name = this._cleanUsername(preferences[xss.FIELD_NAME]);
            room = this.getOrCreateRoom(preferences);
            room.addClient(client);
        }
    },

    /**
     * @param {string} key
     * @param {xss.Client} client
     */
    _evRoomStatus: function(key, client) {
        var data = this.getRoomData(key);
        client.emit(xss.EVENT_ROOM_STATUS, data);
    },

    /**
     * @param {Object.<string, number|boolean>} gameOptions
     * @return {xss.Room}
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
            data.push(xss.ROOM_INVALID);
        } else {
            room = this.rooms[key];
            if (!room) {
                data.push(xss.ROOM_NOT_FOUND);
            } else if (room.isFull()) {
                data.push(xss.ROOM_FULL);
            } else if (room.rounds.started) {
                data.push(xss.ROOM_IN_PROGRESS);
            } else {
                data = [1, room.options, room.names()];
            }
        }

        return data;
    }

};
