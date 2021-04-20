import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../../shared/config";
import { NC_PING, NC_PONG, NC_SNAKE_UPDATE, NETCODE_SYNC_MS } from "../../shared/const";
import { NS } from "../const";
import {
    COPY_SOCKET_CANNOT_CONNECT,
    COPY_SOCKET_CONNECTION_LOST,
    COPY_SOCKET_SERVER_AWAY,
} from "../copy/copy";
import { ClientState } from "../state/clientState";
import { error } from "../util/clientUtil";
import { ClientPlayer } from "./clientPlayer";
import { ClientRoom } from "./clientRoom";

export class ClientSocketPlayer extends ClientPlayer {
    private connection: WebSocket;
    room: ClientRoom;

    constructor(public onopenCallback: CallableFunction) {
        super("");

        this.local = true;
        this.room = null;
        this.connection = new WebSocket(`ws://${SERVER_HOST}:${SERVER_PORT}${SERVER_PATH}`);
        this.connection.onopen = this.onopen.bind(this);
        this.connection.onclose = this.onclose.bind(this);
        this.connection.onerror = this.onclose.bind(this);
        this.connection.onmessage = this.onmessage.bind(this);
    }

    destruct(): void {
        this.connected = false;
        this.connection.onopen = null;
        this.connection.onclose = null;
        this.connection.onerror = null;
        this.connection.onmessage = null;

        ClientState.events.off(NC_PING, NS.SOCKET);
        ClientState.events.off(NC_PONG, NS.SOCKET);

        // Close explicitly when CONNECTING or OPEN.
        if (this.connection.readyState <= 1) {
            this.connection.close();
        }

        if (this.room) {
            this.room.destruct();
        }
    }

    onopen(): void {
        this.connected = true;
        this.onopenCallback();
        // TODO: spam server to see if still connected?
    }

    onclose(): void {
        if (this.connected) {
            error(COPY_SOCKET_CONNECTION_LOST);
        } else {
            error(COPY_SOCKET_CANNOT_CONNECT);
        }
        this.destruct();
    }

    timeout(): void {
        error(COPY_SOCKET_SERVER_AWAY);
        this.destruct();
    }

    /**
     * Send messages as [event, eventdata1, eventdata2]
     */
    emit(event: number, data?: any): void {
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

    onmessage(ev: MessageEvent): void {
        const data = JSON.parse(ev.data);
        console.log("IN ", data);
        ClientState.events.trigger(data[0], data.slice(1));
    }

    emitFn(direction: number): void {
        const sync = Math.round(NETCODE_SYNC_MS / this.snake.speed);
        this.emit(NC_SNAKE_UPDATE, [direction, this.snake.parts.slice(-sync)]);
    }
}
