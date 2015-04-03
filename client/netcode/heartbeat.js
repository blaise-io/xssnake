'use strict';

/**
 * Pings server every N seconds.
 *
 * @param {xss.room.ClientSocketPlayer} player
 * @constructor
 */
xss.netcode.ClientHeartbeat = function(player) {
    this.latency = 0;
    this.player = player;
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
        this.player = null;
        clearInterval(this.interval);
        xss.event.off(xss.NC_PONG, xss.NS_HEARTBEAT);
    },

    bindEvents: function() {
        xss.event.on(xss.NC_PONG, xss.NS_HEARTBEAT, this.pong.bind(this));
    },

    ping: function() {
        if (this.pingSent) {
            // Last ping did not pong.
            // return this.player.timeout();
            console.error('this.player.timeout()');
        }
        this.pingSent = +new Date();
        this.player.emit(xss.NC_PING);
    },

    pong: function() {
        this.latency = (this.pingSent - new Date()) / 2;
        this.player.emit(xss.NC_PONG);
        this.pingSent = null;
    }

};
