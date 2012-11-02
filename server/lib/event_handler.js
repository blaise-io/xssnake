/*jshint globalstrict:true,es5:true*/
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

    client.emit(events.CLIENT_CONNECT, client.id);

    socket.on('disconnect', this._disconnect.bind(this));
    socket.on(events.SERVER_ROOM_MATCH, this._matchRoom.bind(this));
    socket.on(events.SERVER_CHAT_MESSAGE, this._chat.bind(this));
    socket.on(events.SERVER_SNAKE_UPDATE, this._update.bind(this));
    socket.on(events.SERVER_GAME_REINDEX, this._reIndex.bind(this));
}

module.exports = EventHandler;

EventHandler.prototype = {

    /**
     * @private
     */
    _disconnect: function() {
        var room, client = this.client, server = this.server;

        room = server.roomManager.rooms[client.roomid];
        if (room) {
            room.leave(client);
        }

        server.state.removeClient(client);
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
        if (this.client.roomid) {
            var game, data;
            game = this._clientGame(this.client);
            data = [this.client.name, message.substr(0, 30)];
            game.room.emit(events.CLIENT_CHAT_MESSAGE, data);
        }
    },

    /**
     * @param data [<Array>,<number>] 0: parts, 1: direction
     */
    _update: function(data) {
        if (this.client.roomid) {
            var game = this._clientGame(this.client);
            if (game.room.inprogress) {
                game.updateSnake(this.client, data[0], data[1]);
            }
        }
    },

    /**
     * @private
     */
    _reIndex: function() {
        if (this.client.roomid) {
            var game = this._clientGame(this.client);
            if (game.room.inprogress) {
                game.reIndex(this.client);
            }
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
        return this._clientRoom(client).game;
    }

};