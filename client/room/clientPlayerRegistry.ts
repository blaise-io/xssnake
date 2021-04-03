import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { NS_SNAKE } from "../const";
import { State } from "../state/state";
import { ClientPlayer } from "./clientPlayer";

export class ClientPlayerRegistry extends PlayerRegistry {
    localPlayer: ClientPlayer;
    players: ClientPlayer[];

    constructor() {
        super();
        this.localPlayer = null;
    }

    destruct() {
        this.localPlayer = null;
        super.destruct();
    }

    /**
     * @param {room.ClientPlayerRegistry} playerRegistry
     */
    clone(playerRegistry) {
        this.players = playerRegistry.players.slice();
        this.localPlayer = playerRegistry.localPlayer;
    }

    /**
     * @param {Array.<Array>} serializedPlayers
     */
    deserialize(serializedPlayers) {
        for (let i = 0, m = serializedPlayers.length; i < m; i++) {
            this.players[i].deserialize(serializedPlayers[i]);
        }
    }

    /**
     * @param {Array.<Array>} serializedPlayers
     */
    reconstruct(serializedPlayers) {
        this.destruct();
        for (let i = 0, m = serializedPlayers.length; i < m; i++) {
            this.reconstructPlayer(serializedPlayers[i]);
        }
    }

    /**
     * @param {Array} serialized
     */
    reconstructPlayer(serialized) {
        let player = new ClientPlayer();
        player.deserialize(serialized);

        if (player.local) {
            State.player.deserialize(serialized);
            player = this.localPlayer = State.player;
        }

        this.add(player);
    }

    /**
     * @return {Array.<string>}
     */
    getNames() {
        const names = [];
        for (let i = 0, m = this.players.length; i < m; i++) {
            names.push(this.players[i].name);
        }
        return names;
    }

    /**
     * @param {Array.<number>} scores
     */
    setScores(scores) {
        for (let i = 0, m = scores.length; i < m; i++) {
            this.players[i].score = scores[i];
        }
    }

    /**
     * @param {level.Level} level
     */
    setSnakes(level) {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].setSnake(i, level);
        }
    }

    unsetSnakes() {
        // There may still be a few shapes lingering around.
        this.clearSnakeShapes();
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].unsetSnake();
        }
    }

    clearSnakeShapes() {
        const keys = Object.keys(State.shapes);
        for (let i = 0, m = keys.length; i < m; i++) {
            if (keys[i].substr(0, NS_SNAKE.length) === NS_SNAKE) {
                State.shapes[keys[i]] = null;
            }
        }
    }

    /**
     * @param {level.Level} level
     * @param {number} elapsed
     * @param {Shift} shift
     */
    moveSnakes(level, elapsed, shift) {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.handleNextMove(level, elapsed, shift, this.players);
            this.players[i].snake.shiftParts(shift);
        }
    }

    showMeta() {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.showName();
        }
        if (this.localPlayer) {
            this.localPlayer.snake.showDirection();
        }
    }

    hideMeta() {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.removeNameAndDirection();
        }
    }

    addControls() {
        if (this.localPlayer) {
            this.localPlayer.snake.addControls();
        }
    }

    /**
     * @param {room.ClientPlayerRegistry} prevPlayers
     * @return {string|null}
     */
    getQuitName(prevPlayers) {
        let prevNames; let newNames;
        prevNames = prevPlayers.getNames();
        newNames = this.getNames();

        for (let i = 0, m = prevNames.length; i < m; i++) {
            if (-1 === newNames.indexOf(prevNames[i])) {
                return prevNames[i];
            }
        }

        return null;
    }

    /**
     * Assume last player that joined to be last item in players array.
     * @return {string|null}
     */
    getJoinName() {
        if (this.getTotal()) {
            return this.players[this.players.length - 1].name;
        }
        return null;
    }

    /**
     * @return {boolean}
     */
    localPlayerIsHost() {
        return Boolean(
            this.localPlayer && State.player &&
            this.localPlayer === State.player &&
            0 === this.players.indexOf(State.player)
        );
    }

}
