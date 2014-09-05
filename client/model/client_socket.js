'use strict';

/**
 * @param {Function} onConnectFn
 * @constructor
 */
xss.model.ClientSocket = function(onConnectFn) {
    this.onConnectFn = onConnectFn || xss.util.noop;
    this._connected = false;

    this.time = Number(new Date());
    this.timeOffset = 0;
    this.rtt = 0;
};

xss.model.ClientSocket.prototype = {

    connect: function() {
        this._connected = true;
        this.onConnectFn();
    },

    setPongData: function(serverTime, rtt) {
        this.time = serverTime;
        this.rtt = rtt;
        this.timeOffset = new Date() - (rtt / 2) - serverTime;
    },

    isConnected: function() {
        return this._connected;
    },

    toLocalTime: function(serverTime) {
        return serverTime + this.timeOffset;
    }

};
