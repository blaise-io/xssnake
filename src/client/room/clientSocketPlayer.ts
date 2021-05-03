import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../../shared/config";
import { DIRECTION } from "../../shared/const";
import { Message, MessageConstructor, NETCODE_MAP } from "../../shared/room/netcode";
import { NameMessage } from "../../shared/room/player";
import { SnakeMessage } from "../../shared/snake";
import { _, noop } from "../../shared/util";
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
            this.onmessage(event.data);
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
        this.send(new NameMessage(this.name));
    }

    onclose(): void {
        if (this.connected) {
            error(_("Connection lost"));
        } else {
            error(_("Cannot connect"));
        }
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
        console.info(
            "OUT",
            (message.constructor as MessageConstructor).id + message.netcode,
            message,
        );
        this.connection.send((message.constructor as MessageConstructor).id + message.netcode);
    }

    onmessage(message: string): void {
        if (message.length) {
            const netcodeId = message.substr(0, 2);
            const Message = NETCODE_MAP[netcodeId];
            if (Message) {
                console.log({ Message });
                const messageObj = Message.fromNetcode(message.substring(2));
                console.info("IN", message, messageObj);
                if (messageObj) {
                    State.events.trigger(Message.id, messageObj);
                }
            } else {
                console.error("UNREGISTERED", netcodeId, message);
            }
        }
    }

    emitSnake(direction: DIRECTION): void {
        this.send(SnakeMessage.fromSnake(this.snake, direction));
    }
}
