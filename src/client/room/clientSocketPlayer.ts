import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../../shared/config";
import { AUDIENCE, NETCODE_MAP } from "../../shared/messages";
import { NameMessage } from "../../shared/room/playerMessages";
import { Message, MessageConstructor } from "../../shared/room/types";
import { _, noop } from "../../shared/util";
import { State } from "../state";
import { error } from "../util/clientUtil";
import { ClientPlayer } from "./clientPlayer";

export class ClientSocketPlayer extends ClientPlayer {
    private connection: WebSocket;

    constructor(name: string, private onopenCallback: CallableFunction = noop) {
        super(name);

        this.local = true;
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
            this.onmessage(event.data);
        };
    }

    destruct(): void {
        this.connected = false;
        this.connection.onopen = noop;
        this.connection.onclose = noop;
        this.connection.onerror = noop;
        this.connection.onmessage = noop;

        // Close explicitly when CONNECTING or OPEN.
        if (this.connection.readyState <= 1) {
            this.connection.close();
        }
    }

    onopen(): void {
        this.connected = true;
        this.onopenCallback(this);
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

    send(message: Message): void {
        const id = (message.constructor as MessageConstructor).id;
        console.info("OUT", id + message.serialized, message);
        this.connection.send(id + message.serialized);
    }

    onmessage(messageString: string): void {
        if (messageString.length) {
            const Message = NETCODE_MAP[messageString.substr(0, 2)];
            if (Message && Message.audience === AUDIENCE.CLIENT) {
                const message = Message.deserialize(messageString.substring(2));
                console.info("IN", messageString, message);
                if (message) {
                    State.events.trigger(Message.id, message);
                }
            } else {
                console.error("Unregistered message:", messageString.substr(0, 2));
            }
        }
    }
}
