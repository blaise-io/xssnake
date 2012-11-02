/*jshint globalstrict:true, sub:true*/
/*globals XSS, Client, Game, Apple, Utils, io*/

'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
function Socket(callback) {
    Utils.loadScript(XSS.config.client.socketio.script, function() {
        this.socket = io.connect(XSS.config.client.socketio.host);
        this._addEventListeners(callback);
    }.bind(this));
}

Socket.prototype = {

    /**
     * @param callback {function(Socket)}
     * @private
     */
    _addEventListeners: function(callback) {
        var events = XSS.events;

        this.socket.on(events.CLIENT_CONNECT, function() {
            console.log('connected');
            if (callback) {
                callback(this);
            }
        }.bind(this));

        this.socket.on(events.CLIENT_CHAT_MESSAGE, function(data) {
            if (XSS.game) {
                XSS.game.chat.message({author: data[0], body: data[1]});
            }
        }.bind(this));

        this.socket.on(events.CLIENT_NOTICE, function(notice) {
            if (XSS.game) {
                XSS.game.chat.message({body: notice});
            }
            console.log(notice);
        }.bind(this));

        this.socket.on(events.CLIENT_GAME_SETUP, function(data) {
            if (XSS.game) {
                XSS.game.destruct();
            }
            XSS.game = new Game(data[0], data[1], data[2], data[3]);
        }.bind(this));

        this.socket.on(events.CLIENT_GAME_START, function() {
            XSS.game.start();
        }.bind(this));

        this.socket.on(events.CLIENT_GAME_WIN, function(data) {
            console.log(data[0] + ' wins this round!');
            console.log(data[0] + ' total wins: ' + data[1]);
        }.bind(this));

        this.socket.on(events.CLIENT_SNAKE_UPDATE, function(data) {
            var snake = XSS.game.snakes[data[0]];
            snake.parts = data[1];
            snake.direction = data[2];
        }.bind(this));

        this.socket.on(events.CLIENT_SNAKE_CRASH, function(data) {
            var snake;
            snake = XSS.game.snakes[data[0]];
            snake.parts = data[1];
            snake.crash();
        }.bind(this));

        this.socket.on(events.CLIENT_APPLE_NOM, function(data) {
            XSS.game.snakes[data[0]].size = data[1];
            XSS.game.apples[data[2]].eat();
        }.bind(this));

        this.socket.on(events.CLIENT_APPLE_SPAWN, function(data) {
            var index = data[0], location = data[1];
            XSS.game.apples[index] = new Apple(index, location[0], location[1]);
        }.bind(this));
    },

    /**
     * @param {string} action
     * @param {*} data
     */
    emit: function(action, data) {
        this.socket.emit(action, data);
    }

};