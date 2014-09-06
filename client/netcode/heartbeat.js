'use strict';

/**
 * Pings server every N seconds.
 *
 * @param {xss.Socket} socket
 * @constructor
 */
xss.netcode.ClientHeartbeat = function(socket) {
    this.latency = 0;
    this.socket = socket;
    this.interval = setInterval(this.ping.bind(this), 7000);
    this.bindEvents();
    this.ping();
};

xss.netcode.ClientHeartbeat.prototype = {

    destruct: function() {
        this.socket = null;
        clearInterval(this.interval);
        xss.event.off(xss.EVENT_PONG, xss.NS_HEARTBEAT);
    },

    bindEvents: function() {
        xss.event.on(xss.EVENT_PONG, xss.NS_HEARTBEAT, this.pong.bind(this));
    },

    /**
     * @todo Disconnect when server does not respond within N ms.
     */
    ping: function() {
        this.pingSent = +new Date();
        this.socket.emit(xss.EVENT_PING);
    },

    pong: function() {
        this.latency = (+new Date() - this.pingSent) / 2;
        this.socket.emit(xss.EVENT_PONG);
    }

};
