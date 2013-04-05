/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Client, Room, Game, Apple, Powerup, Shape, StageFlow*/

'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
function Socket(callback) {
    var options = {'max reconnection attempts': 4};
    XSS.util.loadScript(XSS.config.SOCKET_IO_JS, function() {
        this.socket = window['io'].connect(XSS.config.SERVER_ENDPOINT, options);
        this._bindEvents(callback);
    }.bind(this));
}

Socket.prototype = {

    /**
     * @param {string} action
     * @param {*} data
     */
    emit: function(action, data) {
        this.socket.emit(action, data);
    },

    /**
     * @param callback {function(Socket)}
     * @private
     */
    _bindEvents: function(callback) {
        var events = XSS.events, map = {};

        this.map = map;

        map[events.CLIENT_CONNECT]        = callback;
        map['disconnect']                 = this.disconnect;

        map[events.CLIENT_PING]           = this.clientPing;
        map[events.CLIENT_COMBI_EVENTS]   = this.combinedEvents;
        map[events.CLIENT_AUTOJOIN_SUCC]  = this.autoJoinSuccess;
        map[events.CLIENT_AUTOJOIN_ERR]   = this.autoJoinError;
        map[events.CLIENT_ROOM_INDEX]     = this.roomIndex;
        map[events.CLIENT_ROOM_SCORE]     = this.updateScore;
        map[events.CLIENT_CHAT_MESSAGE]   = this.chatMessage;
        map[events.CLIENT_CHAT_NOTICE]    = this.chatNotice;
        map[events.CLIENT_GAME_COUNTDOWN] = this.gameCountdown;
        map[events.CLIENT_GAME_START]     = this.gameStart;
        map[events.CLIENT_GAME_SNAKES]    = this.gameSnakes;
        map[events.CLIENT_SNAKE_UPDATE]   = this.snakeUpdate;
        map[events.CLIENT_SNAKE_SIZE]     = this.snakeSize;
        map[events.CLIENT_SNAKE_CRASH]    = this.snakeCrash;
        map[events.CLIENT_SNAKE_ACTION]   = this.snakeAction;
        map[events.CLIENT_APPLE_HIT]      = this.appleHit;
        map[events.CLIENT_APPLE_SPAWN]    = this.appleSpawn;
        map[events.CLIENT_POWERUP_HIT]    = this.powerupHit;
        map[events.CLIENT_POWERUP_SPAWN]  = this.powerupSpawn;
        map[events.CLIENT_SNAKE_SPEED]    = this.snakeSpeed;

        for (var k in map) {
            if (map.hasOwnProperty(k)) {
                this.socket.on(k, map[k].bind(this));
            }
        }
    },

    disconnect: function() {
        var str = 'OHSHI!! Lost server connection\n' +
                  '(appropriate moment for panic)';

        if (XSS.room) {
            XSS.room.destruct();
        }

        XSS.shapes = {
            header: XSS.font.shape(str, 60, 60)
        };

        window.setTimeout(function() {
            XSS.stageflow = new StageFlow();
        }, 5000);
    },

    /**
     * @param {number} time
     */
    clientPing: function(time) {
        this.emit(XSS.events.SERVER_PING, time);
    },

    /**
     * Combined package, delegate.
     * @param {Array.<Array>} data
     */
    combinedEvents: function(data) {
        for (var i = 0, m = data.length; i < m; i++) {
            this.map[data[i][0]](data[i][1]);
        }
    },

    /**
     * @param {Array} data
     */
    autoJoinSuccess: function(data) {
        XSS.stages.autoJoinSuccess(data);
    },

    /**
     * @param {number} error
     */
    autoJoinError: function(error) {
        XSS.stages.autoJoinError(error);
    },

    /**
     * @param {Array} data
     */
    roomIndex: function(data) {
        if (!XSS.room) {
            XSS.room = new Room(data[0], data[1], data[2], data[3], data[4]);
        } else {
            XSS.room.update.apply(XSS.room, data);
        }
    },

    /**
     * @param {Array} data
     */
    updateScore: function(data) {
        XSS.room.score.updateScore(data[0], data[1]);
    },

    /**
     * @param {Array} data
     */
    chatMessage: function(data) {
        XSS.room.chat.add({author: data[0], body: data[1]});
    },

    /**
     * @param {string} notice
     */
    chatNotice: function(notice) {
        if (XSS.room) {
            XSS.room.chat.add({body: notice});
        }
    },

    gameCountdown: function() {
        XSS.room.game.countdown();
    },

    gameStart: function() {
        XSS.room.game.start();
    },

    /**
     * Combined package, delegate.
     * @param {Array.<Array>} data
     */
    gameSnakes: function(data) {
        for (var i = 0, m = data.length; i < m; i++) {
            this.snakeUpdate(data[i]);
        }
    },

    /**
     * @param {Array} data
     */
    snakeUpdate: function(data) {
        var snake = XSS.room.game.snakes[data[0]];
        snake.limbo = false;
        snake.parts = data[1];
        snake.direction = data[2];
    },

    /**
     * @param {Array} data
     */
    snakeSize: function(data) {
        var snake = XSS.room.game.snakes[data[0]];
        snake.size = data[1];
    },

    /**
     * @param {Array} data
     */
    snakeCrash: function(data) {
        var snake;
        snake = XSS.room.game.snakes[data[0]];
        snake.parts = data[1];
        snake.crash();
    },

    /**
     * @param {Array} data
     */
    snakeAction: function(data) {
        var snake = XSS.room.game.snakes[data[0]];
        snake.showAction(data[1]);
    },

    /**
     * @param {Array} data
     */
    appleHit: function(data) {
        var game = XSS.room.game;
        game.snakes[data[0]].size = data[1];
        game.apples[data[2]].destruct();
        game.apples[data[2]] = null;
    },

    /**
     * @param {Array} data
     */
    appleSpawn: function(data) {
        var index = data[0], location = data[1];
        XSS.room.game.apples[index] = new Apple(index, location[0], location[1]);
    },

    /**
     * @param {Array} data
     */
    powerupHit: function(data) {
        var game = XSS.room.game;
        game.powerups[data[1]].destruct();
        game.powerups[data[1]] = null;
    },

    /**
     * @param {Array} data
     */
    powerupSpawn: function(data) {
        var index = data[0], location = data[1];
        XSS.room.game.powerups[index] = new Powerup(index, location[0], location[1]);
    },

    /**
     * @param {Array} data
     */
    snakeSpeed: function(data) {
        var game = XSS.room.game;
        game.snakes[data[0]].speed = data[1];
    }

};