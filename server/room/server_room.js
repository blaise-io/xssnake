'use strict';

var events = require('events');

/**
 * @param {xss.netcode.Server} server
 * @param {xss.room.ServerOptions} options
 * @param {string} key
 * @constructor
 */
xss.room.ServerRoom = function(server, options, key) {
    this.server = server;
    this.options = options;
    this.key = key;

    this.emitter = new events.EventEmitter();
    this.players = new xss.room.ServerPlayerRegistry();
    this.rounds  = new xss.room.ServerRoundSet(this.emitter, this.players, this.options);
    this.bindEvents();
};

xss.room.ServerRoom.prototype = {

    destruct: function() {
        this.emitter.removeAllListeners();
        this.players.destruct();
        this.rounds.destruct();
        this.server = null;
        this.players = null;
        this.rounds = null;
    },

    bindEvents: function() {
        this.emitter.on(xss.NC_CHAT_MESSAGE, this.ncChatMessage.bind(this));
        this.emitter.on(xss.SE_PLAYER_DISCONNECT, this.handlePlayerDisconnect.bind(this));
    },

    ncChatMessage: function(serializedMessage, player) {
        var sanitizer = new xss.util.Sanitizer(serializedMessage[0]);
        sanitizer.assertStringOfLength(1, 64);
        if (sanitizer.valid()) {
            // TODO Prevent spam.
            player.broadcast(xss.NC_CHAT_MESSAGE, [
                this.players.players.indexOf(player),
                sanitizer.getValueOr()
            ]);
        }
    },

    restartRounds: function() {
//        this.rounds.destruct();
//        this.rounds = new xss.room.RoundManager(this);
//        this.rounds.detectAutoStart();
//        this.emitState();
    },

    isAwaitingPlayers: function() {
        return !this.isFull() && !this.rounds.hasStarted();
    },

    /**
     * @return {Array.<string>}
     */
    serialize: function() {
        return [this.key];
    },

    /**
     * @param {xss.room.ServerPlayer} player
     */
    addPlayer: function(player) {
        this.players.add(player);
        player.room = this;
        this.players.emitPlayers();
    },

    detectAutostart: function() {
        this.rounds.detectAutostart(this.isFull());
    },

    emit: function(player) {
        player.emit(xss.NC_ROOM_SERIALIZE, this.serialize());
    },

    emitAll: function(player) {
        this.emit(player);
        this.options.emit(player);
        this.rounds.round.emit(player);
    },

    handlePlayerDisconnect: function(player) {
        // Remove immediately if rounds have not started.
        // [else: set player.connected to false]
        if (!this.rounds.hasStarted()) {
            this.players.remove(player);
        }
        this.players.emitPlayers();
        this.detectEmptyRoom();
    },

    detectEmptyRoom: function() {
        if (!this.players.filter({connected: true}).length) {
            this.server.roomManager.remove(this);
        }
    },

    /**
     * @return {boolean}
     */
    isFull: function() {
        return this.players.getTotal() === this.options.maxPlayers;
    }

};
