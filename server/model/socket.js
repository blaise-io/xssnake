'use strict';

/**
 * @constructor
 */
xss.model.Socket = function() {
    this._pingSent = null;
    /** @type {Array.<Array>} */
    this.emitBuffer = [];
    this.rtt = 0;
};

xss.model.Socket.prototype = {

    ping: function() {
        this._pingSent = new Date();
    },

    pong: function() {
        if (this._pingSent) {
            this.rtt = new Date() - this._pingSent;
            this._pingSent = null;
        }
        return this.rtt;
    }

};
