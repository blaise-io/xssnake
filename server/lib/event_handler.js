/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var events = require('../shared/events.js');
var map = require('../shared/map.js');

/**
 * @param {Server} server
 * @param {Client} client
 * @param {Object} socket
 * @constructor
 */
function EventHandler(server, client, socket) {
    this.server = server;
    this.client = client;
    this.socket = socket;

    this._pingInterval = setInterval(this._ping.bind(this), 5000);

    client.emit(events.CLIENT_CONNECT, client.id);

    socket.on('disconnect', this._disconnect.bind(this));
    socket.on(events.SERVER_ROOM_STATUS, this._roomStatus.bind(this));
    socket.on(events.SERVER_ROOM_JOIN, this._joinRoom.bind(this));
    socket.on(events.SERVER_ROOM_MATCH, this._matchRoom.bind(this));
    socket.on(events.SERVER_ROOM_START, this._forceStart.bind(this));
    socket.on(events.SERVER_CHAT_MESSAGE, this._chat.bind(this));
    socket.on(events.SERVER_SNAKE_UPDATE, this._snakeUpdate.bind(this));
    socket.on(events.SERVER_GAME_STATE, this._gameState.bind(this));
    socket.on(events.SERVER_PING, this._pong.bind(this));
}

module.exports = EventHandler;

EventHandler.prototype = {

    destruct: function() {
        // Other event listeners will remove themselves.
        clearInterval(this._pingInterval);
        this.server = null;
        this.client = null;
        this.socket = null;
    },

    /**
     * @private
     */
    _ping: function() {
        this.client.emit(events.CLIENT_PING, +new Date());
    },

    /**
     * @param {number} sendTime
     * @private
     */
    _pong: function(sendTime) {
        var roundtrip = (+new Date()) - sendTime;
        this.client.latency = Math.round(roundtrip / 2);
    },

    /**
     * @private
     */
    _disconnect: function() {
        var room, client = this.client;
        room = this.server.roomManager.rooms[client.roomKey];
        if (room) {
            // If client is in a room, we cannot clean up immediately
            // because we need data to remove the client from the room
            // gracefully.
            room.disconnect(client);
        } else {
            this.server.removeClient(client);
        }
    },

    /**
     * @param room
     * @private
     */
    _roomStatus: function(room) {
        this.server.roomManager.emitRoomStatus(this.client, room);
    },

    /**
     * @param {Object} data
     * @private
     */
    _joinRoom: function(data) {
        var client = this.client;
        client.name = data[1];
        this.server.roomManager.attemptJoinRoom(client, data[0]);
    },

    /**
     * @param {Object} gameOptions
     * @private
     */
    _matchRoom: function(gameOptions) {
        var room, client = this.client;
        client.name = gameOptions[map.FIELD.NAME];
        room = this.server.roomManager.getPreferredRoom(gameOptions);
        room.join(client);
    },

    /**
     * @private
     */
    _forceStart: function() {
        var room = this._clientRoom(this.client);
        if (room.isHost(this.client) && !room.round && room.clients.length > 1) {
            room.game.countdown();
        }
    },

    /**
     * @param {string} message
     * @private
     */
    _chat: function(message) {
        var room, data, index;
        room = this._clientRoom(this.client);
        if (room) {
            index = room.clients.indexOf(this.client);
            data = [index, message.substr(0, 30)];
            room.broadcast(events.CLIENT_CHAT_MESSAGE, data, this.client);
            room.emit(events.CLIENT_SNAKE_ACTION, [index, 'Blah']);
        }
    },

    /**
     * @param data [<Array>,<number>] 0: parts, 1: direction
     */
    _snakeUpdate: function(data) {
        var game = this._clientGame(this.client);
        if (game && game.room.round) {
            game.updateSnake(this.client, data[0], data[1]);
        }
    },

    /**
     * @private
     */
    _gameState: function() {
        var game = this._clientGame(this.client);
        if (game && game.room.round) {
            game.emitState(this.client);
        }
    },

    /**
     * @param {Client} client
     * @return {Room}
     * @private
     */
    _clientRoom: function(client) {
        return this.server.roomManager.room(client.roomKey);
    },

    /**
     * @param {Client} client
     * @return {Game}
     * @private
     */
    _clientGame: function(client) {
        return (client.roomKey) ? this._clientRoom(client).game : null;
    }

};