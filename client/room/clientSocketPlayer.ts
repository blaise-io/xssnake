import { NC_PING, NC_PONG } from "../../shared/const";
import { NS_SOCKET } from "../const";
import { COPY_SOCKET_CANNOT_CONNECT, COPY_SOCKET_CONNECTION_LOST, COPY_SOCKET_SERVER_AWAY } from "../copy/copy";
import { ClientHeartbeat } from "../netcode/heartbeat";
import { State } from "../state/state";
import { error } from "../util/clientUtil";
import { ClientPlayer } from "./clientPlayer";
import { ClientRoom } from "./clientRoom";

export class ClientSocketPlayer extends ClientPlayer {
    private SERVER_ENDPOINT: string;
    private connection: WebSocket;
    public room: ClientRoom;
    private heartbeat: ClientHeartbeat;

    constructor(public onopenCallback) {
        super("");

        this.local = true;

        this.room = null;

        // Vanilla websockets.
        this.connection = new WebSocket("ws://" + this.SERVER_ENDPOINT);
        this.connection.onopen = this.onopen.bind(this);
        this.connection.onclose = this.onclose.bind(this);
        this.connection.onerror = this.onclose.bind(this);
        this.connection.onmessage = this.onmessage.bind(this);
    }

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

        // Close explicitly when CONNECTING or OPEN.
        if (this.connection.readyState <= 1) {
            this.connection.close();
        }
    }

    onopen() {
        this.connected = true;
        this.onopenCallback();
        this.heartbeat = new ClientHeartbeat(this);
    }

    onclose() {
        if (this.connected) {
            error(COPY_SOCKET_CONNECTION_LOST);
        } else {
            error(COPY_SOCKET_CANNOT_CONNECT);
        }
        this.destruct();
    }

    timeout() {
        error(COPY_SOCKET_SERVER_AWAY);
        this.destruct();
    }

    /**
     * Send messages as [event, eventdata1, eventdata2]
     * @param {number} event
     * @param {Array.<string|number>=} data
     */
    emit(event, data?:(string|number)[]) {
        let emit;
        if (data) {
            emit = data;
            emit.unshift(event);
        } else {
            emit = [event];
        }
        console.log("OUT", emit);
        this.connection.send(JSON.stringify(emit));
    }

    /**
     * @param {Object} ev
     */
    onmessage(ev)): void {
        const data = JSON.parse(ev.data);
        console.log("IN ", data);
        State.events.trigger(data[0], data.slice(1));
    }

}
