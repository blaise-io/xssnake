/**
 * @param {netcode.Server} server
 * @constructor
 */
export class ServerRoomManager {
    constructor(ServerRoomManager) {
    this.server = server;
    /** @type {Array.<room.ServerRoom>} */
    this.rooms = [];
    this.matcher = new Matcher(this.rooms);
    this.bindEvents();
};



    destruct() {
        this.removeAllRooms();
        this.matcher.destruct();
        this.server.emitter.removeAllListeners([
            NC_ROOM_STATUS,
            NC_ROOM_JOIN_KEY,
            NC_ROOM_JOIN_MATCHING
        ]);
    },

    bindEvents() {
        var emitter = this.server.emitter;
        emitter.on(NC_ROOM_STATUS, this.emitRoomStatus.bind(this));
        emitter.on(NC_ROOM_JOIN_KEY, this.autojoinRoom.bind(this));
        emitter.on(NC_ROOM_JOIN_MATCHING, this.joinMatchingRoom.bind(this));
    },

    /**
     * @param {string} key
     * @return {room.ServerRoom}
     */
    room(key) {
        return this.rooms[key];
    },

    /**
     * @param {room.ServerRoom} room
     */
    remove(room) {
        room.destruct();
        for (var i = 0, m = this.rooms.length; i < m; i++) {
            if (room === this.rooms[i]) {
                this.rooms.splice(i, 1);
            }
        }
    },

    removeAllRooms() {
        for (var i = 0, m = this.rooms.length; i < m; i++) {
            this.rooms[i].destruct();
        }
        this.rooms.length = 0;
    },

    /**
     * @param {room.ServerOptions} preferences
     * @return {room.ServerRoom}
     */
    createRoom(preferences) {
        var room, id = randomStr(ROOM_KEY_LENGTH);
        room = new ServerRoom(this.server, preferences, id);
        this.rooms.push(room);
        return room;
    },

    /**
     * @param {Array.<?>} dirtyKeyArr
     * @param {room.ServerPlayer} player
     */
    autojoinRoom(dirtyKeyArr, player) {
        var room, key, status;
        key = this.getSanitizedRoomKey(dirtyKeyArr);
        status = this.getRoomStatus(key);

        if (status === ROOM_JOINABLE) {
            room = this.getRoomByKey(key);
            room.addPlayer(player);
            player.emit(NC_ROUND_SERIALIZE, room.rounds.round.serialize());
            room.detectAutostart();
        } else {
            player.emit(NC_ROOM_JOIN_ERROR, [status]);
        }
    },

    /**
     * @param {Array.<?>} dirtySerializeOptions
     * @param {room.ServerPlayer} player
     * @private
     */
    joinMatchingRoom(dirtySerializeOptions, player) {
        var options, room, emitDataArr;

        emitDataArr = new Sanitizer(dirtySerializeOptions)
                                  .assertArray().getValueOr([]);
        options = new ServerOptions(emitDataArr);

        room = this.matcher.getRoomMatching(options);
        room = room || this.createRoom(options);
        room.addPlayer(player);
        room.emitAll(player);
        room.detectAutostart();
    },

    getRoomByKey(key) {
        for (var i = 0, m = this.rooms.length; i < m; i++) {
            if (key === this.rooms[i].key) {
                return this.rooms[i];
            }
        }
        return null;
    },

    getSanitizedRoomKey(dirtyKeyArr) {
        var keySanitizer = new Sanitizer(dirtyKeyArr[0]);
        keySanitizer.assertStringOfLength(ROOM_KEY_LENGTH);
        return keySanitizer.getValueOr();
    },

    /**
     * @param {string} key
     * @return {number}
     */
    getRoomStatus(key) {
        var room;
        if (!key) {
            return ROOM_INVALID_KEY;
        }
        room = this.getRoomByKey(key);
        if (!room) {
            return ROOM_NOT_FOUND;
        } else if (room.isFull()) {
            return ROOM_FULL;
        } else if (room.rounds.hasStarted()) {
            return ROOM_IN_PROGRESS;
        }
        return ROOM_JOINABLE;
    },

    /**
     * @param {Array.<?>} dirtyKeyArr
     * @param {room.ServerPlayer} player
     */
    emitRoomStatus(dirtyKeyArr, player) {
        var room, key, status;
        key = this.getSanitizedRoomKey(dirtyKeyArr);
        status = this.getRoomStatus(key);

        if (status === ROOM_JOINABLE) {
            room = this.getRoomByKey(key);
            player.emit(NC_ROOM_SERIALIZE, room.serialize());
            player.emit(NC_OPTIONS_SERIALIZE, room.options.serialize());
            player.emit(NC_PLAYERS_SERIALIZE, room.players.serialize());
        } else {
            player.emit(NC_ROOM_JOIN_ERROR, [status]);
        }
    }

};
