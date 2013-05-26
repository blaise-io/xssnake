/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Client, Room, Game, Spawnable, Powerup, Shape, StageFlow, SockJS*/
'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
function Socket(callback) {
    this.callback = callback;
    this.connected = false;

    this.connection = new SockJS(XSS.config.SERVER_ENDPOINT);
    this.connection.onopen = this._connect.bind(this);
    this.connection.onclose = this._disconnect.bind(this);
    this.connection.onmessage = this.handleMessage.bind(this);

    this._bindEvents();
}

Socket.prototype = {

    destruct: function() {
        XSS.pubsub.off(XSS.events.PING, XSS.NS_SOCKET);
        XSS.pubsub.off(XSS.events.COMBI, XSS.NS_SOCKET);
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
     * @param {string} type
     * @param {*=} data
     */
    emit: function(type, data) {
        this.connection.send(JSON.stringify([type, data]));
    },

    /**
     * @param {Object} ev
     */
    handleMessage: function(ev) {
        var data = JSON.parse(ev.data);
        XSS.pubsub.publish(data[0], data[1]);
    },

    /**
     * @private
     */
    _bindEvents: function() {
        XSS.pubsub.on(XSS.events.PING,  XSS.NS_SOCKET, this.clientPing.bind(this));
        XSS.pubsub.on(XSS.events.COMBI, XSS.NS_SOCKET, this.combinedEvents.bind(this));
    },

    /**
     * @param {number} time
     */
    clientPing: function(time) {
        XSS.socket.emit(XSS.events.PONG, time);
    },

    /**
     * Combined package, delegate.
     * @param {Array.<Array>} data
     */
    combinedEvents: function(data) {
        for (var i = 0, m = data.length; i < m; i++) {
            XSS.pubsub.publish(data[i][0], data[i][1]);
        }
    }

};
