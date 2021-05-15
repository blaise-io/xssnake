import * as util from "util";
import { AUDIENCE, NETCODE_MAP } from "../../shared/messages";
import { Player } from "../../shared/room/player";
import { Message, MessageConstructor, MessageId } from "../../shared/room/types";
import { Socket } from "../server";
import { ServerRoom } from "./serverRoom";
import { EventEmitter } from "events";

export class ServerPlayer extends Player {
    room?: ServerRoom;

    constructor(public socket: Socket, private matchmakingEmitter: EventEmitter) {
        super(-1, "<anon>");
        this.socket.on("message", this.onmessage.bind(this));
        this.connected = true;
    }

    private onmessage(messageString: string): void {
        if (messageString.length) {
            const netcodeId = messageString.substr(0, 2);
            const Message = NETCODE_MAP[netcodeId];
            if (Message) {
                if (
                    Message.audience === AUDIENCE.SERVER_ROOM ||
                    Message.audience === AUDIENCE.SERVER_MATCHMAKING
                ) {
                    const messageInstance = Message.deserialize(messageString.substring(2));
                    if (messageInstance) {
                        console.debug("IN", messageString, messageInstance);
                        this.emitMessage(Message.id, Message.audience, messageInstance);
                    }
                }
            } else {
                console.warn("Unregistered message", netcodeId, messageString);
            }
        }
    }

    private emitMessage(event: MessageId, audience: AUDIENCE, message: Message): void {
        if (this.room && audience === AUDIENCE.SERVER_ROOM) {
            this.room.emitter.emit(event, this, message);
        } else if (audience === AUDIENCE.SERVER_MATCHMAKING) {
            this.matchmakingEmitter.emit(event, this, message);
        } else if (ENV_DEBUG) {
            console.warn("No audience for message", message);
        }
    }

    send(message: Message): void {
        if (ENV_DEBUG && !NETCODE_MAP[(<MessageConstructor>message.constructor).id]) {
            throw new Error("Message not registered: " + message);
        }
        if (this.connected && this.socket) {
            console.debug(
                "OUT",
                message.serialized,
                util.inspect(message, { showHidden: false, depth: 1 }),
            );
            this.socket.send((<MessageConstructor>message.constructor).id + message.serialized);
        }
    }
}
