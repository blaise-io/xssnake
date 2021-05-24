import { EventEmitter } from "events";
import { Spawner } from "../../shared/game/spawner";
import { Level } from "../../shared/level/level";
import {
    SnakeCrashMessage,
    SnakeUpdateClientMessage,
    SnakeUpdateServerMessage,
} from "../../shared/game/snakeMessages";
import { Spawnable, SpawnHitMessage, SpawnMessage } from "../../shared/level/spawnables";
import { RoundWrapupMessage } from "../../shared/room/roundMessages";
import { average } from "../../shared/util";
import { SERVER_EVENT, SERVER_TICK_INTERVAL } from "../const";
import { ServerPlayer } from "../room/serverPlayer";
import { ServerPlayerRegistry } from "../room/serverPlayerRegistry";
import { ServerSnakeMove } from "./serverSnakeMove";
import { ServerSnake } from "./serverSnake";

export class ServerGame {
    private tick = 0;
    private lastTick = new Date();
    private started = false;
    private snakes: ServerSnake[] = this.players.map(
        (p, index) => new ServerSnake(p.id, index, this.level),
    );

    private spawner = new Spawner(this.level, this.snakes, (spawnable: Spawnable) => {
        this.players.send(new SpawnMessage(spawnable.type, spawnable.coordinate));
    });

    private timers: NodeJS.Timeout[] = [
        setInterval(() => {
            this.handleTick();
        }, SERVER_TICK_INTERVAL),
    ];

    constructor(
        private readonly roomEmitter: EventEmitter,
        readonly level: Level,
        readonly players: ServerPlayerRegistry,
    ) {
        this.roomEmitter.on(
            SnakeUpdateServerMessage.id,
            (player: ServerPlayer, message: SnakeUpdateServerMessage) => {
                const snake = this.snakes[this.players.indexOf(player)];
                if (!snake.crashed) {
                    const move = new ServerSnakeMove(
                        message.parts,
                        message.direction,
                        snake,
                        player.socket.latency,
                    );
                    this.handleMove(player, move);
                }
            },
        );
    }

    destruct(): void {
        for (let i = 0, m = this.timers.length; i < m; i++) {
            clearInterval(this.timers[i]);
        }
        this.roomEmitter.removeAllListeners(SnakeUpdateServerMessage.id);
        this.spawner.destruct();
        this.snakes.length = 0;
    }

    private handleMove(player: ServerPlayer, move: ServerSnakeMove) {
        move.snake.direction = move.direction;

        if (move.valid) {
            move.snake.parts = move.parts;
            move.snake.trimParts();
            move.snake.limbo = false;
        }

        this.players.send(
            new SnakeUpdateClientMessage(player.id, move.snake.direction, move.snake.parts),
            { exclude: move.valid ? player : undefined },
        );
    }

    private get averageLatencyInTicks(): number {
        const latencies = this.players.filter((p) => p.connected).map((p) => p.socket.latency);
        return latencies.length ? Math.round(average(latencies) / SERVER_TICK_INTERVAL) : 0;
    }

    private handleTick(now = new Date()): void {
        this.gameloop(++this.tick, now.getTime() - this.lastTick.getTime());
        this.lastTick = now;
    }

    private gameloop(tick: number, elapsed: number): void {
        const shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);

        this.detectCrashes(tick - this.averageLatencyInTicks);
        this.moveSnakes(tick, elapsed, shift);
    }

    private detectCrashes(tick: number): void {
        const graceMs = 20;
        const limboSnakes = this.snakes.filter((s) => s.hasCollisionLteTick(tick));
        if (limboSnakes.length) {
            for (let i = 0, m = limboSnakes.length; i < m; i++) {
                limboSnakes[i].limbo = true;
            }
            this.timers.push(
                setTimeout(() => {
                    this.crashSnakesInLimbo(limboSnakes);
                }, Math.max(graceMs, this.averageLatencyInTicks)),
            );
        }
    }

    private crashSnakesInLimbo(limboSnakes: ServerSnake[]): void {
        const crashSnakes = limboSnakes.filter((s) => s.limbo);
        if (crashSnakes.length) {
            for (let i = 0, m = crashSnakes.length; i < m; i++) {
                crashSnakes[i].crashed = true;
            }
            this.players.send(SnakeCrashMessage.fromSnakes(...crashSnakes));
            this.roomEmitter.emit(SERVER_EVENT.PLAYER_COLISSION);
            this.detectAndWrapupRound();
        }
    }

    private detectAndWrapupRound() {
        const survivors = this.snakes.filter((s) => !s.crashed);
        if (this.players.length === 1 || survivors.length <= 1) {
            this.roomEmitter.emit(
                RoundWrapupMessage.id,
                new RoundWrapupMessage(survivors[0]?.playerId),
            );
        }
    }

    private moveSnakes(tick: number, elapsed: number, shift: Shift): void {
        for (let i = 0, m = this.snakes.length; i < m; i++) {
            const snake = this.snakes[i];

            if (!snake.limbo) {
                snake.handleNextMove(tick, elapsed, shift, this.snakes);
                snake.shiftParts(shift);
                const spawnable = this.spawner.handleSpawnHit(snake);
                if (spawnable) {
                    this.handleSpawnableHit(spawnable, snake);
                }
            }
        }
    }

    private handleSpawnableHit(spawnable: Spawnable, snake: ServerSnake): void {
        const spawnableId = (spawnable.constructor as typeof Spawnable).id;
        const player = this.players.byId(snake.playerId);
        if (player) {
            spawnable.applyEffects(player, snake);
            this.players.send(
                new SpawnHitMessage(player.id, spawnableId, spawnable.type, spawnable.coordinate),
            );
        }
    }
}
