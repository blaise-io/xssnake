/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Client, Room, Game, Apple, Util, Powerup, io*/

'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
function Socket(callback) {
    Util.loadScript(XSS.config.client.socketio.script, function() {
        this.socket = io.connect(XSS.config.client.socketio.host);
        this._addEventListeners(callback);
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
    _addEventListeners: function(callback) {
        var events = XSS.events, socket = this.socket;

        socket.on(events.CLIENT_CONNECT, function() {
            if (callback) {
                callback(this);
            }
        }.bind(this));

        socket.on(events.CLIENT_ROOM_INDEX, function(data) {
            if (!XSS.room) {
                XSS.room = new Room(data[0], data[1], data[2], data[3]);
            } else {
                XSS.room.update.apply(XSS.room, data);
            }
        });

        socket.on(events.CLIENT_ROOM_SCORE, function(data) {
            XSS.room.score.updateScore(data[0], data[1]);
        });

        socket.on(events.CLIENT_CHAT_MESSAGE, function(data) {
            XSS.room.chat.add({author: data[0], body: data[1]});
        });

        socket.on(events.CLIENT_CHAT_NOTICE, function(notice) {
            XSS.room.chat.add({body: notice});
        });

        socket.on(events.CLIENT_GAME_COUNTDOWN, function() {
            XSS.room.game.countdown();
        });

        socket.on(events.CLIENT_GAME_START, function() {
            XSS.room.game.start();
        });

        socket.on(events.CLIENT_SNAKE_UPDATE, function(data) {
            var snake = XSS.room.game.snakes[data[0]];
            snake.limbo = false;
            snake.parts = data[1];
            snake.direction = data[2];
        });

        socket.on(events.CLIENT_SNAKE_CRASH, function(data) {
            var snake;
            snake = XSS.room.game.snakes[data[0]];
            snake.parts = data[1];
            snake.crash();
        });

        socket.on(events.CLIENT_SNAKE_ACTION, function(data) {
            var snake = XSS.room.game.snakes[data[0]];
            snake.showAction(data[1]);
        });

        socket.on(events.CLIENT_APPLE_HIT, function(data) {
            var game = XSS.room.game;
            game.snakes[data[0]].size = data[1];
            game.apples[data[2]].destruct();
            game.apples[data[2]] = null;
        });

        socket.on(events.CLIENT_APPLE_SPAWN, function(data) {
            var index = data[0], location = data[1];
            XSS.room.game.apples[index] = new Apple(index, location[0], location[1]);
        });

        socket.on(events.CLIENT_POWERUP_HIT, function(data) {
            var game = XSS.room.game;
            game.powerups[data[1]].destruct();
            game.powerups[data[1]] = null;
        });

        socket.on(events.CLIENT_POWERUP_SPAWN, function(data) {
            var index = data[0], location = data[1];
            XSS.room.game.powerups[index] = new Powerup(index, location[0], location[1]);
        });

        socket.on(events.CLIENT_SNAKE_SPEED, function(data) {
            var game = XSS.room.game;
            game.snakes[data[0]].speed = data[1];
        });

    }

};