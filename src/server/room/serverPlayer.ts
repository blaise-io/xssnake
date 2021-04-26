import { NETCODE_SYNC_MS, SE_PLAYER_COLLISION, SE_PLAYER_DISCONNECT } from "../../shared/const";
import { Level } from "../../shared/level/level";
import { Player } from "../../shared/room/player";
import { EventEmitter } from "events";
import { ServerSnake } from "../game/serverSnake";
import { Message } from "../netcode/message";
import { Server, SocketClient } from "../netcode/server";
import { ServerRoom } from "./serverRoom";

export class ServerPlayer extends Player {
    emitterDeprecated: EventEmitter;
    room: ServerRoom = undefined;
    snake: ServerSnake;

    constructor(public server: Server, public client: SocketClient) {
        super();

        this.emitterDeprecated = new EventEmitter();

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

        // ping pong globally after starting the server
        // this.connection.ping();
        // this.connection.on("pong", () => {
        //     this.isAlive = true;
        // })

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
        this.emitMessage(SE_PLAYER_DISCONNECT, this);
        if (this.client) {
            this.client.close(); // TODO: terminate()?
            this.client = undefined; // TODO: not my job?
        }
        this.emitterDeprecated.removeAllListeners();
    }

    onmessage(jsonStr: string): void {
        /**
         * We have incoming json. All (ALL???) messages that can be handled
         * have to be registered here. Let's start with a simple ping/pong.
         *
         * Is the event registry dynamic?
         * Or static list and delegated?
         */

        const message = new Message(jsonStr);
        console.log("IN ", this.name, jsonStr);
        if (message.isClean) {
            this.emitMessage(message.event, message.data);
        }
    }

    emitMessage(event: number, data: unknown): void {
        const playerEmits = this.emitterDeprecated.emit(String(event), data);
        const roomEmits = this.room && this.room.emitter.emit(String(event), data, this);

        // Global events (connecting, finding room).
        if (!playerEmits && !roomEmits) {
            this.server.emitter.emit(String(event), data, this);
        }
    }

    /**
     * Send data to client
     * TODO: method accepts array.
     */
    emit(event: number, data?: WebsocketData): boolean {
        let emit;

        if (!this.connected) {
            return false;
        }

        // if (!this.heartbeat.isAlive()) {
        //     this.disconnect();
        //     return false;
        // }

        if (this.client) {
            if (data) {
                emit = data.slice();
                emit.unshift(event);
            } else {
                emit = [event];
            }
            console.log("OUT", this.name, JSON.stringify(emit));
            this.client.send(JSON.stringify(emit), (error) => {
                if (error) {
                    console.error("Error sending message", error);
                }
            });
            return true;
        }

        return false;
    }

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

    // TODO: This allows cheating by deliberately slowing down pongs?
    // would require hacking websocket internals though...
    getMaxMismatchesAllowed(): number {
        const latency = Math.min(NETCODE_SYNC_MS, this.client.latency);
        return Math.ceil(latency / this.snake.speed);
    }
}
