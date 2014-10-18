'use strict';

/**
 * @param {xss.netcode.Server} server
 * @constructor
 */
xss.room.RoomManager = function(server) {
    this.server = server;
    /** @type {Array.<xss.room.Room>} */
    this.rooms = [];
    this.matcher = new xss.room.Matcher(this.rooms);
    this.bindEvents();
};

xss.room.RoomManager.prototype = {

    destruct: function() {
        this.removeAllRooms();
        this.matcher.destruct();
        this.server.emitter.removeAllListeners([
            xss.EVENT_ROOM_STATUS,
            xss.EVENT_ROOM_JOIN_KEY,
            xss.EVENT_ROOM_JOIN_MATCHING
        ]);
    },

    bindEvents: function() {
        var emitter = this.server.emitter;

//        emitter.on(
//            xss.EVENT_ROOM_STATUS,
//            this.returnRoomStatus.bind(this)
//        );
//
//        emitter.on(
//            xss.EVENT_ROOM_JOIN_KEY,
//            this.joinRoomKey.bind(this)
//        );

        emitter.on(
            xss.EVENT_ROOM_JOIN_MATCHING,
            this.joinMatchingRoom.bind(this)
        );
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

//    /**
//     * @param {xss.netcode.Client} client
//     * @param {string} key
//     */
//    joinRoomByKey: function(client, key) {
//        var room, data;
//        if (this._validRoomKey(key)) {
//            data = this.getRoomData(key);
//            if (data[0]) { // Room can be joined
//                room = this.rooms[key];
//                room.addPlayer(client);
//            } else {
//                client.emit(xss.EVENT_ROOM_STATUS, data); // Nope
//            }
//        }
//    },

//    /**
//     * @param {Object.<string, number|boolean>} roomPreferences
//     * @return {xss.room.Room}
//     */
//    getOrCreateRoom: function(roomPreferences) {
//        var room = this._findRoom(roomPreferences);
//        if (!room) {
//            room = this.createRoom(roomPreferences);
//        }
//        return room;
//    },

    /**
     * @param {xss.room.ServerOptions} preferences
     * @return {xss.room.Room}
     */
    createRoom: function(preferences) {
        var room, id = xss.util.randomStr(xss.ROOM_KEY_LENGTH);
        room = new xss.room.Room(this.server, preferences, id);
        this.rooms.push(room);
        return room;
    },

//    /**
//     * @param {Object.<string, ?>} requestOptions
//     * @param {xss.room.Room} room
//     * @return {boolean}
//     */
//    roomPreferencesMatch: function(requestOptions, room) {
//        var options = room.options;
//        return (
//            !room.isFull() &&
//            !room.rounds.started &&
//            !options[xss.FIELD_PRIVATE] &&
//            !requestOptions[xss.FIELD_PRIVATE] &&
//            options[xss.FIELD_XSS] === requestOptions[xss.FIELD_XSS] &&
//            (requestOptions[xss.FIELD_QUICK_GAME] || (
//                options[xss.FIELD_LEVEL_SET] === requestOptions[xss.FIELD_LEVEL_SET] &&
//                options[xss.FIELD_POWERUPS] === requestOptions[xss.FIELD_POWERUPS] &&
//                options[xss.FIELD_MAX_PLAYERS] <= requestOptions[xss.FIELD_MAX_PLAYERS]
//            ))
//        );
//    },

//    /**
//     * @param {*} key
//     * @return {boolean}
//     */
//    _validRoomKey: function(key) {
//        var len = xss.ROOM_KEY_LENGTH;
//        return new xss.util.Validator(key).assertStringOfLength(len, len).valid();
//    },



//    /**
//     * @param {Array} data [roomKey, name]
//     * @param {xss.netcode.Client} client
//     * @private
//     */
//    joinRoomKey: function(data, client) {
//        if (new xss.util.Validator(data).assertArrayOfLength(2, 2).valid()) {
//            client.model.name = xss.util.clean.username(data[1]);
//            this.joinRoomByKey(client, data[0]);
//        }
//    },

    /**
     * @param {?} emitData
     * @param {xss.room.Player} player
     * @private
     */
    joinMatchingRoom: function(emitData, player) {
        var options, room, emitDataArr;

        emitDataArr = new xss.util.Validator(emitData).assertArray().value([]);
        options = new xss.room.ServerOptions(emitDataArr);

        room = this.matcher.getRoomMatching(options);
        room = room || this.createRoom(options);
        room.addPlayer(player);

        player.emit(xss.EVENT_ROOM_SERIALIZE, room.serialize());
        player.emit(xss.EVENT_ROOM_OPTIONS_SERIALIZE, room.options.serialize());
        player.emit(xss.EVENT_ROOM_PLAYERS_SERIALIZE, room.players.serialize());
    }

//    /**
//     * @param {string} key
//     * @param {xss.netcode.Client} client
//     */
//    returnRoomStatus: function(key, client) {
//        var data = this.getRoomData(key);
//        client.emit(xss.EVENT_ROOM_STATUS, data);
//    },

//    /**
//     * @param {Object.<string, number|boolean>} roomPreferences
//     * @return {xss.room.Room}
//     * @private
//     */
//    _findRoom: function(roomPreferences) {
//        var rooms = this.rooms;
//        for (var k in rooms) {
//            if (rooms.hasOwnProperty(k)) {
//                var room = rooms[k];
//                if (this.roomPreferencesMatch(roomPreferences, room)) {
//                    return room;
//                }
//            }
//        }
//        return null;
//    },
//
//    /**
//     * @param {string} key
//     * @return {Array}
//     * @private
//     */
//    getRoomData: function(key) {
//        var room, data = [0];
//        if (!this._validRoomKey(key)) {
//            data.push(xss.ROOM_INVALID);
//        } else {
//            room = this.rooms[key];
//            if (!room) {
//                data.push(xss.ROOM_NOT_FOUND);
//            } else if (room.isFull()) {
//                data.push(xss.ROOM_FULL);
//            } else if (room.rounds.started) {
//                data.push(xss.ROOM_IN_PROGRESS);
//            } else {
//                data = [1, room.options, room.names()];
//            }
//        }
//
//        return data;
//    }

};
