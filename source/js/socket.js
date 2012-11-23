/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Client, Room, Game, Apple, Util, io*/

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
        var events = XSS.events;

        this.socket.on(events.CLIENT_CONNECT, function() {
            if (callback) {
                callback(this);
            }
        }.bind(this));

        this.socket.on(events.CLIENT_ROOM_INDEX, function(data) {
            if (!XSS.room) {
                XSS.room = new Room(data[0], data[1], data[2], data[3]);
            } else {
                XSS.room.update.apply(XSS.room, data);
            }
        });

        this.socket.on(events.CLIENT_ROOM_SCORE, function(data) {
            XSS.room.score.updateScore(data[0], data[1]);
        });

        this.socket.on(events.CLIENT_CHAT_MESSAGE, function(data) {
            XSS.room.chat.add({author: data[0], body: data[1]});
        });

        this.socket.on(events.CLIENT_CHAT_NOTICE, function(notice) {
            XSS.room.chat.add({body: notice});
        });

        this.socket.on(events.CLIENT_GAME_COUNTDOWN, function() {
            XSS.room.game.countdown();
        });

        this.socket.on(events.CLIENT_GAME_START, function() {
            XSS.room.game.start();
        });

        this.socket.on(events.CLIENT_SNAKE_UPDATE, function(data) {
            var snake = XSS.room.game.snakes[data[0]];
            snake.parts = data[1];
            snake.direction = data[2];
        });

        this.socket.on(events.CLIENT_SNAKE_CRASH, function(data) {
            var snake;
            snake = XSS.room.game.snakes[data[0]];
            snake.parts = data[1];
            snake.crash();
        });

        this.socket.on(events.CLIENT_APPLE_NOM, function(data) {
            XSS.room.game.snakes[data[0]].size = data[1];
            XSS.room.game.apples[data[2]].eat();
        });

        this.socket.on(events.CLIENT_APPLE_SPAWN, function(data) {
            var index = data[0], location = data[1];
            XSS.room.game.apples[index] = new Apple(index, location[0], location[1]);
        });
    }

};