import { Player } from "../../shared/room/player";
import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { ClientSocketPlayer } from "./clientSocketPlayer";

export class ClientPlayerRegistry extends PlayerRegistry<Player> {
    get localPlayer(): ClientSocketPlayer {
        return this.find((p) => p.local) as ClientSocketPlayer;
    }

    static fromPlayerRegistry(
        localPlayer: ClientSocketPlayer,
        players: Player[],
    ): ClientPlayerRegistry {
        return new ClientPlayerRegistry(...players.map((p) => (p.local ? localPlayer : p)));
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
    //     const player = new Player();
    //     player.deserialize(serialized);
    //
    //     if (player.local) {
    //         this.localPlayer.deserialize(serialized);
    //         this.push(this.localPlayer);
    //     } else {
    //         this.push(player);
    //     }
    // }
    // setSnakes(level: Level): void {
    //     for (let i = 0, m = this.length; i < m; i++) {
    //         this[i].setSnake(i, level);
    //     }
    // }
    //
    // unsetSnakes(): void {
    //     // There may still be a few shapes lingering around.
    //     this.clearSnakeShapes();
    //     for (let i = 0, m = this.length; i < m; i++) {
    //         this[i].unsetSnake();
    //     }
    // }

    // TODO: Game should do this?
    // clearSnakeShapes(): void {
    //     const keys = Object.keys(State.shapes);
    //     for (let i = 0, m = keys.length; i < m; i++) {
    //         if (keys[i].substr(0, NS.SNAKE.length) === NS.SNAKE) {
    //             delete State.shapes[keys[i]];
    //         }
    //     }
    // }

    // moveSnakes(level: Level, elapsed: number, shift: Shift): void {
    //     for (let i = 0, m = this.length; i < m; i++) {
    //         this[i].snake!.handleNextMove(level, elapsed, shift, this);
    //         this[i].snake!.shiftParts(shift);
    //     }
    // }

    // showMeta(): void {
    //     for (let i = 0, m = this.length; i < m; i++) {
    //         this[i].snake!.showName();
    //     }
    //     if (this.localPlayer) {
    //         this.localPlayer.snake!.showDirection();
    //     }
    // }

    // hideMeta(): void {
    //     for (let i = 0, m = this.length; i < m; i++) {
    //         this[i].snake!.removeNameAndDirection();
    //     }
    // }

    // addControls(): void {
    //     if (this.localPlayer) {
    //         this.localPlayer.snake!.addControls();
    //     }
    // }

    getQuitName(prevPlayers: ClientPlayerRegistry): string | null {
        const prevNames = prevPlayers.map((p) => p.name);
        const newNames = this.map((p) => p.name);
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
