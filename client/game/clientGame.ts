/***
 * Game
 *
 * A Game does not start immediately after a new instance of the Game class
 * is created. It will show the snakes, level, name labels and directions
 * until ClientGame.start() is called.
 *
 * @param {level.Level} level
 * @param {room.ClientPlayerRegistry} players
 *
 * @constructor
 */
import { NC_SNAKE_CRASH, NC_SNAKE_UPDATE } from "../../shared/const";
import { Level } from "../../shared/level/level";
import { EV_GAME_TICK, NS_GAME } from "../const";
import { State } from "../state/state";

export class ClientGame {
    players: any;
    started: boolean;
    spawnables: any;

    constructor(public level: Level, players) {
        this.players = this.updatePlayers(players);

        this.level.paint();
        this.started = false;

        this.spawnables = new SpawnableRegistry();
        this.bindEvents();
    }


    destruct() {
        this.unbindEvents();

        this.spawnables.destruct();

        this.level = null;
        this.players = null;
        this.spawnables = null;
    }

    bindEvents() {
        State.events.on(EV_GAME_TICK, NS_GAME, this.gameloop.bind(this));
        State.events.on(NC_SNAKE_UPDATE, NS_GAME, this.ncUpdateSnake.bind(this));
        State.events.on(NC_SNAKE_CRASH, NS_GAME, this.ncSetSnakesCrashed.bind(this));

        //State.events.on(NC_GAME_SPAWN,     ns, this._evSpawn.bind(this));
        //State.events.on(NC_GAME_DESPAWN,   ns, this._evSpawnHit.bind(this));
        //
        //State.events.on(NC_SNAKE_SIZE,     ns, this._evSnakeSize.bind(this));
        //State.events.on(NC_SNAKE_CRASH,    ns, this._evSnakeCrash.bind(this));
        //State.events.on(NC_SNAKE_ACTION,   ns, this._evSnakeAction.bind(this));
        //State.events.on(NC_SNAKE_SPEED,    ns, this._evSnakeSpeed.bind(this));
    }

    unbindEvents() {
        State.events.off(EV_GAME_TICK, NS_GAME);
        State.events.off(NC_SNAKE_UPDATE, NS_GAME);
    }

    /**
     * Update game before round has started.
     * Don't call this mid-game.
     * @param {room.ClientPlayerRegistry} players
     */
    updatePlayers(players) {
        players.unsetSnakes();
        players.setSnakes(this.level);
        players.showMeta();
        return players;
    }

    /**
     * @param {level.Level} level
     */
    updateLevel(level) {
        this.level.destruct();
        this.level = level;
        this.level.paint();
        // Apply changes in spawns.
        this.updatePlayers(this.players);
    }

    /**
     * @param {Array} serializedSnake
     */
    ncUpdateSnake(serializedSnake) {
        const clientIndex = serializedSnake.shift();
        this.players.players[clientIndex].snake.deserialize(serializedSnake);
    }

    /**
     * @param {Array} serializedCollisions
     */
    ncSetSnakesCrashed(serializedCollisions) {
        for (let i = 0, m = serializedCollisions.length; i < m; i++) {
            var snake; const collision = serializedCollisions[i];
            snake = this.players.players[collision[0]].snake;
            snake.parts = collision[1];
            snake.setCrashed(collision[2]);
        }
    }

    /**
     * Runs ~ every 16 ms (60 fps)
     * @param {number} elapsed
     */
    gameloop(elapsed) {
        const shift = this.level.gravity.getShift(elapsed);
        this.level.animations.update(elapsed, this.started);

        if (this.started) {
            this.players.moveSnakes(this.level, elapsed, shift);
        }
    }

    /**
     * Start game.
     */
    start() {
        this.started = true;
        this.players.hideMeta();
        this.players.addControls();
    }
}
