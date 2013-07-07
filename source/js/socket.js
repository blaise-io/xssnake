/*jshint globalstrict:true, expr:true, sub:true*/
/*globals XSS, CONST, Client, Room, Game, Spawnable, Powerup, Shape, StageFlow, SockJS*/
'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
function Socket(callback) {
    this.callback = callback;
    this.connected = false;

    this.connection = new SockJS(CONST.SERVER_ENDPOINT);
    this.connection.onopen = this._connect.bind(this);
    this.connection.onclose = this._disconnect.bind(this);
    this.connection.onmessage = this.handleMessage.bind(this);

    this._bindEvents();
}

Socket.prototype = {

    destruct: function() {
        XSS.event.off(CONST.EVENT_PING, CONST.NS_SOCKET);
        XSS.event.off(CONST.EVENT_COMBI, CONST.NS_SOCKET);
        if (XSS.room) {
            XSS.room.destruct();
            XSS.room = null;
        }
        if (this.connection.readyState <= 1) {
            this.connection.onclose = XSS.util.dummy;
            this.connection.onmessage = XSS.util.dummy;
            this.connection.close();
        }
    },

    _connect: function() {
        this.connected = true;
        this.callback();
    },

    _disconnect: function() {
        var callback = function() {
            if (XSS.room) {
                XSS.room.destruct();
                XSS.room = null;
            }
        };
        if (this.connected) {
            XSS.util.error('CONNECTION LOST', callback);
        } else {
            XSS.util.error('CANNOT CONNECT');
        }
    },

    /**
     * @param {string} name
     * @param {*=} data
     */
    emit: function(name, data) {
        var emit = [name];
        if (data) {
            emit.push(data);
        }
        this.connection.send(JSON.stringify(emit));
    },

    /**
     * @param {Object} ev
     */
    handleMessage: function(ev) {
        var data = JSON.parse(ev.data);
        XSS.event.trigger(data[0], data[1]);
    },

    /**
     * @private
     */
    _bindEvents: function() {
        XSS.event.on(CONST.EVENT_PING,  CONST.NS_SOCKET, this.clientPing.bind(this));
        XSS.event.on(CONST.EVENT_COMBI, CONST.NS_SOCKET, this.combinedEvents.bind(this));
    },

    /**
     * @param {number} time
     */
    clientPing: function(time) {
        XSS.socket.emit(CONST.EVENT_PONG, time);
    },

    /**
     * Combined package, delegate.
     * @param {Array.<Array>} data
     */
    combinedEvents: function(data) {
        for (var i = 0, m = data.length; i < m; i++) {
            XSS.event.trigger(data[i][0], data[i][1]);
        }
    }

};
