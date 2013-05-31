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

    this._startPingInterval();

    this._map = this._getMap();
    this._pingSent = -1;

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
        var cleanMessage, pubsub = this.client.server.pubsub;
        cleanMessage = this._cleanMessage(message);
        if (cleanMessage) {
            pubsub.emit(cleanMessage.event, cleanMessage.data, this.client);
            this._handleClientEvent(cleanMessage.event, cleanMessage.data);
        }
    },

    /**
     * @param {string} dirtyMessage
     * @return {Object}
     * @private
     */
    _cleanMessage: function(dirtyMessage) {
        var messageValidate, json, jsonValidate, eventValidate;

        messageValidate = new Validate(dirtyMessage)
            .assertStringOfLength(6, 512)
            .assertJSON();
        if (!messageValidate.valid()) {
            return null;
        }

        json = messageValidate.json();
        jsonValidate = new Validate(json).assertArrayOfLength(1, 2);
        if (!jsonValidate.valid()) {
            return null;
        }

        eventValidate = new Validate(json[0]).assertStringOfLength(1, 20);
        if (!eventValidate.valid()) {
            return null;
        }

        return {
            event: eventValidate.value(),
            data: json[1] // Can be any type, validate in event listener
        };
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
    _startPingInterval: function() {
        this._pingInterval = setInterval(function() {
            this._pingSent = +new Date();
            this.client.emit(events.PING);
        }.bind(this), map.NETCODE_PING_INTERVAL);
    },

    /**
     * @private
     */
    _pong: function() {
        var rtt, now = +new Date();
        if (this._pingSent) {
            rtt = now - new Validate(this._pingSent)
                            .assertRange(now - map.NETCODE_PING_INTERVAL, now)
                            .value(now - 50);
            this.client.rtt = rtt;
            this._pingSent = 0;
        }
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
