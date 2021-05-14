import { DIRECTION } from "../../shared/const";
import { Snake } from "../../shared/game/snake";
import { Level } from "../../shared/level/level";
import {
    SnakeCrashMessage,
    SnakeUpdateClientMessage,
    SnakeUpdateServerMessage,
} from "../../shared/game/snakeMessages";
import { Spawnable, SpawnHitMessage, SpawnMessage } from "../../shared/level/spawnables";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import { _, eq, getRandomItemFrom } from "../../shared/util";
import { EV_GAME_TICK, NS } from "../const";
import { getLevelShapes } from "../level/levelUtil";
import { EventHandler } from "../netcode/eventHandler";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state";
import { explosion } from "../ui/clientShapeGenerator";
import { stylizeUpper, translateGame } from "../util/clientUtil";
import { ClientSnake } from "./clientSnake";
import { ClientSpawnable } from "./spawnable";

export class ClientGame {
    started = false;
    spawnables: ClientSpawnable[] = [];
    snakes: ClientSnake[];
    private eventHandler = new EventHandler();

    constructor(public level: Level, public players: ClientPlayerRegistry) {
        Object.assign(State.shapes, getLevelShapes(this.level));

        this.snakes = this.players.map(
            (p, index) => new ClientSnake(index, p.local, p.name, this.emit, level),
        );

        this.bindEvents();
    }

    destruct(): void {
        this.eventHandler.destruct();
        this.snakes.forEach((s) => s.destruct());
        this.snakes.length = 0;
        this.spawnables.forEach((s) => s.destruct());
        this.spawnables.length = 0;

        Object.keys(getLevelShapes(this.level)).forEach((k) => {
            delete State.shapes[k];
        });
        this.level.destruct();
    }

    start(): void {
        this.eventHandler.off(PlayersMessage.id); // Don't reindex snakes.
        this.started = true;

        this.localSnake?.addControls();
        this.localSnake?.showAction(
            stylizeUpper(getRandomItemFrom([_("¡Vamos!"), _("Let's goooo"), _("Gogogo!")])),
        );
    }

    get localSnake(): ClientSnake | undefined {
        return this.snakes.find((s) => s.local);
    }

    private emit = (snake: Snake, direction: DIRECTION) => {
        if (this.players.localPlayer.connected) {
            this.players.localPlayer.send(SnakeUpdateServerMessage.fromData(snake, direction));
        }
    };

    bindEvents(): void {
        this.eventHandler.on(EV_GAME_TICK, (delta: number) => {
            this.gameloop(delta);
        });

        this.eventHandler.on(PlayersMessage.id, (message: PlayersMessage) => {
            while (this.snakes.length !== 0) {
                this.snakes.pop()?.destruct();
            }
            this.snakes.push(
                ...message.players.map(
                    (p, index) => new ClientSnake(index, p.local, p.name, this.emit, this.level),
                ),
            );
        });

        this.eventHandler.on(SnakeUpdateClientMessage.id, (message: SnakeUpdateClientMessage) => {
            const snake = this.snakes[message.playerIndex];
            snake.direction = message.direction;
            snake.parts = message.parts;
            // If server updated snake, client prediction
            // of snake crashing was incorrect.
            delete snake.collision;
            this.eventHandler.on(SnakeCrashMessage.id, (message: SnakeCrashMessage) => {
                for (let i = 0, m = message.collisions.length; i < m; i++) {
                    const collision = message.collisions[i];
                    const opponentSnake = this.snakes[collision.playerIndex];
                    opponentSnake.parts = collision.parts;
                    opponentSnake.setCrashed();
                }
            });
        });

        this.eventHandler.on(SpawnMessage.id, (message: SpawnMessage) => {
            this.spawnables.push(
                new ClientSpawnable(
                    NS.SPAWN + this.spawnables.length,
                    message.type,
                    message.coordinate,
                ),
            );
        });

        this.eventHandler.on(SpawnHitMessage.id, (message: SpawnHitMessage) => {
            const spawnable = this.spawnables.find((s) => eq(s.coordinate, message.coordinate));
            if (!spawnable) {
                return;
            }

            explosion(translateGame(message.coordinate));
            spawnable.shape.flags.enabled = false;

            const powerup = (this.level.settings.powerupsEnabled.find(
                ([pu]) => (<{ id: number }>pu.prototype).id === message.id,
            ) as unknown) as typeof Spawnable | undefined;

            if (powerup) {
                // @ts-ignore
                const y = new powerup(level.settings, message.coordinate);
                y.applyEffects(this.players[message.playerIndex], this.snakes[message.playerIndex]);

                // TODO: Propagate effects.
            }
        });

        //State.events.on(NC_GAME_DESPAWN,   ns, this._evSpawnHit.bind(this));
        //
        //State.events.on(NC_SNAKE_SIZE,     ns, this._evSnakeSize.bind(this));
        //State.events.on(NC_SNAKE_CRASH,    ns, this._evSnakeCrash.bind(this));
        //State.events.on(NC_SNAKE_ACTION,   ns, this._evSnakeAction.bind(this));
        //State.events.on(NC_SNAKE_SPEED,    ns, this._evSnakeSpeed.bind(this));
    }

    // /**
    //  * @param {Array} serializedCollisions
    //  */
    // ncSetSnakesCrashed(serializedCollisions: Collision[]): void {
    //     for (let i = 0, m = serializedCollisions.length; i < m; i++) {
    //         const collision = serializedCollisions[i];
    //         const snake = this.players[collision[0]].snake;
    //         snake.parts = collision[1];
    //         snake.setCrashed();
    //     }
    // }

    // Runs ~ every 16 ms (60 fps)
    gameloop(elapsed: number): void {
        // TODO: Apply gravity and animations
        const shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);

        if (this.started) {
            this.moveSnakes(elapsed, shift);
        }
    }

    moveSnakes(elapsed: number, shift: Shift): void {
        this.snakes.forEach((snake) => {
            snake.handleNextMove(elapsed, shift, this.snakes);
            snake.shiftParts(shift);
        });
    }
}
