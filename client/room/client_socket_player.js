'use strict';

/**
 * Client-Server communication
 * @param onopenCallback {Function}
 * @extends {xss.room.ClientPlayer}
 * @constructor
 */
xss.room.ClientSocketPlayer = function(onopenCallback) {
    xss.room.ClientPlayer.call(this);

    this.onopenCallback = onopenCallback;
    this.local = true;

    /** @type {xss.room.ClientRoom} */
    this.room = null;

    // Vanilla websockets.
    this.connection = new WebSocket('ws://' + xss.SERVER_ENDPOINT);
    this.connection.onopen = this.onopen.bind(this);
    this.connection.onclose = this.onclose.bind(this);
    this.connection.onerror = this.onclose.bind(this);
    this.connection.onmessage = this.onmessage.bind(this);
};

xss.extend(xss.room.ClientSocketPlayer.prototype, xss.room.ClientPlayer.prototype);
xss.extend(xss.room.ClientSocketPlayer.prototype, /** @lends {xss.room.ClientSocketPlayer.prototype} */ {

    destruct: function() {
        this.connected = false;

        if (this.heartbeat) {
            this.heartbeat.destruct();
            this.heartbeat = null;
        }

        this.connection.onopen = null;
        this.connection.onclose = null;
        this.connection.onerror = null;
        this.connection.onmessage = null;

        xss.event.off(xss.NC_PING, xss.NS_SOCKET);
        xss.event.off(xss.NC_PONG, xss.NS_SOCKET);

        // Close explicitely when CONNECTING or OPEN.
        if (this.connection.readyState <= 1) {
            this.connection.close();
        }
    },

    onopen: function() {
        this.connected = true;
        this.onopenCallback();
        this.heartbeat = new xss.netcode.ClientHeartbeat(this);
    },

    onclose: function() {
        if (this.connected) {
            xss.util.error(xss.COPY_SOCKET_CONNECTION_LOST);
        } else {
            xss.util.error(xss.COPY_SOCKET_CANNOT_CONNECT);
        }
        this.destruct();
    },

    timeout: function() {
        xss.util.error(xss.COPY_SOCKET_SERVER_AWAY);
        this.destruct();
    },

    /**
     * Send messages as [event, eventdata1, eventdata2]
     * @param {number} event
     * @param {Array.<string|number>=} data
     */
    emit: function(event, data) {
        var emit;
        if (data) {
            emit = data;
            emit.unshift(event);
        } else {
            emit = [event];
        }
        console.log('OUT', emit);
        this.connection.send(JSON.stringify(emit));
    },

    /**
     * @param {Object} ev
     */
    onmessage: function(ev) {
        var data = JSON.parse(ev.data);
        console.log('IN ', data);
        xss.event.trigger(data[0], data.slice(1));
    }

});
