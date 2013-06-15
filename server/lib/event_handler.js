/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Validate = require('./validate.js');
var CONST = require('../shared/const.js');

/**
 * @param {Client} client
 * @param {EventEmitter} pubsub
 * @constructor
 */
function EventHandler(client, pubsub) {
    this.client = client;
    this.pubsub = pubsub;

    client.connection.on('data', this._handleMessage.bind(this));
    client.connection.on('close', this._disconnect.bind(this));

    this._startPingInterval();
}

module.exports = EventHandler;

EventHandler.prototype = {

    _eventMap: null,
    _pingSent: -1,

    destruct: function() {
        clearInterval(this._pingInterval);
        this.client.connection.on('data', function(){});
        this.client = null;
        this.pubsub = null;
        this._eventMap = null;
    },

    /**
     * @private
     */
    _handleMessage: function(message) {
        var cleanMessage = this._cleanMessage(message);
        if (cleanMessage) {
            this.pubsub.emit(cleanMessage.event, cleanMessage.data, this.client);
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

    /**
     * @private
     */
    _handleClientEvent: function(event, data) {
        var map = this._eventMap;
        if (!map) {
            map = {};
            map[CONST.EVENT_PONG]         = this._pong.bind(this);
            map[CONST.EVENT_ROOM_START]   = this._roomStart.bind(this);
            map[CONST.EVENT_CHAT_MESSAGE] = this._chat.bind(this);
            map[CONST.EVENT_SNAKE_UPDATE] = this._snakeUpdate.bind(this);
            map[CONST.EVENT_GAME_STATE]   = this._gameState.bind(this);
            this._eventMap = map;
        }

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
            this.client.emit(CONST.EVENT_PING);
        }.bind(this), CONST.NETCODE_PING_INTERVAL);
    },

    /**
     * @private
     */
    _pong: function() {
        var rtt, now = +new Date();
        if (this._pingSent) {
            rtt = now - Number(new Validate(this._pingSent)
                .assertRange(now - CONST.NETCODE_PING_INTERVAL, now)
                .value(now - 50));
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
            room.removeClient(client);
        }
        client.destruct();
    },

    /**
     * @private
     */
    _roomStart: function() {
        this.client.room.rounds.clientStart(this.client);
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
            this.client.broadcast(CONST.EVENT_CHAT_MESSAGE, [index, message]);
            room.emit(CONST.EVENT_SNAKE_ACTION, [index, 'Blah']);
        }
    },

    /**
     * @param data [<Array>,<number>] 0: parts, 1: direction
     */
    _snakeUpdate: function(data) {
        var parts, direction, partsValidate, directionValidate, game, client = this.client;

        partsValidate = new Validate(data[0]).assertArray();
        directionValidate = new Validate(data[1]).assertRange(0, 3);

        if (client.playing() && partsValidate.valid()) {
            parts = (
                /** @type {Array.<Array.<number>>} */
                partsValidate.value()
            );

            direction = (
                /** @type {number} */
                directionValidate.value(0)
            );

            game = client.room.rounds.round.game;
            game.updateSnake(client, parts, direction);
        }
    },

    /**
     * @private
     */
    _gameState: function() {
        var client = this.client;
        if (client.playing()) {
            client.room.rounds.round.game.emitState(client);
        }
    }

};
