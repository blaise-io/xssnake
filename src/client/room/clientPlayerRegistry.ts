import { Level } from "../../shared/level/level";
import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { NS } from "../const";
import { State } from "../state";
import { ClientPlayer } from "./clientPlayer";

export class ClientPlayerRegistry extends PlayerRegistry {
    players: ClientPlayer[];

    constructor(public localPlayer: ClientPlayer) {
        super();
        // TODO: Wrong, would always be host.
        this.add(localPlayer);
    }

    destruct(): void {
        this.localPlayer = undefined;
        super.destruct();
    }

    clone(): ClientPlayerRegistry {
        const clone = new ClientPlayerRegistry(this.localPlayer);
        clone.players = this.players.slice();
        return clone;
    }

    deserialize(serializedPlayers: [string, number][]): void {
        for (let i = 0, m = serializedPlayers.length; i < m; i++) {
            this.players[i].deserialize(serializedPlayers[i]);
        }
    }

    reconstruct(serializedPlayers: [string, number][]): void {
        super.destruct(); // Keep localPlayer; is not in super.
        for (let i = 0, m = serializedPlayers.length; i < m; i++) {
            this.reconstructPlayer(serializedPlayers[i]);
        }
    }

    reconstructPlayer(serialized: [string, number]): void {
        const player = new ClientPlayer();
        player.deserialize(serialized);

        if (player.local) {
            this.localPlayer.deserialize(serialized);
            this.add(this.localPlayer);
        } else {
            this.add(player);
        }
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
        const keys = Object.keys(State.shapes);
        for (let i = 0, m = keys.length; i < m; i++) {
            if (keys[i].substr(0, NS.SNAKE.length) === NS.SNAKE) {
                State.shapes[keys[i]] = undefined;
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
        return this.localPlayer && this.players[0] === this.localPlayer;
    }
}
