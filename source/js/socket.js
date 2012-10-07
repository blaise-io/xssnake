/*jshint globalstrict:true, sub:true*/
/*globals XSS, Client, Game, Apple, Utils, io*/

'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
function Socket(callback) {
    Utils.loadScript(XSS.config.server.socketIOScript, function() {
        this.socket = io.connect(XSS.config.server.host);
        this._addEventListeners(callback);
    }.bind(this));
}

Socket.prototype = {

    /**
     * @param callback {function(Socket)}
     * @private
     */
    _addEventListeners: function(callback) {
        this.socket.on('/client/connect', function(id) {
            XSS.me = new Client(id);
            if (callback) {
                callback(this);
            }
        }.bind(this));

        this.socket.on('/client/notice', function(notice) {
            console.log(notice);
        }.bind(this));

        this.socket.on('/client/game/setup', function(data) {
            if (XSS.game) {
                XSS.game.destruct();
            }
            XSS.game = new Game(data[0], data[1], data[2], data[3]);
        }.bind(this));

        this.socket.on('/client/game/start', function() {
            XSS.game.start();
        }.bind(this));

        this.socket.on('/client/game/winner', function(data) {
            console.log(data[0] + ' wins this round!');
            console.log(data[0] + ' total wins: ' + data[1]);
        }.bind(this));

        this.socket.on('/client/snake/update', function(data) {
            var snake = XSS.game.snakes[data[0]];
            snake.parts = data[1];
            snake.direction = data[2];
        }.bind(this));

        this.socket.on('/client/snake/crash', function(data) {
            var snake;
            snake = XSS.game.snakes[data[0]];
            snake.parts = data[1];
            snake.crash();
        }.bind(this));

        this.socket.on('/client/apple/eat', function(data) {
            XSS.game._snakeSize(data[0], data[1]);
            XSS.game.apples[data[2]].eat();
        }.bind(this));

        this.socket.on('/client/apple/spawn', function(data) {
            var index = data[0], location = data[1];
            XSS.game.apples[index] = new Apple(location[0], location[1]);
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