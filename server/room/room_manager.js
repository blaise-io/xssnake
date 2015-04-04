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
        emitter.on(xss.NC_ROOM_STATUS, this.emitRoomStatus.bind(this));
        emitter.on(xss.NC_ROOM_JOIN_KEY, this.autojoinRoom.bind(this));
        emitter.on(xss.NC_ROOM_JOIN_MATCHING, this.joinMatchingRoom.bind(this));
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
        room.destruct();
        for (var i = 0, m = this.rooms.length; i < m; i++) {
            if (room === this.rooms[i]) {
                this.rooms.splice(i, 1);
            }
        }
    },

    removeAllRooms: function() {
        for (var i = 0, m = this.rooms.length; i < m; i++) {
            this.rooms[i].destruct();
        }
        this.rooms.length = 0;
    },

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
     * @param {Array.<?>} dirtyKeyArr
     * @param {xss.room.ServerPlayer} player
     */
    autojoinRoom: function(dirtyKeyArr, player) {
        var room, key, status;
        key = this.getSanitizedRoomKey(dirtyKeyArr);
        status = this.getRoomStatus(key);

        if (status === xss.ROOM_JOINABLE) {
            room = this.getRoomByKey(key);
            room.addPlayer(player);
            player.emit(xss.NC_ROUND_SERIALIZE, room.rounds.round.serialize());
            room.detectAutostart();
        } else {
            player.emit(xss.NC_ROOM_JOIN_ERROR, [status]);
        }
    },

    /**
     * @param {Array.<?>} dirtySerializeOptions
     * @param {xss.room.ServerPlayer} player
     * @private
     */
    joinMatchingRoom: function(dirtySerializeOptions, player) {
        var options, room, emitDataArr;

        emitDataArr = new xss.util.Sanitizer(dirtySerializeOptions)
                                  .assertArray().getValueOr([]);
        options = new xss.room.ServerOptions(emitDataArr);

        room = this.matcher.getRoomMatching(options);
        room = room || this.createRoom(options);
        room.addPlayer(player);
        room.emitAll(player);
        room.detectAutostart();
    },

    getRoomByKey: function(key) {
        for (var i = 0, m = this.rooms.length; i < m; i++) {
            if (key === this.rooms[i].key) {
                return this.rooms[i];
            }
        }
        return null;
    },

    getSanitizedRoomKey: function(dirtyKeyArr) {
        var keySanitizer = new xss.util.Sanitizer(dirtyKeyArr[0]);
        keySanitizer.assertStringOfLength(xss.ROOM_KEY_LENGTH);
        return keySanitizer.getValueOr();
    },

    /**
     * @param {string} key
     * @return {number}
     */
    getRoomStatus: function(key) {
        var room;
        if (!key) {
            return xss.ROOM_INVALID_KEY;
        }
        room = this.getRoomByKey(key);
        if (!room) {
            return xss.ROOM_NOT_FOUND;
        } else if (room.isFull()) {
            return xss.ROOM_FULL;
        } else if (room.rounds.hasStarted()) {
            return xss.ROOM_IN_PROGRESS;
        }
        return xss.ROOM_JOINABLE;
    },

    /**
     * @param {Array.<?>} dirtyKeyArr
     * @param {xss.room.ServerPlayer} player
     */
    emitRoomStatus: function(dirtyKeyArr, player) {
        var room, key, status;
        key = this.getSanitizedRoomKey(dirtyKeyArr);
        status = this.getRoomStatus(key);

        if (status === xss.ROOM_JOINABLE) {
            room = this.getRoomByKey(key);
            player.emit(xss.NC_ROOM_SERIALIZE, room.serialize());
            player.emit(xss.NC_OPTIONS_SERIALIZE, room.options.serialize());
            player.emit(xss.NC_PLAYERS_SERIALIZE, room.players.serialize());
        } else {
            player.emit(xss.NC_ROOM_JOIN_ERROR, [status]);
        }
    }

};
