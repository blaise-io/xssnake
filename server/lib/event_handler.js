/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var events = require('../shared/events.js');

/**
 * @param {Object} server
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
    socket.on(events.SERVER_ROOM_MATCH, this._matchRoom.bind(this));
    socket.on(events.SERVER_CHAT_MESSAGE, this._chat.bind(this));
    socket.on(events.SERVER_SNAKE_UPDATE, this._snakeUpdate.bind(this));
    socket.on(events.SERVER_GAME_STATE, this._gameState.bind(this));
    socket.on(events.SERVER_PONG, this._pong.bind(this));
}

module.exports = EventHandler;

EventHandler.prototype = {

    destruct: function() {
        // Other event listeners will remove themselves.
        clearInterval(this._pingInterval);
        delete this.server;
        delete this.client;
        delete this.socket;
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
        room = this.server.roomManager.rooms[client.roomid];
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
     * @param {Object} data Object with keys name, pub, friendly
     * @private
     */
    _matchRoom: function(data) {
        var room, client = this.client, server = this.server;
        client.name = data.name;
        room = server.roomManager.getPreferredRoom(data);
        room.join(client);
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
        if (game && game.room.inProgress) {
            game.updateSnake(this.client, data[0], data[1]);
        }
    },

    /**
     * @private
     */
    _gameState: function() {
        var game = this._clientGame(this.client);
        if (game && game.room.inProgress) {
            game.emitState(this.client);
        }
    },

    /**
     * @param {Client} client
     * @return {Room}
     * @private
     */
    _clientRoom: function(client) {
        return this.server.roomManager.room(client.roomid);
    },

    /**
     * @param {Client} client
     * @return {Game}
     * @private
     */
    _clientGame: function(client) {
        return (client.roomid) ? this._clientRoom(client).game : null;
    }

};