/*jshint globalstrict:true, sub:true*/
/*globals XSS, Client, Game, Apple, io*/

'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
function Socket(callback) {
    XSS.utils.loadScript(XSS.config.server.socketIOScript, function() {
        /** @type {EventEmitter} */
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
        this.socket.on('/c/connect', function(id) {
            XSS.me = new Client(id);
            if (callback) {
                callback(this);
            }
        }.bind(this));

        this.socket.on('/c/notice', function(notice) {
            console.log(notice);
        }.bind(this));

        this.socket.on('/c/start', function(data) {
            XSS.game = new Game(data);
        }.bind(this));

        this.socket.on('/c/up', function(data) {
            var snake;
            snake = XSS.game.snakes[data['index']];
            snake.parts = data['snake'][0];
            snake.direction =  data['snake'][1];
        }.bind(this));

        this.socket.on('/c/nom', function(data) {
            XSS.game.snakeSize(data[0], data[1]);
            XSS.game.apples[data[2]].eat();
        }.bind(this));

        this.socket.on('/c/crash', function(data) {
            var snake;
            snake = XSS.game.snakes[data[0]];
            snake.parts = data[1];
            snake.crash();
        }.bind(this));

        this.socket.on('/c/apple', function(data) {
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