'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
xss.Socket = function(callback) {
    this.model = new xss.model.ClientSocket(callback);

    this.connection = new WebSocket(xss.SERVER_ENDPOINT);
    this.connection.onopen = this.model.connect.bind(this.model);
    this.connection.onclose = this._eventDisconnect.bind(this);
    this.connection.onmessage = this._dispatchMessage.bind(this);

    this._bindEvents();
};

xss.Socket.prototype = {

    destruct: function() {
        xss.event.off(xss.EVENT_PING, xss.NS_SOCKET);
        xss.event.off(xss.EVENT_COMBI, xss.NS_SOCKET);
        xss.event.off(xss.EVENT_PONG, xss.NS_SOCKET);
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

    _eventDisconnect: function() {
        var callback = function() {
            if (xss.room) {
                xss.room.destruct();
                xss.room = null;
            }
        };
        if (this.model.isConnected()) {
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
    _dispatchMessage: function(ev) {
        var data = JSON.parse(ev.data);
        xss.event.trigger(data[0], data[1]);
    },

    /**
     * @private
     */
    _bindEvents: function() {
        xss.event.on(xss.EVENT_PING,  xss.NS_SOCKET, this._clientPing.bind(this));
        xss.event.on(xss.EVENT_PONG,  xss.NS_SOCKET, this._clientPong.bind(this));
        xss.event.on(xss.EVENT_COMBI, xss.NS_SOCKET, this._combinedEvents.bind(this));
    },

    /**
     * @private
     */
    _clientPing: function() {
        xss.socket.emit(xss.EVENT_PING);
    },

    /**
     * @param {Array.<number>} data
     */
    _clientPong: function(data) {
        this.model.setPongData(data[0], data[1]);
    },

    /**
     * Combined package, delegate.
     * @param {Array.<Array>} data
     */
    _combinedEvents: function(data) {
        for (var i = 0, m = data.length; i < m; i++) {
            xss.event.trigger(data[i][0], data[i][1]);
        }
    }

};
