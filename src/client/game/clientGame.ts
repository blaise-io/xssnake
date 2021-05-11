/***
 * A Game does not start immediately after a new instance of the Game class
 * is created. It will show the snakes, level, name labels and directions
 * until ClientGame.start() is called.
 */
import { DIRECTION } from "../../shared/const";
import { Snake } from "../../shared/game/snake";
import { Level } from "../../shared/level/level";
import {
    SnakeCrashMessage,
    SnakeUpdateClientMessage,
    SnakeUpdateServerMessage,
} from "../../shared/game/snakeMessages";
import { _ } from "../../shared/util";
import { EV_GAME_TICK, NS } from "../const";
import { getLevelShapes } from "../level/levelUtil";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state";
import { ClientSnake } from "./clientSnake";
import { SpawnableRegistry } from "./spawnableRegistry";

export class ClientGame {
    started = false;
    spawnables = new SpawnableRegistry();
    snakes: ClientSnake[];

    private emit = (snake: Snake, direction: DIRECTION) => {
        this.players.localPlayer.send(SnakeUpdateServerMessage.fromData(snake, direction));
    };

    constructor(public level: Level, public players: ClientPlayerRegistry) {
        Object.assign(State.shapes, getLevelShapes(this.level));

        this.snakes = this.players.map(
            (p, index) => new ClientSnake(index, p.local, p.name, this.emit, level),
        );

        this.showMeta();
        this.bindEvents();
    }

    destruct(): void {
        this.unbindEvents();

        this.spawnables.destruct();
        this.snakes.length = 0;

        for (const k in Object.keys(getLevelShapes(this.level))) {
            delete State.shapes[k];
        }

        // delete this.level;
        // delete this.players;
        // delete this.spawnables;
    }

    start(): void {
        this.started = true;
        this.hideName();
        this.localSnake?.addControls();
        this.localSnake?.showAction(_("¡Vamos!"));
    }

    get localSnake(): ClientSnake | undefined {
        return this.snakes.find((s) => s.local);
    }

    bindEvents(): void {
        State.events.on(EV_GAME_TICK, NS.GAME, this.gameloop.bind(this));
        State.events.on(
            SnakeUpdateClientMessage.id,
            NS.GAME,
            (message: SnakeUpdateClientMessage) => {
                const snake = this.snakes[message.playerIndex];
                snake.direction = message.direction;
                snake.parts = message.parts;
                // If server updated snake, client prediction
                // of snake crashing was incorrect.
                delete snake.collision;
                State.events.on(SnakeCrashMessage.id, NS.GAME, (message: SnakeCrashMessage) => {
                    for (let i = 0, m = message.colissions.length; i < m; i++) {
                        const collision = message.colissions[i];
                        const opponentSnake = this.snakes[collision.playerIndex];
                        opponentSnake.parts = collision.parts;
                        opponentSnake.setCrashed();
                    }
                });
            },
        );

        //State.events.on(NC_GAME_SPAWN,     ns, this._evSpawn.bind(this));
        //State.events.on(NC_GAME_DESPAWN,   ns, this._evSpawnHit.bind(this));
        //
        //State.events.on(NC_SNAKE_SIZE,     ns, this._evSnakeSize.bind(this));
        //State.events.on(NC_SNAKE_CRASH,    ns, this._evSnakeCrash.bind(this));
        //State.events.on(NC_SNAKE_ACTION,   ns, this._evSnakeAction.bind(this));
        //State.events.on(NC_SNAKE_SPEED,    ns, this._evSnakeSpeed.bind(this));
    }

    unbindEvents(): void {
        State.events.off(EV_GAME_TICK, NS.GAME);
        State.events.off(SnakeUpdateClientMessage.id, NS.GAME);
    }

    // /**
    //  * TODO: Typing for things like these.
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
        // TODO: Fix gravity and animations
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

    showMeta(): void {
        for (let i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].showName();
        }
        this.localSnake?.showDirection();
    }

    hideName(): void {
        for (let i = 0, m = this.snakes.length; i < m; i++) {
            this.snakes[i].removeNameAndDirection();
        }
    }
}
