import {
    NC_PLAYER_NAME,
    NETCODE_SYNC_MS,
    PLAYER_NAME_MINLENGTH,
    SE_PLAYER_COLLISION,
    SE_PLAYER_DISCONNECT,
} from "../../shared/const";
import { Player } from "../../shared/room/player";
import { EventEmitter } from "events";
import { getRandomName } from "../../shared/util";
import { Sanitizer } from "../../shared/util/sanitizer";
import { ServerSnake } from "../game/serverSnake";
import { ServerHeartbeat } from "../netcode/heartbeat";
import { Server } from "../netcode/server";
import { ServerRoom } from "./serverRoom";
import { WebSocketServer } from "ws/lib/WebSocketServer";

export class ServerPlayer extends Player {
    private emitter: EventEmitter;
    private room: ServerRoom;
    private heartbeat: ServerHeartbeat;
    private snake: ServerSnake;

    constructor(public server: Server, public connection: WebSocketServer) {
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
            this.room.emitter.emit(SE_PLAYER_COLLISION, [this]);
        }
        this.emitMessage(SE_PLAYER_DISCONNECT, this);
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        this.emitter.removeAllListeners();
    }

    /**
     * @param {string} jsonStr
     */
    onmessage(jsonStr): void {
        const message = new netcode.Message(jsonStr);
        console.log("IN ", this.name, jsonStr);
        if (message.isClean) {
            this.emitMessage(message.event, message.data);
        }
    }

    emitMessage(event, data) {
        let playerEmits, roomEmits;

        playerEmits = this.emitter.emit(event, data);
        roomEmits = this.room && this.room.emitter.emit(event, data, this);

        // Global events (connecting, finding room).
        if (!playerEmits && !roomEmits) {
            this.server.emitter.emit(event, data, this);
        }
    }

    onclose() {
        if (this.room && this.room.rounds && this.room.rounds.hasStarted()) {
            // Cannot destruct immediately, game expects player.
            // Room should destruct player at end of round, or
            // when all players in room have disconnected.
            this.disconnect();
        } else {
            this.destruct();
        }
    }

    bindEvents() {
        this.emitter.on(NC_PLAYER_NAME, this.setName.bind(this));
    }

    unbindEvents() {
        this.emitter.removeAllListeners(NC_PLAYER_NAME);
    }

    /**
     * @param {?} dirtyNameArr
     * @return {string}
     */
    setName(dirtyNameArr): string {
        this.name = new Sanitizer(dirtyNameArr[0])
            .assertStringOfLength(PLAYER_NAME_MINLENGTH, 20)
            .getValueOr(getRandomName());
        return this.name;
    }

    /**
     * Send data to client
     * @param {number} event
     * @param {Array.<string|number|Array>=} data
     */
    emit(event, data): void {
        let emit;

        if (!this.connected) {
            return false;
        } else if (!this.heartbeat.isAlive()) {
            this.disconnect();
            return false;
        } else if (this.connection) {
            if (data) {
                emit = data.slice();
                emit.unshift(event);
            } else {
                emit = [event];
            }
            console.log("OUT", this.name, JSON.stringify(emit));
            this.connection.send(
                JSON.stringify(emit),
                function (error) {
                    if (error) {
                        console.error("Error sending message", error);
                    }
                }.bind(this)
            );
        }
    }

    /**
     * @param {string} type
     * @param {*=} data
     */
    broadcast(type, data): void {
        if (this.room) {
            this.room.players.emit(type, data, this);
        }
    }

    /**
     * @param {number} index
     * @param {level.Level} level
     */
    setSnake(index, level): void {
        this.snake = new ServerSnake(index, level);
    }

    unsetSnake() {
        if (this.snake) {
            this.snake.destruct();
        }
    }

    /**
     * @return {number}
     */
    getMaxMismatchesAllowed() {
        const latency = Math.min(NETCODE_SYNC_MS, this.heartbeat.latency);
        return Math.ceil(latency / this.snake.speed);
    }
}
