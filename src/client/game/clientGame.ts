import { DIRECTION } from "../../shared/const";
import { Snake } from "../../shared/game/snake";
import { Level } from "../../shared/level/level";
import {
    SnakeCrashMessage,
    SnakeUpdateClientMessage,
    SnakeUpdateServerMessage,
} from "../../shared/game/snakeMessages";
import { PlayersMessage } from "../../shared/room/playerRegistry";
import { _, getRandomItemFrom } from "../../shared/util";
import { EV_GAME_TICK } from "../const";
import { getLevelShapes } from "../level/levelUtil";
import { eventx } from "../netcode/eventHandler";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state";
import { stylizeUpper } from "../util/clientUtil";
import { ClientSnake } from "./clientSnake";
import { SpawnableRegistry } from "./spawnableRegistry";

export class ClientGame {
    started = false;
    spawnables = new SpawnableRegistry();
    snakes: ClientSnake[];
    private eventContext = eventx.context;

    constructor(public level: Level, public players: ClientPlayerRegistry) {
        Object.assign(State.shapes, getLevelShapes(this.level));

        this.snakes = this.players.map(
            (p, index) => new ClientSnake(index, p.local, p.name, this.emit, level),
        );

        this.bindEvents();
    }

    destruct(): void {
        this.eventContext.destruct();
        this.level.destruct();
        this.spawnables.destruct();
        this.snakes.forEach((s) => s.destruct());
        this.snakes.length = 0;

        Object.keys(getLevelShapes(this.level)).forEach((k) => {
            delete State.shapes[k];
        });
    }

    start(): void {
        this.eventContext.off(PlayersMessage.id); // Don't reindex snakes.
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
        this.eventContext.on(EV_GAME_TICK, (delta: number) => {
            this.gameloop(delta);
        });

        this.eventContext.on(PlayersMessage.id, (message: PlayersMessage) => {
            while (this.snakes.length !== 0) {
                this.snakes.pop()?.destruct();
            }
            this.snakes.push(
                ...message.players.map(
                    (p, index) => new ClientSnake(index, p.local, p.name, this.emit, this.level),
                ),
            );
        });

        this.eventContext.on(SnakeUpdateClientMessage.id, (message: SnakeUpdateClientMessage) => {
            const snake = this.snakes[message.playerIndex];
            snake.direction = message.direction;
            snake.parts = message.parts;
            // If server updated snake, client prediction
            // of snake crashing was incorrect.
            delete snake.collision;
            this.eventContext.on(SnakeCrashMessage.id, (message: SnakeCrashMessage) => {
                for (let i = 0, m = message.collisions.length; i < m; i++) {
                    const collision = message.collisions[i];
                    const opponentSnake = this.snakes[collision.playerIndex];
                    opponentSnake.parts = collision.parts;
                    opponentSnake.setCrashed();
                }
            });
        });

        //State.events.on(NC_GAME_SPAWN,     ns, this._evSpawn.bind(this));
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
