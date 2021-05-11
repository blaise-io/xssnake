import { PlayerRegistry, PlayersMessage } from "../../shared/room/playerRegistry";
import { Message } from "../../shared/room/types";
import { ServerPlayer } from "./serverPlayer";

export class ServerPlayerRegistry extends PlayerRegistry<ServerPlayer> {
    constructor() {
        super();
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

    removeDisconnectedPlayers(): void {
        for (let i = 0; i < this.length; i++) {
            if (!this[i].connected) {
                this[i].destruct();
                this.remove(this[i]);
                this.send(new PlayersMessage(this, this[i]));
            }
        }
    }
}
