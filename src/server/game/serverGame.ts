import { EventEmitter } from "events";
import { SE_PLAYER_COLLISION } from "../../shared/const";
import { Level } from "../../shared/level/level";
import { SnakeCrashMessage, SnakeUpdateServerMessage } from "../../shared/game/snakeMessages";
import { average } from "../../shared/util";
import { SERVER_TICK_INTERVAL } from "../const";
import { ServerPlayer } from "../room/serverPlayer";
import { ServerPlayerRegistry } from "../room/serverPlayerRegistry";
import { ServerSnakeMove } from "../room/serverSnakeMove";
import { ServerSnake } from "./serverSnake";

export class ServerGame {
    // private items: ServerItems;
    private tick: number;
    private lastTick: number;
    private tickInterval: NodeJS.Timeout;
    private started: boolean;

    constructor(
        private roomEmitter: EventEmitter,
        public level: Level,
        public players: ServerPlayerRegistry,
    ) {
        // this.items = new ServerItems(level, players);
        this.tick = 0;
        this.lastTick = +new Date();

        this.players.setSnakes(this.level);

        this.bindEvents();

        this.tickInterval = setInterval(this.handleTick.bind(this), SERVER_TICK_INTERVAL);
    }

    destruct(): void {
        clearInterval(this.tickInterval);
        this.unbindEvents();

        // this.items.destruct();

        delete this.level;
        delete this.players;
        // delete this.items;
    }

    bindEvents(): void {
        this.roomEmitter.on(
            SnakeUpdateServerMessage.id,
            (player: ServerPlayer, message: SnakeUpdateServerMessage) => {
                this.handleMove(new ServerSnakeMove(message.parts, message.direction, player));
            },
        );
    }

    unbindEvents(): void {
        this.roomEmitter.removeAllListeners(SnakeUpdateServerMessage.id);
    }

    private handleMove(move: ServerSnakeMove) {
        const snake = move.player.snake;
        if (move.isValid()) {
            snake.direction = move.direction;
            snake.parts = move.parts;
            snake.trimParts();
        }
        this.players.send(
            SnakeUpdateServerMessage.fromData(snake, this.players.indexOf(move.player)),
            { exclude: move.isValid() ? move.player : undefined },
        );
    }

    get averageLatencyInTicks(): number {
        const latencies = this.players.filter((p) => p.connected).map((p) => p.client.latency);
        return latencies.length ? Math.round(average(latencies) / SERVER_TICK_INTERVAL) : 0;
    }

    handleTick(): void {
        const now = +new Date();
        this.gameloop(++this.tick, now - this.lastTick);
        this.lastTick = now;
    }

    gameloop(tick: number, elapsed: number): void {
        const shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);
        this.handleCrashingPlayers(tick - this.averageLatencyInTicks);
        this.players.moveSnakes(tick, elapsed, shift);
    }

    handleCrashingPlayers(tick: number): void {
        const snakes: ServerSnake[] = [];
        const crashingPlayers = this.players.getCollisionsOnTick(tick);

        if (crashingPlayers.length) {
            for (let i = 0, m = crashingPlayers.length; i < m; i++) {
                const snake = crashingPlayers[i].snake;
                snake.crashed = true;
                snakes.push(snake);
            }

            // Emit crashed snakes.
            this.players.send(SnakeCrashMessage.fromSnakes(...snakes));

            // Let round manager know.
            this.roomEmitter.emit(String(SE_PLAYER_COLLISION), crashingPlayers);
        }
    }
}
