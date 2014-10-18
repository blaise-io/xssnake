'use strict';

/**
 * @param {xss.room.ServerPlayer} player
 * @todo Disconnect client when client no longer sends ping messages.
 * @constructor
 */
xss.netcode.ServerHeartbeat = function(player) {
    this.latency = 0;
    this.pingSent = null;
    this.player = player;
    this.bindEvents();
};

xss.netcode.ServerHeartbeat.prototype = {

    destruct: function() {
        this.player.emitter.removeAllListeners([
            xss.EVENT_PING, xss.EVENT_PONG
        ]);
        this.player = null;
    },

    isAlive: function() {
        var pingSent = this.pingSent || +new Date();
        return +new Date() - pingSent < xss.HEARTBEAT_INTERVAL_MS * 2;
    },

    bindEvents: function() {
       this.player.emitter.on(xss.EVENT_PING, this.ping.bind(this));
       this.player.emitter.on(xss.EVENT_PONG, this.pong.bind(this));
    },

    ping: function() {
        this.pingSent = +new Date();
        this.player.emit(xss.EVENT_PONG);
    },

    pong: function() {
        this.latency = (+new Date() - this.pingSent) / 2;
    }

};
