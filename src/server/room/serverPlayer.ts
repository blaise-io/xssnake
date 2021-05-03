import * as util from "util";
import { NETCODE_SYNC_MS, SE_PLAYER_COLLISION } from "../../shared/const";
import { Level } from "../../shared/level/level";
import { AUDIENCE, NETCODE, NETCODE_MAP } from "../../shared/room/netcode";
import { Player } from "../../shared/room/player";
import { Message, MessageConstructor } from "../../shared/room/types";
import { ServerSnake } from "../game/serverSnake";
import { Server, SocketClient } from "../netcode/server";
import { ServerRoom } from "./serverRoom";

export class ServerPlayer extends Player {
    room: ServerRoom;
    snake: ServerSnake;

    constructor(public server: Server, public client: SocketClient) {
        super();
        this.client.on("message", this.onmessage.bind(this));
        this.client.on("close", () => {
            if (this.room && this.room.rounds && this.room.rounds.hasStarted()) {
                // Cannot destruct immediately, game expects player.
                // Room should destruct player at end of round, or
                // when all players in room have disconnected.
                // TODO: Always disconnect, later destruct
                this.disconnect();
            } else {
                this.destruct();
            }
        });

        this.connected = true;
    }

    destruct(): void {
        if (this.connected) {
            this.disconnect();
        }
        this.server = undefined;
        this.snake = undefined;
        this.room = undefined;
    }

    disconnect(): void {
        this.connected = false;
        if (this.snake) {
            this.snake.crashed = true;
            this.room.emitter.emit(String(SE_PLAYER_COLLISION), [this]);
        }
        // this.emitMessage(String(SE_PLAYER_DISCONNECT), this);
        if (this.client) {
            this.client.close(); // TODO: terminate()?
            this.client = undefined; // TODO: not my job?
        }
    }

    /**
     * Player sends a message to the server.
     */
    onmessage(message: string): void {
        if (message.length) {
            const netcodeId = message.substr(0, 2);
            const Message = NETCODE_MAP[netcodeId];
            if (Message) {
                const audience = Message.audience;
                if (audience & AUDIENCE.SERVER_ROOM || audience & AUDIENCE.SERVER_MATCHMAKING) {
                    const messageInstance = Message.fromNetcode(message.substring(2));
                    console.log("IN", messageInstance);
                    if (messageInstance) {
                        this.emitMessage(Message.id, audience, messageInstance);
                    }
                }
            }
        }
    }

    emitMessage(event: NETCODE, audience: AUDIENCE, message: Message): void {
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
                message.netcode,
                util.inspect(message, { showHidden: false, depth: 1 }),
            );
            this.client.send((message.constructor as MessageConstructor).id + message.netcode);
        }
    }

    /** @deprecated use `send` */
    emit(event: number, data?: WebsocketData): boolean {
        let emit;

        if (!this.connected) {
            return false;
        }

        if (this.client) {
            if (data) {
                emit = data.slice();
                emit.unshift(event);
            } else {
                emit = [event];
            }
            console.log("OUT (deprecated)", this.name, JSON.stringify(emit));
            this.client.send(JSON.stringify(emit), (error) => {
                if (error) {
                    console.error("Error sending message", error);
                }
            });
            return true;
        }

        return false;
    }

    /** @deprecated use `room` */
    broadcast(type: number, data: unknown): void {
        if (this.room) {
            this.room.players.emit(type, data, this);
        }
    }

    setSnake(index: number, level: Level): void {
        this.snake = new ServerSnake(index, level);
    }

    unsetSnake(): void {
        if (this.snake) {
            this.snake.destruct();
        }
    }

    getMaxMismatchesAllowed(): number {
        const latency = Math.min(NETCODE_SYNC_MS, this.client.latency);
        return Math.ceil(latency / this.snake.speed);
    }
}
