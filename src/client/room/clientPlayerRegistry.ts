import { Level } from "../../shared/level/level";
import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { NS_SNAKE } from "../const";
import { ClientState } from "../state/clientState";
import { ClientPlayer } from "./clientPlayer";

export class ClientPlayerRegistry extends PlayerRegistry {
    localPlayer: ClientPlayer;
    players: ClientPlayer[];

    constructor() {
        super();
        this.localPlayer = null;
    }

    destruct(): void {
        this.localPlayer = null;
        super.destruct();
    }

    clone(playerRegistry: ClientPlayerRegistry): void {
        this.players = playerRegistry.players.slice();
        this.localPlayer = playerRegistry.localPlayer;
    }

    deserialize(serializedPlayers: Coordinate[][][]): void {
        for (let i = 0, m = serializedPlayers.length; i < m; i++) {
            this.players[i].deserialize(serializedPlayers[i]);
        }
    }

    reconstruct(serializedPlayers: Coordinate[][][]): void {
        this.destruct();
        for (let i = 0, m = serializedPlayers.length; i < m; i++) {
            this.reconstructPlayer(serializedPlayers[i]);
        }
    }

    reconstructPlayer(serialized: Coordinate[][]): void {
        let player = new ClientPlayer();
        player.deserialize(serialized);

        if (player.local) {
            ClientState.player.deserialize(serialized);
            player = this.localPlayer = ClientState.player;
        }

        this.add(player);
    }

    getNames(): string[] {
        const names = [];
        for (let i = 0, m = this.players.length; i < m; i++) {
            names.push(this.players[i].name);
        }
        return names;
    }

    setScores(scores: number[]): void {
        for (let i = 0, m = scores.length; i < m; i++) {
            this.players[i].score = scores[i];
        }
    }

    setSnakes(level: Level): void {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].setSnake(i, level);
        }
    }

    unsetSnakes(): void {
        // There may still be a few shapes lingering around.
        this.clearSnakeShapes();
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].unsetSnake();
        }
    }

    clearSnakeShapes(): void {
        const keys = Object.keys(ClientState.shapes);
        for (let i = 0, m = keys.length; i < m; i++) {
            if (keys[i].substr(0, NS_SNAKE.length) === NS_SNAKE) {
                ClientState.shapes[keys[i]] = null;
            }
        }
    }

    moveSnakes(level: Level, elapsed: number, shift: Shift): void {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.handleNextMove(level, elapsed, shift, this.players);
            this.players[i].snake.shiftParts(shift);
        }
    }

    showMeta(): void {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.showName();
        }
        if (this.localPlayer) {
            this.localPlayer.snake.showDirection();
        }
    }

    hideMeta(): void {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.removeNameAndDirection();
        }
    }

    addControls(): void {
        if (this.localPlayer) {
            this.localPlayer.snake.addControls();
        }
    }

    getQuitName(prevPlayers: ClientPlayerRegistry): string | null {
        const prevNames = prevPlayers.getNames();
        const newNames = this.getNames();
        for (let i = 0, m = prevNames.length; i < m; i++) {
            if (-1 === newNames.indexOf(prevNames[i])) {
                return prevNames[i];
            }
        }

        return null;
    }

    /**
     * Assume last joined player is last in this.players.
     */
    getJoinName(): string | null {
        if (this.getTotal()) {
            return this.players[this.players.length - 1].name;
        }
        return null;
    }

    localPlayerIsHost(): boolean {
        return Boolean(
            this.localPlayer &&
                ClientState.player &&
                this.localPlayer === ClientState.player &&
                0 === this.players.indexOf(ClientState.player)
        );
    }
}
