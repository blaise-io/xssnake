/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Game = require('./game.js');
var RoundManager = require('./round_manager.js');
var Validate = require('./validate.js');
var CONST = require('../shared/const.js');

/**
 * @param {Server} server
 * @param {string} key
 * @param {Object} options
 * @constructor
 */
function Room(server, key, options) {
    this.server = server;

    this.key = key;
    this.clients = [];

    this.options = this.cleanOptions(options);
    this.rounds = new RoundManager(this);

    this._emitBuffer = [];
}

module.exports = Room;

Room.prototype = {

    destruct: function() {
        this.clients = [];
        this.rounds.destruct();
        this.server = null;
        this.rounds = null;
    },

    updateIndices: function() {
        for (var i = 0, m = this.clients.length; i < m; i++) {
            this.clients[i].index = i;
        }
    },

    emitState: function() {
        var capacity = this.options[CONST.FIELD_MAX_PLAYERS];
        for (var i = 0, m = this.clients.length; i < m; i++) {
            var data = [
                i,
                capacity,
                this.rounds.started,
                this.key,
                this.rounds.level,
                this.names(),
                this.rounds.score.points
            ];
            this.clients[i].emit(CONST.EVENT_ROOM_INDEX, data);
        }
    },

    requestXSS: function(winner) {
        winner.emit(CONST.EVENT_ROOM_XSS);
    },

    /**
     * @param {Client} client
     * @return {boolean}
     */
    isHost: function(client) {
        return (0 === client.index);
    },

    /**
     * @param {Object} options
     * @return {Object}
     */
    cleanOptions: function(options) {
        var clean = {};

        clean[CONST.FIELD_MAX_PLAYERS] = new Validate(options[CONST.FIELD_MAX_PLAYERS])
            .assertRange(1, CONST.ROOM_CAPACITY)
            .value(CONST.ROOM_CAPACITY);

        clean[CONST.FIELD_DIFFICULTY] = new Validate(options[CONST.FIELD_DIFFICULTY])
            .assertInArray([
                CONST.FIELD_VALUE_EASY,
                CONST.FIELD_VALUE_MEDIUM,
                CONST.FIELD_VALUE_HARD])
            .value(CONST.FIELD_VALUE_MEDIUM);

        clean[CONST.FIELD_POWERUPS] = new Validate(options[CONST.FIELD_POWERUPS])
            .assertType('boolean')
            .value(true);

        clean[CONST.FIELD_PRIVATE] = new Validate(options[CONST.FIELD_PRIVATE])
            .assertType('boolean')
            .value(false);

        clean[CONST.FIELD_XSS] = new Validate(options[CONST.FIELD_XSS])
            .assertType('boolean')
            .value(false);

        return clean;
    },

    /**
     * @param {Client} client
     */
    addClient: function(client) {
        client.room = this;
        client.index = this.clients.push(client) - 1;

        this.emitState();

        client.broadcast(CONST.EVENT_CHAT_NOTICE, [
            CONST.NOTICE_JOIN, client.index
        ]);

        this.rounds.addClient(client);
        this.rounds.detectStart();
    },

    /**
     * @param {Client} client
     */
    removeClient: function(client) {
        this.emit(CONST.EVENT_CHAT_NOTICE, [
            CONST.NOTICE_DISCONNECT, client.index
        ]);

        this.rounds.removeClient(client);

        this.clients.splice(client.index, 1);

        this.updateIndices();
        this.emitState();

        if (!this.clients) {
            this.server.roomManager.remove(this);
        }
    },

    /**
     * @return {boolean}
     */
    isFull: function() {
        return this.clients.length === this.options[CONST.FIELD_MAX_PLAYERS];
    },

    /**
     * @return {Array.<string>}
     */
    names: function() {
        var names = [];
        for (var i = 0, m = this.clients.length; i < m; i++) {
            names.push(this.clients[i].name);
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
     * @return {Room}
     */
    buffer: function(type, data) {
        this._emitBuffer.push([type, data]);
        return this;
    },

    /**
     * Send buffer
     * @return {Room}
     */
    flush: function() {
        this.emit(CONST.EVENT_COMBI, this._emitBuffer);
        this._emitBuffer = [];
        return this;
    }

};
