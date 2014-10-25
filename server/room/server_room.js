'use strict';

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

    this.players = new xss.room.ServerPlayerRegistry();
    this.rounds  = new xss.room.ServerRoundManager(this.players, this.options);
};

xss.room.ServerRoom.prototype = {

    destruct: function() {
        this.rounds.destruct();
        this.players.destruct();
        this.server = null;
        this.rounds = null;
    },

    restartRounds: function() {
//        this.rounds.destruct();
//        this.rounds = new xss.room.RoundManager(this);
//        this.rounds.detectAutoStart();
//        this.emitState();
    },

//    updateIndices: function() {
//        for (var i = 0, m = this.clients.length; i < m; i++) {
//            this.clients[i].model.index = i;
//        }
//    },

    isAwaitingPlayers: function() {
//      return !this.isFull() && !this.rounds.started;
        return !this.isFull();
    },

    /**
     * @returns {Array.<string>}
     */
    serialize: function() {
        return [this.key];

//        var rounds, clients, capacity, isprivate;
//
//        rounds = this.rounds;
//        clients = this.clients;
//        capacity = this.options.maxPlayers;
//        isprivate = this.options.isPrivate;
//
//        for (var i = 0, m = clients.length; i < m; i++) {
//            clients[i].emit(xss.NC_ROOM_SERIALIZE, [
//                i,
//                this.seed,
//                this.key,
//                this.names(),
//                capacity,
//                isprivate,
//                rounds.round.game.model.created,
//                rounds.levelIndex,
//                rounds.started,
//                rounds.score.points
//            ]);
//        }
    },

    /**
     * @param {xss.netcode.Client} client
     * @return {boolean}
     */
    isHost: function(client) {
        return (0 === client.model.index);
    },

    /**
     * @param {xss.room.ServerPlayer} player
     */
    addPlayer: function(player) {
        this.players.add(player);

        player.room = this;

        this.players.emitPlayers();

        player.emit(xss.NC_ROOM_SERIALIZE, this.serialize());
        player.emit(xss.NC_ROOM_OPTIONS_SERIALIZE, this.options.serialize());
        player.emit(xss.NC_ROOM_ROUND_SERIALIZE, this.rounds.round.serialize());

//        this.rounds.detectAutoStart();

    },

    removePlayer: function(player) {
        // Remove immediately if rounds have not started.
        if (!this.rounds.started) {
            this.players.remove(player);
        }

        // Notify users that someone disconnected.
        this.players.emitPlayers();

        // @todo Clean up during next round.
    },

//    /**
//     * @param {xss.netcode.Client} client
//     */
//    removeClient: function(client) {
//        this.emit(xss.NC_CHAT_NOTICE, [
//            xss.NOTICE_DISCONNECT, client.model.index
//        ]);
//
//        this.rounds.removeClient(client);
//        this.clients.splice(client.model.index, 1);
//
//        this.updateIndices();
//        this.emitState();
//
//        if (!this.clients.length) {
//            this.server.roomManager.remove(this);
//        }
//    },

    /**
     * @return {boolean}
     */
    isFull: function() {
        return this.players.length === this.options.maxPlayers;
    }

//    /**
//     * @return {Array.<string>}
//     * @todo Move to PlayerRegistry
//     */
//    names: function() {
//        var names = [];
//        for (var i = 0, m = this.clients.length; i < m; i++) {
//            names.push(this.clients[i].model.name);
//        }
//        return names;
//    }

};
