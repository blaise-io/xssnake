import { EventEmitter } from "events";
import { Spawner } from "../../shared/game/spawner";
import { Level } from "../../shared/level/level";
import {
    SnakeCrashMessage,
    SnakeUpdateClientMessage,
    SnakeUpdateServerMessage,
} from "../../shared/game/snakeMessages";
import { Spawnable, SpawnHitMessage, SpawnMessage } from "../../shared/level/spawnables";
import { average } from "../../shared/util";
import { SERVER_EVENT, SERVER_TICK_INTERVAL } from "../const";
import { ServerPlayer } from "../room/serverPlayer";
import { ServerPlayerRegistry } from "../room/serverPlayerRegistry";
import { ServerSnakeMove } from "../room/serverSnakeMove";
import { ServerSnake } from "./serverSnake";

export class ServerGame {
    private tick = 0;
    private lastTick = new Date();
    private tickInterval: NodeJS.Timeout;
    private started = false;
    private spawner: Spawner;
    private snakes: ServerSnake[] = [];

    constructor(
        private roomEmitter: EventEmitter,
        public level: Level,
        public players: ServerPlayerRegistry,
    ) {
        this.snakes = this.players.map((p, index) => new ServerSnake(p.id, index, level));

        this.spawner = new Spawner(this.level, this.snakes, (spawnable: Spawnable) => {
            this.players.send(new SpawnMessage(spawnable.type, spawnable.coordinate));
        });

        this.roomEmitter.on(
            SnakeUpdateServerMessage.id,
            (player: ServerPlayer, message: SnakeUpdateServerMessage) => {
                const snake = this.snakes[this.players.indexOf(player)];
                this.handleMove(
                    player,
                    new ServerSnakeMove(
                        message.parts,
                        message.direction,
                        snake,
                        player.socket.latency,
                    ),
                );
            },
        );

        this.tickInterval = setInterval(() => {
            this.handleTick();
        }, SERVER_TICK_INTERVAL);
    }

    destruct(): void {
        clearInterval(this.tickInterval);
        this.roomEmitter.removeAllListeners(SnakeUpdateServerMessage.id);
        this.spawner.destruct();
    }

    private handleMove(player: ServerPlayer, move: ServerSnakeMove) {
        if (move.isValid()) {
            move.snake.direction = move.direction;
            move.snake.parts = move.parts;
            move.snake.trimParts();
        }
        this.players.send(
            new SnakeUpdateClientMessage(player.id, move.direction, move.snake.parts),
            {
                exclude: move.isValid() ? player : undefined,
            },
        );
    }

    get averageLatencyInTicks(): number {
        const latencies = this.players.filter((p) => p.connected).map((p) => p.socket.latency);
        return latencies.length ? Math.round(average(latencies) / SERVER_TICK_INTERVAL) : 0;
    }

    handleTick(now = new Date()): void {
        this.gameloop(++this.tick, now.getTime() - this.lastTick.getTime());
        this.lastTick = now;
    }

    gameloop(tick: number, elapsed: number): void {
        const shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);

        this.detectCrashes(tick - this.averageLatencyInTicks);
        this.moveSnakes(tick, elapsed, shift);
    }

    detectCrashes(tick: number): void {
        const crashedSnakes = this.snakes.filter((s) => s.hasCollisionLteTick(tick));

        if (crashedSnakes.length) {
            for (let i = 0, m = crashedSnakes.length; i < m; i++) {
                crashedSnakes[i].crashed = true;
            }
            this.players.send(SnakeCrashMessage.fromSnakes(...crashedSnakes));
            this.roomEmitter.emit(SERVER_EVENT.PLAYER_COLISSION);
        }
    }

    moveSnakes(tick: number, elapsed: number, shift: Shift): void {
        this.snakes.forEach((snake) => {
            snake.handleNextMove(tick, elapsed, shift, this.snakes);
            snake.shiftParts(shift);
            const spawnable = this.spawner.handleSpawnHit(snake);
            const player = this.players.byId(snake.playerId);
            if (spawnable && player) {
                const spawnableId = (spawnable.constructor as typeof Spawnable).id;
                spawnable.applyEffects(player, snake);
                this.players.send(
                    new SpawnHitMessage(
                        player.id,
                        spawnableId,
                        spawnable.type,
                        spawnable.coordinate,
                    ),
                );
            }
        });
    }
}
