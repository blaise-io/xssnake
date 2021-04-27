import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../../shared/config";
import { NC_PING, NC_PONG } from "../../shared/const";
import { Message, MessageConstructor } from "../../shared/room/netcode";
import { SnakeMessage } from "../../shared/snake";
import { NS } from "../const";
import {
    COPY_SOCKET_CANNOT_CONNECT,
    COPY_SOCKET_CONNECTION_LOST,
    COPY_SOCKET_SERVER_AWAY,
} from "../copy/copy";
import { State } from "../state";
import { error } from "../util/clientUtil";
import { ClientPlayer } from "./clientPlayer";
import { ClientRoom } from "./clientRoom";

export class ClientSocketPlayer extends ClientPlayer {
    private connection: WebSocket;
    room: ClientRoom;

    constructor(name: string, private onopenCallback: CallableFunction) {
        super("");

        this.local = true;
        this.room = undefined;
        this.connection = new WebSocket(`ws://${SERVER_HOST}:${SERVER_PORT}${SERVER_PATH}`);
        this.connection.onopen = () => {
            this.onopen();
        };
        this.connection.onclose = () => {
            this.onclose();
        };
        this.connection.onerror = () => {
            this.onclose();
        };
        this.connection.onmessage = (event: MessageEvent) => {
            this.onmessage(event);
        };
    }

    destruct(): void {
        this.connected = false;
        this.connection.onopen = undefined;
        this.connection.onclose = undefined;
        this.connection.onerror = undefined;
        this.connection.onmessage = undefined;

        State.events.off(NC_PING, NS.SOCKET);
        State.events.off(NC_PONG, NS.SOCKET);

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
     * @deprecated
     */
    emitDeprecated(event: number, data?: any): void {
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

    emit(message: Message): void {
        console.info("OUT", (message.constructor as MessageConstructor).id + message.netcode);
        this.connection.send((message.constructor as MessageConstructor).id + message.netcode);
    }

    onmessage(event: MessageEvent): void {
        const data = JSON.parse(event.data);
        console.log("IN ", data);
        State.events.trigger(data[0], data.slice(1));
    }

    emitSnake(direction: number): void {
        this.emit(SnakeMessage.fromSnake(this.snake, direction));
    }
}
