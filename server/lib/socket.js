'use strict';

/**
 * @param {xss.Client} client
 * @param {EventEmitter} pubsub
 * @param {Object} connection
 * @constructor
 */
xss.Socket = function(client, pubsub, connection) {
    this.client = client;
    this.pubsub = pubsub;
    this.connection = connection;

    this.model = new xss.model.Socket();

    connection.on('data', this.dispatchMessage.bind(this));
    connection.on('close', this.eventDisconnect.bind(this));

    this.startPingInterval();
};

xss.Socket.prototype = {

    destruct: function() {
        clearInterval(this._pingInterval);
        this.client = null;
        this.pubsub = null;
        this.connection = null;
        this.model = null;
    },

    /**
     * @private
     */
    dispatchMessage: function(message) {
        var cleanMessage = this.cleanMessage(message);
        if (cleanMessage) {
            this.pubsub.emit(cleanMessage.event, cleanMessage.data, this.client);
            this.dispatchEvent(cleanMessage.event, cleanMessage.data);
        }
    },

    /**
     * @private
     */
    dispatchEvent: function(event, data) {
        var map = this._eventMap;
        if (!map) {
            map = {};
            map[xss.EVENT_PING]         = this.eventPong.bind(this);
            map[xss.EVENT_ROOM_START]   = this.eventRoomStart.bind(this);
            map[xss.EVENT_CHAT_MESSAGE] = this.eventChat.bind(this);
            map[xss.EVENT_SNAKE_UPDATE] = this.eventSnakeUpdate.bind(this);
            map[xss.EVENT_GAME_STATE]   = this.eventRequestGameState.bind(this);
            this._eventMap = map;
        }

        if (map[event]) {
            map[event](data);
        }
    },

    /**
     * @param {string} dirtyMessage
     * @return {Object}
     * @private
     */
    cleanMessage: function(dirtyMessage) {
        var messageValidate, json, jsonValidate, eventValidate;

        messageValidate = new xss.Validate(dirtyMessage)
            .assertStringOfLength(5, 512)
            .assertJSON();
        if (!messageValidate.valid()) {
            return null;
        }

        json = messageValidate.json();
        jsonValidate = new xss.Validate(json).assertArrayOfLength(1, 2);
        if (!jsonValidate.valid()) {
            return null;
        }

        eventValidate = new xss.Validate(json[0]).assertStringOfLength(1, 20);
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
    startPingInterval: function() {
        this._pingInterval = setInterval(function() {
            this.model.ping();
            this.client.emit(xss.EVENT_PING);
        }.bind(this), xss.NETCODE_PING_INTERVAL);
    },

    eventPong: function() {
        var rtt = this.model.pong();
        this.client.emit(xss.EVENT_PING_RESULT, [+new Date(), rtt]);
    },

    eventDisconnect: function() {
        var client = this.client, room = client.room;
        if (room) {
            room.removeClient(client);
        }
        client.destruct();
    },

    eventRoomStart: function() {
        this.client.room.rounds.clientStart(this.client);
    },

    eventChat: function(message) {
        var index, validMessage, room = this.client.room;

        validMessage = new xss.Validate(message).assertStringOfLength(1, 30);

        if (room && validMessage.valid()) {
            index = this.client.model.index;
            this.client.broadcast(xss.EVENT_CHAT_MESSAGE, [index, message]);
            room.emit(xss.EVENT_SNAKE_ACTION, [index, 'Blah']);
        }
    },

    /**
     * @param data [<Array>,<number>] 0: parts, 1: direction
     */
    eventSnakeUpdate: function(data) {
        var client, game, parts, direction;

        client = this.client;
        game = client.getGame();

        parts = new xss.Validate(data[0]).assertArray();
        direction = new xss.Validate(data[1]).assertRange(0, 3);

        if (game && parts.valid()) {
            game.updateSnake(this.client, parts.value(), direction.value(0));
        }
    },

    eventRequestGameState: function() {
        var game, client = this.client;
        game = client.getGame();
        if (game) {
            game.emitState(client);
        }
    }

};
