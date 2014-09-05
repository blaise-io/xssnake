'use strict';

/**
 * @param {xss.Server} server
 * @constructor
 */
xss.room.RoomManager = function(server) {
    this.server = server;
    this.bindEvents();
    /** @type {Object.<string,xss.room.Room>} */
    this.rooms = {};
};

xss.room.RoomManager.prototype = {

    destruct: function() {
        this.removeAllRooms();
        this.server.emitter.removeAllListeners([
            xss.EVENT_ROOM_STATUS,
            xss.EVENT_ROOM_JOIN,
            xss.EVENT_ROOM_MATCH
        ]);
    },

    bindEvents: function() {
        var emitter = this.server.emitter;
        emitter.on(xss.EVENT_ROOM_STATUS, this._evRoomStatus.bind(this));
        emitter.on(xss.EVENT_ROOM_JOIN, this._evJoinRoom.bind(this));
        emitter.on(xss.EVENT_ROOM_MATCH, this._evMatchRoom.bind(this));
    },

    /**
     * @param {string} key
     * @return {xss.room.Room}
     */
    room: function(key) {
        return this.rooms[key];
    },

    /**
     * @param {xss.room.Room} room
     */
    remove: function(room) {
        delete this.rooms[room.key];
        room.destruct();
    },

    removeAllRooms: function() {
        for (var k in this.rooms) {
            if (this.rooms.hasOwnProperty(k)) {
                this.remove(this.rooms[k]);
            }
        }
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
     * @return {xss.room.Room}
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
     * @return {xss.room.Room}
     */
    createRoom: function(gameOptions) {
        var room, id = xss.util.randomStr(xss.ROOM_KEY_LENGTH);
        room = new xss.room.Room(this.server, id, gameOptions);
        this.rooms[room.key] = room;
        return room;
    },

    /**
     * @param {Object.<string, ?>} requestOptions
     * @param {xss.room.Room} room
     * @return {boolean}
     */
    gameOptionsMatch: function(requestOptions, room) {
        var options = room.options;
        return (
            !room.isFull() &&
            !room.rounds.started &&
            !options[xss.FIELD_PRIVATE] &&
            !requestOptions[xss.FIELD_PRIVATE] &&
            options[xss.FIELD_XSS] === requestOptions[xss.FIELD_XSS] &&
            (requestOptions[xss.FIELD_QUICK_GAME] || (
                options[xss.FIELD_LEVEL_SET] === requestOptions[xss.FIELD_LEVEL_SET] &&
                options[xss.FIELD_POWERUPS] === requestOptions[xss.FIELD_POWERUPS] &&
                options[xss.FIELD_MAX_PLAYERS] <= requestOptions[xss.FIELD_MAX_PLAYERS]
            ))
        );
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
            client.model.name = this._cleanUsername(data[1]);
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
            client.model.name = this._cleanUsername(preferences[xss.FIELD_NAME]);
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
     * @return {xss.room.Room}
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
