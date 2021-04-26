import { EventEmitter } from "events";
import { NC_PONG, NC_SNAKE_CRASH, NC_SNAKE_UPDATE, SE_PLAYER_COLLISION } from "../../shared/const";
import { Level } from "../../shared/level/level";
import { Snake } from "../../shared/snake";
import { average } from "../../shared/util";
import { SERVER_TICK_INTERVAL } from "../const";
import { ServerPlayer } from "../room/serverPlayer";
import { ServerPlayerRegistry } from "../room/serverPlayerRegistry";
import { ServerSnakeMove } from "../room/serverSnakeMove";
import { ServerItems } from "./serverItems";

export class ServerGame {
    private items: ServerItems;
    private tick: number;
    private lastTick: number;
    private averageLatencyInTicks: number;
    private tickInterval: NodeJS.Timeout;
    private started: boolean;

    constructor(
        private roomEmitter: EventEmitter,
        public level: Level,
        public players: ServerPlayerRegistry
    ) {
        this.items = new ServerItems(level, players);
        this.tick = 0;
        this.lastTick = +new Date();
        this.averageLatencyInTicks = 1;

        this.players.setSnakes(this.level);

        this.bindEvents();

        this.tickInterval = setInterval(this.handleTick.bind(this), SERVER_TICK_INTERVAL);
    }

    destruct() {
        clearInterval(this.tickInterval);
        this.unbindEvents();

        this.items.destruct();

        this.level = undefined;
        this.players = undefined;
        this.items = undefined;
    }

    bindEvents() {
        this.roomEmitter.on(String(NC_SNAKE_UPDATE), this.ncSnakeUpdate.bind(this));
        this.roomEmitter.on(String(NC_PONG), this.ncPong.bind(this));
    }

    unbindEvents() {
        this.roomEmitter.removeAllListeners(String(NC_SNAKE_UPDATE));
        this.roomEmitter.removeAllListeners(String(NC_PONG));
    }

    ncSnakeUpdate(dirtySnake: WebsocketData, player: ServerPlayer): void {
        const move = new ServerSnakeMove(dirtySnake, player);
        if (move.isValid()) {
            this.applyMove(player.snake, move);
            this.players.emit(NC_SNAKE_UPDATE, player.snake.serialize(), player);
        } else {
            this.players.emit(NC_SNAKE_UPDATE, player.snake.serialize());
        }
    }

    /**
     * Update average latency of all players in this room.
     * Affects tolerance of clients overriding server prediction.
     */
    ncPong() {
        this.averageLatencyInTicks = this.getAverageLatencyInTicks();
    }

    /**
     * @return {number}
     */
    getCrashedCount() {
        let count = 0;
        for (let i = 0, m = this.players.players.length; i < m; i++) {
            if (this.players.players[i].snake.crashed) {
                count++;
            }
        }
        return count;
    }

    /**
     * @return {number}
     */
    getAverageLatencyInTicks() {
        const latencies = [];
        for (let i = 0, m = this.players.players.length; i < m; i++) {
            latencies.push(this.players[i].client.latency);
        }
        return Math.round(average(latencies) / SERVER_TICK_INTERVAL);
    }

    handleTick() {
        const now = +new Date();
        this.gameloop(++this.tick, now - this.lastTick);
        this.lastTick = now;
    }

    gameloop(tick, elapsed) {
        const shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);
        this.handleCrashingPlayers(tick - this.averageLatencyInTicks);
        this.players.moveSnakes(tick, elapsed, shift);
    }

    handleCrashingPlayers(tick) {
        const collisions = [];
        const crashingPlayers = this.players.getCollisionsOnTick(tick);

        if (crashingPlayers.length) {
            for (let i = 0, m = crashingPlayers.length; i < m; i++) {
                const snake = crashingPlayers[i].snake;
                snake.crashed = true;
                collisions.push([snake.index, snake.parts, snake.collision.serialize()]);
            }

            // Emit crashed snakes.
            this.players.emit(NC_SNAKE_CRASH, collisions);

            // Let round manager know.
            this.roomEmitter.emit(String(SE_PLAYER_COLLISION), crashingPlayers);
        }
    }

    applyMove(snake: Snake, move: ServerSnakeMove): void {
        snake.direction = move.direction;
        snake.parts = move.parts;
        snake.trimParts();
    }
}
