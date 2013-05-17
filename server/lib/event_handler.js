/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var events = require('../shared/events.js');
var map = require('../shared/map.js');

/**
 * @param {Server} server
 * @param {Client} client
 * @param {Object} connection
 * @constructor
 */
function EventHandler(server, client, connection) {
    this.server = server;
    this.client = client;

    this._pingHeartBeat();
    this._bindIncomingEvents();

    connection.on('data', this._handleMessage.bind(this));
    connection.on('close', this._disconnect.bind(this));
}

module.exports = EventHandler;

EventHandler.prototype = {

    destruct: function() {
        clearInterval(this._pingInterval);

        var bound = this.bound;
        for (var k in bound) {
            if (bound.hasOwnProperty(k)) {
                this.server.pubsub.removeListener(k, bound[k]);
            }
        }

        this.server = null;
        this.client = null;
    },

    _handleMessage: function(message) {
        message = JSON.parse(message);
        this.server.pubsub.emit(message[0], message[1], this.client);
    },

    /**
     * @private
     */
    _bindIncomingEvents: function() {
        var pubsub = this.server.pubsub;

        this.bound = {
            pong       : this._pong.bind(this),
            roomStart  : this._roomStart.bind(this),
            chat       : this._chat.bind(this),
            snakeUpdate: this._snakeUpdate.bind(this),
            gameState  : this._gameState.bind(this)
        };

        pubsub.on(events.PONG,              this.bound.pong);
        pubsub.on(events.ROOM_START,        this.bound.roomStart);
        pubsub.on(events.CHAT_MESSAGE,      this.bound.chat);
        pubsub.on(events.GAME_SNAKE_UPDATE, this.bound.snakeUpdate);
        pubsub.on(events.GAME_STATE,        this.bound.gameState);
    },

    /**
     * @private
     */
    _pingHeartBeat: function() {
        this._pingInterval = setInterval(function() {
            this.client.emit(events.PING, +new Date());
        }.bind(this), 1000);
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
        var client = this.client, room = client.room;
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
     * @private
     */
    _roomStart: function() {
        var client = this.client, room = client.room;
        if (room.isHost(client) && !room.round && room.clients.length > 1) {
            room.game.countdown();
        }
    },

    /**
     * @param {string} message
     * @private
     */
    _chat: function(message) {
        var room, data, index;
        room = this.client.room;
        if (room) {
            index = this.client.index;
            data = [index, message.substr(0, 30)];
            this.client.broadcast(events.CHAT_MESSAGE, data);
            room.emit(events.GAME_SNAKE_ACTION, [index, 'Blah']);
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
     * @return {Game}
     * @private
     */
    _clientGame: function(client) {
        return (client.room) ? client.room.game : null;
    }

};
