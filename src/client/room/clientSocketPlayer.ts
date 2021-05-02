import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../../shared/config";
import { DIRECTION } from "../../shared/const";
import { Message, MessageConstructor } from "../../shared/room/netcode";
import { NameMessage } from "../../shared/room/player";
import { SnakeMessage } from "../../shared/snake";
import { noop } from "../../shared/util";
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

    constructor(name: string, private onopenCallback: CallableFunction = noop) {
        super(name);

        this.local = true;
        this.room = undefined;
        this.connection = new WebSocket(`ws://${SERVER_HOST}:${SERVER_PORT}${SERVER_PATH}`);
        this.connection.onopen = () => {
            console.log(this);
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
        this.send(NameMessage.from(this.name));
        // TODO: reimplement heartbeat to see if server went away? can be done wih
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

    send(message: Message): void {
        console.info("OUT", (message.constructor as MessageConstructor).id + message.netcode);
        this.connection.send((message.constructor as MessageConstructor).id + message.netcode);
    }

    onmessage(event: MessageEvent): void {
        const data = JSON.parse(event.data);
        console.log("IN ", data);
        State.events.trigger(data[0], data.slice(1));
    }

    emitSnake(direction: DIRECTION): void {
        this.send(SnakeMessage.fromSnake(this.snake, direction));
    }
}
