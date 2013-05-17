/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Client, Room, Game, Spawnable, Powerup, Shape, StageFlow, SockJS*/
'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
function Socket(callback) {
    this._bindEvents();
    this.connection = new SockJS(XSS.config.SERVER_ENDPOINT);
    this.connection.onopen = callback.bind(this);
    this.connection.onclose = this.disconnect.bind(this);
    this.connection.onmessage = this.handleMessage.bind(this);
}

Socket.prototype = {

    destruct: function() {
        var events = XSS.events, ns = XSS.NS_SOCKET;
        XSS.pubsub.off(events.PING, ns);
        XSS.pubsub.off(events.COMBI, ns);
        if (this.connection.readyState <= 1) {
            this.connection.close();
        }
    },

    /**
     * @param {string} type
     * @param {*} data
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
        var events = XSS.events, ns = XSS.NS_SOCKET;
        XSS.pubsub.on(events.PING,  ns, this.clientPing.bind(this));
        XSS.pubsub.on(events.COMBI, ns, this.combinedEvents.bind(this));
    },

    disconnect: function() {
        var callback = function() {
            if (XSS.room) {
                XSS.room.destruct();
            }
        };
        XSS.util.error('CONNECTION LOST', callback);
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
            this.handleMessage({
                data: data[i]
            });
        }
    }

};
