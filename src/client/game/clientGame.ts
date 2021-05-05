/***
 * A Game does not start immediately after a new instance of the Game class
 * is created. It will show the snakes, level, name labels and directions
 * until ClientGame.start() is called.
 */
import { NC_SNAKE_CRASH } from "../../shared/const";
import { Level } from "../../shared/level/level";
import { NETCODE } from "../../shared/room/netcode";
import { SnakeUpdateClientMessage } from "../../shared/snakeMessages";
import { EV_GAME_TICK, NS } from "../const";
import { getLevelShapes } from "../level/levelUtil";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state";
import { SpawnableRegistry } from "./spawnableRegistry";

export class ClientGame {
    started: boolean;
    spawnables: SpawnableRegistry;

    constructor(public level: Level, public players: ClientPlayerRegistry) {
        this.players = this.updatePlayers(players);

        Object.assign(State.shapes, getLevelShapes(this.level));
        this.started = false;

        this.spawnables = new SpawnableRegistry();
        this.bindEvents();
    }

    destruct(): void {
        this.unbindEvents();

        this.spawnables.destruct();

        for (const k in Object.keys(getLevelShapes(this.level))) {
            State.shapes[k] = undefined;
        }

        delete this.level;
        delete this.players;
        delete this.spawnables;
    }

    start(): void {
        this.started = true;
        this.players.hideMeta();
        this.players.addControls();
    }

    bindEvents(): void {
        State.events.on(EV_GAME_TICK, NS.GAME, this.gameloop.bind(this));
        State.events.on(
            NETCODE.SNAKE_UPDATE_CLIENT,
            NS.GAME,
            (message: SnakeUpdateClientMessage) => {
                const clientIndex = message.playerIndex as number;
                const snake = this.players[clientIndex].snake;
                snake.direction = message.direction;
                snake.parts = message.parts;
                // If server updated snake, client prediction
                // of snake crashing was incorrect.
                delete snake.collision;
                State.events.on(NC_SNAKE_CRASH, NS.GAME, this.ncSetSnakesCrashed.bind(this));
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
        State.events.off(NETCODE.SNAKE_UPDATE_CLIENT, NS.GAME);
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
        Object.assign(State.shapes, getLevelShapes(level));
        // Apply changes in spawns.
        this.updatePlayers(this.players);
    }

    /**
     * TODO: Typing for things like these.
     * @param {Array} serializedCollisions
     */
    ncSetSnakesCrashed(serializedCollisions: any): void {
        for (let i = 0, m = serializedCollisions.length; i < m; i++) {
            const collision = serializedCollisions[i];
            const snake = this.players[collision[0]].snake;
            snake.parts = collision[1];
            snake.setCrashed();
        }
    }

    // Runs ~ every 16 ms (60 fps)
    gameloop(elapsed: number): void {
        // TODO: Fix gravity and animations
        const shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);

        if (this.started) {
            this.players.moveSnakes(this.level, elapsed, shift);
        }
    }
}
