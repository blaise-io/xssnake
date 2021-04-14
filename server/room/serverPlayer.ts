import {
    NC_PLAYER_NAME,
    NETCODE_SYNC_MS,
    PLAYER_NAME_MINLENGTH,
    SE_PLAYER_COLLISION,
    SE_PLAYER_DISCONNECT,
} from "../../shared/const";
import { Level } from "../../shared/level/level";
import { Player } from "../../shared/room/player";
import { EventEmitter } from "events";
import { getRandomName } from "../../shared/util";
import { Sanitizer } from "../../shared/util/sanitizer";
import { ServerSnake } from "../game/serverSnake";
import { ServerHeartbeat } from "../netcode/heartbeat";
import { Message } from "../netcode/message";
import { Server } from "../netcode/server";
import { ServerRoom } from "./serverRoom";
import * as ws from "ws";

export class ServerPlayer extends Player {
    emitter: EventEmitter;
    private room: ServerRoom;
    private heartbeat: ServerHeartbeat;
    snake: ServerSnake;

    constructor(public server: Server, public connection: ws) {
        super();

        this.emitter = new EventEmitter();

        this.room = null;

        this.connection.on("message", this.onmessage.bind(this));
        this.connection.on("close", this.onclose.bind(this));

        this.connected = true;

        this.bindEvents();

        this.heartbeat = new ServerHeartbeat(this);
    }

    destruct(): void {
        if (this.connected) {
            this.disconnect();
        }
        this.unbindEvents();
        this.heartbeat.destruct(); // Awww.

        this.server = null;
        this.snake = null;
        this.room = null;
        this.heartbeat = null;
    }

    disconnect() {
        this.connected = false;
        if (this.snake) {
            this.snake.crashed = true;
            this.room.emitter.emit(String(SE_PLAYER_COLLISION), [this]);
        }
        this.emitMessage(SE_PLAYER_DISCONNECT, this);
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        this.emitter.removeAllListeners();
    }

    onmessage(jsonStr: string): void {
        const message = new Message(jsonStr);
        console.log("IN ", this.name, jsonStr);
        if (message.isClean) {
            this.emitMessage(message.event, message.data);
        }
    }

    emitMessage(event: number, data: unknown) {
        let playerEmits, roomEmits;

        playerEmits = this.emitter.emit(String(event), data);
        roomEmits = this.room && this.room.emitter.emit(String(event), data, this);

        // Global events (connecting, finding room).
        if (!playerEmits && !roomEmits) {
            this.server.emitter.emit(String(event), data, this);
        }
    }

    onclose() {
        if (this.room && this.room.rounds && this.room.rounds.hasStarted()) {
            // Cannot destruct immediately, game expects player.
            // Room should destruct player at end of round, or
            // when all players in room have disconnected.
            // TODO: Always disconnect, later destruct
            this.disconnect();
        } else {
            this.destruct();
        }
    }

    bindEvents(): void {
        this.emitter.on(String(NC_PLAYER_NAME), this.setName.bind(this));
    }

    unbindEvents(): void {
        this.emitter.removeAllListeners(String(NC_PLAYER_NAME));
    }

    /**
     * @param {?} dirtyNameArr
     * @return {string}
     */
    setName(dirtyNameArr): string {
        this.name = new Sanitizer(dirtyNameArr[0])
            .assertStringOfLength(PLAYER_NAME_MINLENGTH, 20)
            .getValueOr(getRandomName()) as string;
        return this.name;
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

        if (!this.heartbeat.isAlive()) {
            this.disconnect();
            return false;
        }

        if (this.connection) {
            if (data) {
                emit = data.slice();
                emit.unshift(event);
            } else {
                emit = [event];
            }
            console.log("OUT", this.name, JSON.stringify(emit));
            this.connection.send(JSON.stringify(emit), (error) => {
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

    getMaxMismatchesAllowed(): number {
        const latency = Math.min(NETCODE_SYNC_MS, this.heartbeat.latency);
        return Math.ceil(latency / this.snake.speed);
    }
}
