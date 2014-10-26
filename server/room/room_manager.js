'use strict';

/**
 * @param {xss.netcode.Server} server
 * @constructor
 */
xss.room.ServerRoomManager = function(server) {
    this.server = server;
    /** @type {Array.<xss.room.ServerRoom>} */
    this.rooms = [];
    this.matcher = new xss.room.Matcher(this.rooms);
    this.bindEvents();
};

xss.room.ServerRoomManager.prototype = {

    destruct: function() {
        this.removeAllRooms();
        this.matcher.destruct();
        this.server.emitter.removeAllListeners([
            xss.NC_ROOM_STATUS,
            xss.NC_ROOM_JOIN_KEY,
            xss.NC_ROOM_JOIN_MATCHING
        ]);
    },

    bindEvents: function() {
        var emitter = this.server.emitter;

        emitter.on(
            xss.NC_ROOM_STATUS,
            this.emitRoomStatus.bind(this)
        );
//
//        emitter.on(
//            xss.NC_ROOM_JOIN_KEY,
//            this.joinRoomKey.bind(this)
//        );

        emitter.on(
            xss.NC_ROOM_JOIN_MATCHING,
            this.findAndJoinMatchingRoom.bind(this)
        );
    },

    /**
     * @param {string} key
     * @return {xss.room.ServerRoom}
     */
    room: function(key) {
        return this.rooms[key];
    },

    /**
     * @param {xss.room.ServerRoom} room
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
//                client.emit(xss.NC_ROOM_STATUS, data); // Nope
//            }
//        }
//    },

    /**
     * @param {xss.room.ServerOptions} preferences
     * @return {xss.room.ServerRoom}
     */
    createRoom: function(preferences) {
        var room, id = xss.util.randomStr(xss.ROOM_KEY_LENGTH);
        room = new xss.room.ServerRoom(this.server, preferences, id);
        this.rooms.push(room);
        return room;
    },

    /**
     * @param {?} dirtySerializeOptions
     * @param {xss.room.ServerPlayer} player
     * @private
     */
    findAndJoinMatchingRoom: function(dirtySerializeOptions, player) {
        var options, room, emitDataArr;

        emitDataArr = new xss.util.Sanitizer(dirtySerializeOptions)
                                  .assertArray().getValueOr([]);
        options = new xss.room.ServerOptions(emitDataArr);

        room = this.matcher.getRoomMatching(options);
        room = room || this.createRoom(options);
        room.addPlayer(player);
    },

    getRoomByKey: function(key) {
        for (var i = 0, m = this.rooms.length; i < m; i++) {
            if (key === this.rooms[i].key) {
                return this.rooms[i];
            }
        }
        return null;
    },

    /**
     * @param {string} dirtyKeyArr
     * @param {xss.room.ServerPlayer} player
     */
    emitRoomStatus: function(dirtyKeyArr, player) {
        var key, keySanitizer, room;

        keySanitizer = new xss.util.Sanitizer(dirtyKeyArr[0]);
        keySanitizer.assertStringOfLength(xss.ROOM_KEY_LENGTH);
        key = keySanitizer.getValueOr();

        if (!key) {
            player.emit(xss.NC_ROOM_JOIN_ERROR, [xss.ROOM_INVALID]);
        } else {
            room = this.getRoomByKey(key);
            if (!room) {
                player.emit(xss.NC_ROOM_JOIN_ERROR, [xss.ROOM_NOT_FOUND]);
            } else if (room.isFull()) {
                player.emit(xss.NC_ROOM_JOIN_ERROR, [xss.ROOM_FULL]);
            } else if (room.rounds.started) {
                player.emit(xss.NC_ROOM_JOIN_ERROR, [xss.ROOM_IN_PROGRESS]);
            } else {
                player.emit(xss.NC_ROOM_SERIALIZE, room.serialize());
                player.emit(xss.NC_ROOM_OPTIONS_SERIALIZE, room.options.serialize());
                player.emit(xss.NC_ROOM_PLAYERS_SERIALIZE, room.players.serialize());
            }
        }
    }

};
