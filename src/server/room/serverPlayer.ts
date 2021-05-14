import * as util from "util";
import { AUDIENCE, NETCODE_MAP } from "../../shared/messages";
import { Player } from "../../shared/room/player";
import { Message, MessageConstructor, MessageId } from "../../shared/room/types";
import { Server, SocketClient } from "../server";
import { ServerRoom } from "./serverRoom";

export class ServerPlayer extends Player {
    room?: ServerRoom;

    constructor(public server: Server, public client: SocketClient) {
        super("<anon>");

        // TODO: Move to Server, so Server can propagate down.
        //       New rule: if the consequences escalate, ensure we can propagate.

        this.client.on("message", this.onmessage.bind(this));
        this.client.on("close", () => {
            if (this.room && this.room.rounds && this.room.rounds.started) {
                // Cannot destruct immediately, game expects player.
                // Room should destruct player at end of round, or
                // when all players in room have disconnected.
                // TODO: Always disconnect, destruct during rounds (or when cleaning up room)
                this.disconnect();
            } else {
                this.destruct();
            }
        });

        this.connected = true;
    }

    destruct(): void {
        super.destruct();
        if (this.connected) {
            this.disconnect();
        }
        delete this.room;
    }

    disconnect(): void {
        this.connected = false;
        this.room?.removePlayer(this);
        this.client?.close();
    }

    /**
     * Player sends a message to the server.
     */
    onmessage(messageString: string): void {
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
                        console.log("IN", messageString, messageInstance);
                        this.emitMessage(Message.id, Message.audience, messageInstance);
                    }
                }
            } else {
                console.warn("Unregistered message", netcodeId, messageString);
            }
        }
    }

    emitMessage(event: MessageId, audience: AUDIENCE, message: Message): void {
        if (this.room && audience & AUDIENCE.SERVER_ROOM) {
            this.room.emitter.emit(event, this, message);
        } else if (audience & AUDIENCE.SERVER_MATCHMAKING) {
            this.server.emitter.emit(event, this, message);
        }
    }

    send(message: Message): void {
        if (ENV_DEBUG && !NETCODE_MAP[(<MessageConstructor>message.constructor).id]) {
            throw new Error("Message not registered: " + message);
        }
        if (this.connected && this.client) {
            console.log(
                "OUT",
                message.serialized,
                util.inspect(message, { showHidden: false, depth: 1 }),
            );
            this.client.send((<MessageConstructor>message.constructor).id + message.serialized);
        }
    }
}
