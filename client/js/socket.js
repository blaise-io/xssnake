/*jshint globalstrict:true, sub:true*/
/*globals XSS, Client, Game, Apple, io*/

'use strict';

/**
 * Client-Server communication
 * @param callback {function(Socket)}
 * @constructor
 */
function Socket(callback) {
    this.host = XSS.config.server.host;
    this.script = XSS.config.server.socketIOScript;
    this.connect(callback);
}

Socket.prototype = {

    connect: function(callback) {
        XSS.utils.loadScript(this.script, function() {
            this.socket = this.getSocket(this.host);
            this._addEventListeners(callback);
        }.bind(this));
    },

    /**
     * @param {string} host
     * @return {{on: function(string, function(*)) }}
     */
    getSocket: function(host) {
        return io.connect(host);
    },

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
            var snake, index = data[0], size = data[1];
            snake = XSS.game.snakes[index];
            snake.size = size;
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