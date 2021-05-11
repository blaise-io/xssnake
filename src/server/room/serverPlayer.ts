import * as util from "util";
import { SE_PLAYER_COLLISION, SERVER_EVENT } from "../../shared/const";
import { AUDIENCE, NETCODE_MAP } from "../../shared/messages";
import { Player } from "../../shared/room/player";
import { Message, MessageConstructor, MessageId } from "../../shared/room/types";
import { Server, SocketClient } from "../netcode/server";
import { ServerRoom } from "./serverRoom";

export class ServerPlayer extends Player {
    room?: ServerRoom;

    constructor(public server: Server, public client: SocketClient) {
        super("<anon>");

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
        if (this.room) {
            this.room.emitter.emit(String(SE_PLAYER_COLLISION), [this]);
            this.room.emitter.emit(SERVER_EVENT.PLAYER_DISCONNECT, this);
        }
        if (this.client) {
            this.client.close(); // TODO: terminate()?
            // delete this.client; // TODO: not my job?
        }
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
