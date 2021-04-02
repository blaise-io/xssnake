/**
 * Client-Server communication
 * @param onopenCallback {Function}
 * @extends {room.ClientPlayer}
 * @constructor
 */
export class ClientSocketPlayer {
    constructor(onopenCallback) {
    room.ClientPlayer.call(this);

    this.onopenCallback = onopenCallback;
    this.local = true;

    /** @type {room.ClientRoom} */
    this.room = null;

    // Vanilla websockets.
    this.connection = new WebSocket('ws://' + SERVER_ENDPOINT);
    this.connection.onopen = this.onopen.bind(this);
    this.connection.onclose = this.onclose.bind(this);
    this.connection.onerror = this.onclose.bind(this);
    this.connection.onmessage = this.onmessage.bind(this);
};

extend(room.ClientSocketPlayer.prototype, room.ClientPlayer.prototype);
extend(room.ClientSocketPlayer.prototype, /** @lends {room.ClientSocketPlayer.prototype} */ {

    destruct() {
        this.connected = false;

        if (this.heartbeat) {
            this.heartbeat.destruct();
            this.heartbeat = null;
        }

        this.connection.onopen = null;
        this.connection.onclose = null;
        this.connection.onerror = null;
        this.connection.onmessage = null;

        State.events.off(NC_PING, NS_SOCKET);
        State.events.off(NC_PONG, NS_SOCKET);

        // Close explicitely when CONNECTING or OPEN.
        if (this.connection.readyState <= 1) {
            this.connection.close();
        }
    }    onopen() {
        this.connected = true;
        this.onopenCallback();
        this.heartbeat = new netcode.ClientHeartbeat(this);
    }    onclose() {
        if (this.connected) {
            error(COPY_SOCKET_CONNECTION_LOST);
        } else {
            error(COPY_SOCKET_CANNOT_CONNECT);
        }
        this.destruct();
    }    timeout() {
        error(COPY_SOCKET_SERVER_AWAY);
        this.destruct();
    }

    /**
     * Send messages as [event, eventdata1, eventdata2]
     * @param {number} event
     * @param {Array.<string|number>=} data
     */
    emit(event, data) {
        var emit;
        if (data) {
            emit = data;
            emit.unshift(event);
        } else {
            emit = [event];
        }
        console.log('OUT', emit);
        this.connection.send(JSON.stringify(emit));
    }

    /**
     * @param {Object} ev
     */
    onmessage(ev) {
        var data = JSON.parse(ev.data);
        console.log('IN ', data);
        State.events.trigger(data[0], data.slice(1));
    }

});
