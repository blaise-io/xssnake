'use strict';

/**
 * @param {xss.Server} server
 * @param {string} key
 * @param {Object} options
 * @constructor
 */
xss.Room = function(server, key, options) {
    this.server  = server;
    this.key     = key;
    this.options = this.cleanOptions(options);

    /** type {Array.<xss.Client>} */
    this.clients = [];
    this.rounds  = new xss.RoundManager(this);

    /** type {Array.<Array>} */
    this._emitBuffer = [];
};

xss.Room.prototype = {

    destruct: function() {
        this.clients = [];
        this.rounds.destruct();
        this.server = null;
        this.rounds = null;
    },

    restartRounds: function() {
        this.rounds.destruct();
        this.rounds = new xss.RoundManager(this);
        this.rounds.detectAutoStart();
        this.emitState();
    },

    updateIndices: function() {
        for (var i = 0, m = this.clients.length; i < m; i++) {
            this.clients[i].model.index = i;
        }
    },

    emitState: function() {
        var rounds, clients, capacity;

        rounds = this.rounds;
        clients = this.clients;
        capacity = this.options[xss.FIELD_MAX_PLAYERS];

        for (var i = 0, m = clients.length; i < m; i++) {
            clients[i].emit(xss.EVENT_ROOM_SERIALIZE, [
                i,
                this.key,
                this.names(),
                capacity,
                rounds.round.game.model.created,
                rounds.levelIndex,
                rounds.started,
                rounds.score.points
            ]);
        }
    },

    /**
     * @param {xss.Client} client
     * @return {boolean}
     */
    isHost: function(client) {
        return (0 === client.model.index);
    },

    /**
     * @param {Object} options
     * @return {Object}
     */
    cleanOptions: function(options) {
        var clean = {};

        clean[xss.FIELD_MAX_PLAYERS] = new xss.Validate(options[xss.FIELD_MAX_PLAYERS])
            .assertRange(1, xss.ROOM_CAPACITY)
            .value(xss.ROOM_CAPACITY);

        clean[xss.FIELD_DIFFICULTY] = new xss.Validate(options[xss.FIELD_DIFFICULTY])
            .assertInArray([
                xss.FIELD_VALUE_EASY,
                xss.FIELD_VALUE_MEDIUM,
                xss.FIELD_VALUE_HARD])
            .value(xss.FIELD_VALUE_MEDIUM);

        clean[xss.FIELD_POWERUPS] = new xss.Validate(options[xss.FIELD_POWERUPS])
            .assertType('boolean')
            .value(true);

        clean[xss.FIELD_PRIVATE] = new xss.Validate(options[xss.FIELD_PRIVATE])
            .assertType('boolean')
            .value(false);

        clean[xss.FIELD_XSS] = new xss.Validate(options[xss.FIELD_XSS])
            .assertType('boolean')
            .value(false);

        return clean;
    },

    /**
     * @param {xss.Client} client
     */
    addClient: function(client) {
        client.room = this;
        client.model.index = this.clients.push(client) - 1;

        this.emitState();

        client.broadcast(xss.EVENT_CHAT_NOTICE, [
            xss.NOTICE_JOIN, client.model.index
        ]);

        this.rounds.addClient(client);
        this.rounds.detectAutoStart();
    },

    /**
     * @param {xss.Client} client
     */
    removeClient: function(client) {
        this.emit(xss.EVENT_CHAT_NOTICE, [
            xss.NOTICE_DISCONNECT, client.model.index
        ]);

        this.rounds.removeClient(client);
        this.clients.splice(client.model.index, 1);

        this.updateIndices();
        this.emitState();

        if (!this.clients.length) {
            this.server.roomManager.remove(this);
        }
    },

    /**
     * @return {boolean}
     */
    isFull: function() {
        return this.clients.length === this.options[xss.FIELD_MAX_PLAYERS];
    },

    /**
     * @return {Array.<string>}
     */
    names: function() {
        var names = [];
        for (var i = 0, m = this.clients.length; i < m; i++) {
            names.push(this.clients[i].model.name);
        }
        return names;
    },

    /**
     * Send data to everyone in the room.
     * @param {string} name
     * @param {*=} data
     */
    emit: function(name, data) {
        for (var i = 0, m = this.clients.length; i < m; i++) {
            this.clients[i].emit(name, data);
        }
    },

    /**
     * Buffer events to be sent later using flush()
     * @param {string} type
     * @param {*} data
     * @return {xss.Room}
     */
    buffer: function(type, data) {
        this._emitBuffer.push([type, data]);
        return this;
    },

    /**
     * Send buffer
     * @return {xss.Room}
     */
    flush: function() {
        if (this._emitBuffer.length > 1) {
            this.emit(xss.EVENT_COMBI, this._emitBuffer);
        } else if (this._emitBuffer.length) {
            this.emit(this._emitBuffer[0][0], this._emitBuffer[0][1]);
        }
        this._emitBuffer = [];
        return this;
    }

};
