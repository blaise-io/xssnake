/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var events = require('../shared/events.js');
var map = require('../shared/map.js');

/**
 * @param {Client} client
 * @constructor
 */
function EventHandler(client) {
    this.client = client;

    this._pingHeartBeat();
    this._map = this._getMap();

    client.connection.on('data', this._handleMessage.bind(this));
    client.connection.on('close', this._disconnect.bind(this));
}

module.exports = EventHandler;

EventHandler.prototype = {

    destruct: function() {
        console.log('-- CLIENT DESTROY --', this.client.id);
        this.client.connection.on('data', function(){});
        clearInterval(this._pingInterval);
        delete this.client;
    },

    /**
     * @private
     */
    _handleMessage: function(message) {
        message = JSON.parse(message);
        this.client.server.pubsub.emit(message[0], message[1], this.client);
        this._handlePrivateEvent(message[0], message[1]);
    },

    _getMap: function() {
        var map = {};
        map[events.PONG] = this._pong.bind(this);
        map[events.ROOM_START] = this._roomStart.bind(this);
        map[events.CHAT_MESSAGE] = this._chat.bind(this);
        map[events.GAME_SNAKE_UPDATE] = this._snakeUpdate.bind(this);
        map[events.GAME_STATE] = this._gameState.bind(this);
        return map;
    },

    /**
     * @private
     */
    _handlePrivateEvent: function(event, data) {
        var map = this._map;

        if (map[event]) {
            map[event](data);
        }
    },

    /**
     * @private
     */
    _pingHeartBeat: function() {
        this._pingInterval = setInterval(function() {
            this.client.emit(events.PING, +new Date());
        }.bind(this), 2000);
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
            this.client.server.removeClient(client);
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
