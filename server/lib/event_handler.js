/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Validate = require('./validate.js');
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
        this.client.connection.on('data', function(){});
        clearInterval(this._pingInterval);
        delete this.client;
    },

    /**
     * @private
     */
    _handleMessage: function(message) {
        var messageValidate, json, jsonValidate;

        messageValidate = new Validate(message)
            .assertStringOfLength(6, 1024 * 4)
            .assertJSON();

        if (messageValidate.valid()) {
            json = messageValidate.json();

            jsonValidate = new Validate(json).assertArrayOfLength(1, 2);

            if (jsonValidate.valid()) {
                this.client.server.pubsub.emit(json[0], json[1], this.client);
                this._handleClientEvent(json[0], json[1]);
            }
        }
    },

    _getMap: function() {
        var map = {};
        map[events.PONG]              = this._pong.bind(this);
        map[events.ROOM_START]        = this._roomStart.bind(this);
        map[events.CHAT_MESSAGE]      = this._chat.bind(this);
        map[events.GAME_SNAKE_UPDATE] = this._snakeUpdate.bind(this);
        map[events.GAME_STATE]        = this._gameState.bind(this);
        return map;
    },

    /**
     * @private
     */
    _handleClientEvent: function(event, data) {
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
        this.client.latency = new Validate((+new Date()) - sendTime)
            .assertRange(0, 1000)
            .value(0);
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
        var index, validMessage, room = this.client.room;

        validMessage = new Validate(message).assertStringOfLength(1, 30);

        if (room && validMessage.valid()) {
            index = this.client.index;
            this.client.broadcast(events.CHAT_MESSAGE, [index, message]);
            room.emit(events.GAME_SNAKE_ACTION, [index, 'Blah']);
        }
    },

    /**
     * @param data [<Array>,<number>] 0: parts, 1: direction
     */
    _snakeUpdate: function(data) {
        var parts, direction, game, client = this.client;

        parts = new Validate(data[0]).assertArray();
        direction = new Validate(data[1]).assertRange(0, 3);

        if (client.playing() && parts.valid() && direction.valid()) {
            game = client.room.game;
            game.updateSnake(client, parts.value(), direction.value());
        }
    },

    /**
     * @private
     */
    _gameState: function() {
        var client = this.client;
        if (client.playing()) {
            client.room.game.emitState(client);
        }
    }

};
