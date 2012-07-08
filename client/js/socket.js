/*jshint globalstrict:true, sub:true */
/*globals XSS, Client, io*/

'use strict';

/**
 * Client-Server communication
 * @constructor
 */
function Socket() {
    this.host = 'http://localhost';
}

Socket.prototype = {

    init: function(callback) {
        $.ajaxSetup({ cache: true });

        /** @namespace io */
        $.getScript('http://localhost/socket.io/socket.io.js', function() {
            this.socket = io.connect(this.host);
            this.addEventHandlers(callback);
        }.bind(this));
    },

    addEventHandlers: function(callback) {
        this.socket.on('/xss/connect', function(data) {
            XSS.me = new Client(data['id']);
            if (callback) {
                callback(this);
            }
            this.socket.emit('foo', 'BAR');
        }.bind(this));
    },

    emit: function(action, data) {
        this.socket.emit(action, data);
    }

};