/*jshint globalstrict:true, sub:true*/
/*globals XSS, Client, Game, io*/

'use strict';

/**
 * Client-Server communication
 * @param callback {function(Socket)}
 * @constructor
 */
function Socket(callback) {
    this.host = 'http://localhost:8080';
    this.connect(callback);
}

Socket.prototype = {

    connect: function(callback) {
        XSS.utils.loadScript('http://localhost:8080/socket.io/socket.io.js', function() {
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
            var snake, parts, direction;

            snake = XSS.game.snakes[data['index']];
            parts = data['snake'][0];
            direction = data['snake'][1];

            snake.parts = parts;
            snake.head = parts[parts.length - 1];
            snake.direction = direction;
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