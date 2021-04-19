/***
 * A Game does not start immediately after a new instance of the Game class
 * is created. It will show the snakes, level, name labels and directions
 * until ClientGame.start() is called.
 */
import { NC_SNAKE_CRASH, NC_SNAKE_UPDATE } from "../../shared/const";
import { Level } from "../../shared/level/level";
import { EV_GAME_TICK, NS } from "../const";
import { getLevelShapes } from "../level/levelUtil";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { ClientState } from "../state/clientState";
import { SpawnableRegistry } from "./spawnableRegistry";

export class ClientGame {
    started: boolean;
    spawnables: any;

    constructor(public level: Level, public players: ClientPlayerRegistry) {
        this.players = this.updatePlayers(players);

        Object.assign(ClientState.shapes, getLevelShapes(this.level));
        this.started = false;

        this.spawnables = new SpawnableRegistry();
        this.bindEvents();
    }

    start(): void {
        this.started = true;
        this.players.hideMeta();
        this.players.addControls();
    }

    bindEvents(): void {
        ClientState.events.on(EV_GAME_TICK, NS.GAME, this.gameloop.bind(this));
        ClientState.events.on(NC_SNAKE_UPDATE, NS.GAME, this.ncUpdateSnake.bind(this));
        ClientState.events.on(NC_SNAKE_CRASH, NS.GAME, this.ncSetSnakesCrashed.bind(this));

        //State.events.on(NC_GAME_SPAWN,     ns, this._evSpawn.bind(this));
        //State.events.on(NC_GAME_DESPAWN,   ns, this._evSpawnHit.bind(this));
        //
        //State.events.on(NC_SNAKE_SIZE,     ns, this._evSnakeSize.bind(this));
        //State.events.on(NC_SNAKE_CRASH,    ns, this._evSnakeCrash.bind(this));
        //State.events.on(NC_SNAKE_ACTION,   ns, this._evSnakeAction.bind(this));
        //State.events.on(NC_SNAKE_SPEED,    ns, this._evSnakeSpeed.bind(this));
    }

    unbindEvents(): void {
        ClientState.events.off(EV_GAME_TICK, NS.GAME);
        ClientState.events.off(NC_SNAKE_UPDATE, NS.GAME);
    }

    /**
     * Update game before round has started.
     * Don't call this mid-game.
     */
    updatePlayers(players: ClientPlayerRegistry): ClientPlayerRegistry {
        players.unsetSnakes();
        players.setSnakes(this.level);
        players.showMeta();
        return players;
    }

    updateLevel(level: Level): void {
        this.level.destruct();
        this.level = level;
        Object.assign(ClientState.shapes, getLevelShapes(this.level));
        // Apply changes in spawns.
        this.updatePlayers(this.players);
    }

    ncUpdateSnake(serializedSnake: [number, number, Coordinate[]]): void {
        const clientIndex = serializedSnake[0];
        const snake = this.players.players[clientIndex].snake;
        snake.deserialize([serializedSnake[1], serializedSnake[2]]);
    }

    /**
     * TODO: Typing for things like these.
     * @param {Array} serializedCollisions
     */
    ncSetSnakesCrashed(serializedCollisions: any): void {
        for (let i = 0, m = serializedCollisions.length; i < m; i++) {
            const collision = serializedCollisions[i];
            const snake = this.players.players[collision[0]].snake;
            snake.parts = collision[1];
            snake.setCrashed(collision[2]);
        }
    }

    /**
     * Runs ~ every 16 ms (60 fps)
     */
    gameloop(elapsed: number): void {
        // TODO: Fix gravity and animations
        const shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);

        if (this.started) {
            this.players.moveSnakes(this.level, elapsed, shift);
        }
    }

    destruct(): void {
        this.unbindEvents();

        this.spawnables.destruct();

        for (const k in Object.keys(getLevelShapes(this.level))) {
            ClientState.shapes[k] = null;
        }

        this.level = null;
        this.players = null;
        this.spawnables = null;
    }
}
