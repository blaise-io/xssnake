'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
xss.Socket = function(callback) {
    this.callback = callback;
    this.connected = false;

    this.connection = new SockJS(xss.SERVER_ENDPOINT);
    this.connection.onopen = this._connect.bind(this);
    this.connection.onclose = this._disconnect.bind(this);
    this.connection.onmessage = this.handleMessage.bind(this);

    this._bindEvents();
};

xss.Socket.prototype = {

    destruct: function() {
        xss.event.off(xss.EVENT_PING, xss.NS_SOCKET);
        xss.event.off(xss.EVENT_COMBI, xss.NS_SOCKET);
        if (xss.room) {
            xss.room.destruct();
            xss.room = null;
        }
        if (this.connection.readyState <= 1) {
            this.connection.onclose = xss.util.noop;
            this.connection.onmessage = xss.util.noop;
            this.connection.close();
        }
    },

    _connect: function() {
        this.connected = true;
        this.callback();
    },

    _disconnect: function() {
        var callback = function() {
            if (xss.room) {
                xss.room.destruct();
                xss.room = null;
            }
        };
        if (this.connected) {
            xss.util.error('CONNECTION LOST', callback);
        } else {
            xss.util.error('CANNOT CONNECT');
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
        xss.event.trigger(data[0], data[1]);
    },

    /**
     * @private
     */
    _bindEvents: function() {
        xss.event.on(xss.EVENT_PING,  xss.NS_SOCKET, this.clientPing.bind(this));
        xss.event.on(xss.EVENT_COMBI, xss.NS_SOCKET, this.combinedEvents.bind(this));
    },

    /**
     * @param {number} time
     */
    clientPing: function(time) {
        xss.socket.emit(xss.EVENT_PONG, time);
    },

    /**
     * Combined package, delegate.
     * @param {Array.<Array>} data
     */
    combinedEvents: function(data) {
        for (var i = 0, m = data.length; i < m; i++) {
            xss.event.trigger(data[i][0], data[i][1]);
        }
    }

};
