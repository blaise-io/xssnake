import { Player } from "../../shared/room/player";
import { PlayerRegistry } from "../../shared/room/playerRegistry";
import { ClientSocketPlayer } from "./clientSocketPlayer";

export class ClientPlayerRegistry extends PlayerRegistry<Player> {
    get localPlayer(): ClientSocketPlayer {
        return this.find((p) => p.local) as ClientSocketPlayer;
    }

    static fromPlayerRegistry(
        players: Player[],
        localPlayer: ClientSocketPlayer,
    ): ClientPlayerRegistry {
        return new ClientPlayerRegistry(...players.map((p) => (p.local ? localPlayer : p)));
    }

    updateFromMessage(players: PlayerRegistry<Player>): void {
        const localPlayer = this.localPlayer;
        this.length = 0;
        this.push(...players.map((p) => (p.local ? localPlayer : p)));
    }

    /** @deprecated use notification */
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

    /** @deprecated use notification */
    getLastJoin(): string | undefined {
        if (this.length) {
            return this[this.length - 1].name;
        }
    }
}
