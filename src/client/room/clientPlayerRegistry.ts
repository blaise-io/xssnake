import { Level } from "../../shared/level/level";
import { Player } from "../../shared/room/player";
import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { NS } from "../const";
import { State } from "../state";
import { ClientPlayer } from "./clientPlayer";
import { ClientSocketPlayer } from "./clientSocketPlayer";

export class ClientPlayerRegistry extends PlayerRegistry<ClientPlayer> {
    players: ClientPlayer[];

    get localPlayer(): ClientPlayer {
        return this.find((p) => p.local);
    }

    static fromPlayerRegistry(
        localPlayer: ClientSocketPlayer,
        players: Player[],
    ): ClientPlayerRegistry {
        return new ClientPlayerRegistry(
            ...players.map((p) => (p.local ? localPlayer : ClientPlayer.fromPlayer(p))),
        );
    }

    // deserialize(serializedPlayers: [string, number][]): void {
    //     for (let i = 0, m = serializedPlayers.length; i < m; i++) {
    //         this[i].deserialize(serializedPlayers[i]);
    //     }
    // }

    // reconstruct(serializedPlayers: [string, number][]): void {
    //     super.destruct(); // Keep localPlayer; is not in super.
    //     for (let i = 0, m = serializedPlayers.length; i < m; i++) {
    //         this.reconstructPlayer(serializedPlayers[i]);
    //     }
    // }

    // reconstructPlayer(serialized: [string, number]): void {
    //     const player = new ClientPlayer();
    //     player.deserialize(serialized);
    //
    //     if (player.local) {
    //         this.localPlayer.deserialize(serialized);
    //         this.push(this.localPlayer);
    //     } else {
    //         this.push(player);
    //     }
    // }

    getNames(): string[] {
        const names = [];
        for (let i = 0, m = this.length; i < m; i++) {
            names.push(this[i].name);
        }
        return names;
    }

    setScores(scores: number[]): void {
        for (let i = 0, m = scores.length; i < m; i++) {
            this[i].score = scores[i];
        }
    }

    setSnakes(level: Level): void {
        for (let i = 0, m = this.length; i < m; i++) {
            this[i].setSnake(i, level);
        }
    }

    unsetSnakes(): void {
        // There may still be a few shapes lingering around.
        this.clearSnakeShapes();
        for (let i = 0, m = this.length; i < m; i++) {
            this[i].unsetSnake();
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
        for (let i = 0, m = this.length; i < m; i++) {
            this[i].snake.handleNextMove(level, elapsed, shift, this);
            this[i].snake.shiftParts(shift);
        }
    }

    showMeta(): void {
        for (let i = 0, m = this.length; i < m; i++) {
            this[i].snake.showName();
        }
        if (this.localPlayer) {
            this.localPlayer.snake.showDirection();
        }
    }

    hideMeta(): void {
        for (let i = 0, m = this.length; i < m; i++) {
            this[i].snake.removeNameAndDirection();
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

    getLastJoin(): string | undefined {
        if (this.length) {
            return this[this.length - 1].name;
        }
    }

    localPlayerIsHost(): boolean {
        return this.localPlayer && this[0] === this.localPlayer;
    }
}
