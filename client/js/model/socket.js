'use strict';

/**
 * @param {Function} onConnectFn
 * @constructor
 */
xss.model.Socket = function(onConnectFn) {
    this.onConnectFn = onConnectFn || xss.util.noop;
    this._connected = false;
    this.time = null;
    this.rtt = null;
};

xss.model.Socket.prototype = {

    connect: function() {
        this._connected = true;
        this.onConnectFn();
    },

    isConnected: function() {
        return this._connected;
    }

};
