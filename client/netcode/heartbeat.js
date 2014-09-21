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
    this.pingSent = null;

    this.bindEvents();
    this.ping();

    this.interval = setInterval(
        this.ping.bind(this),
        xss.HEARTBEAT_INTERVAL_MS
    );
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

    ping: function() {
        if (this.pingSent) {
            // Last ping did not pong.
            return this.socket.timeout();
        }
        this.pingSent = +new Date();
        this.socket.emit(xss.EVENT_PING);
    },

    pong: function() {
        this.latency = (+this.lastResponse - this.pingSent) / 2;
        this.socket.emit(xss.EVENT_PONG);
        this.pingSent = null;
    }

};
