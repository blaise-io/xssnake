import { PlayerRegistry, PlayersMessage } from "../../shared/room/playerRegistry";
import { Message } from "../../shared/room/types";
import { ServerPlayer } from "./serverPlayer";

export class ServerPlayerRegistry extends PlayerRegistry<ServerPlayer> {
    constructor() {
        super();
    }

    byId(id: number): ServerPlayer | undefined {
        for (let i = 0, m = this.length; i < m; i++) {
            if (this[i].id === id) {
                return this[i];
            }
        }
        return;
    }

    send(message: Message, options: { exclude?: ServerPlayer } = {}): void {
        for (let i = 0, m = this.length; i < m; i++) {
            if (this[i] !== options.exclude) {
                this[i].send(message);
            }
        }
    }

    // Players each get a unique message because Player.local depends on the receiver.
    sendPlayers(): void {
        for (let i = 0, m = this.length; i < m; i++) {
            this[i].send(new PlayersMessage(this, this[i]));
        }
    }

    removeDisconnected(): void {
        for (let i = this.length - 1; i >= 0; i--) {
            if (!this[i].connected) {
                this.splice(i, 1);
            }
        }
    }
}
