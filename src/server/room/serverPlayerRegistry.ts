import { Level } from "../../shared/level/level";
import { PlayerRegistry, RoomPlayersMessage } from "../../shared/room/playerRegistry";
import { Message } from "../../shared/room/types";
import { ServerPlayer } from "./serverPlayer";

export class ServerPlayerRegistry extends PlayerRegistry<ServerPlayer> {
    constructor() {
        super();
    }

    /**
     * @deprecated
     * Send data to everyone in the room.
     */
    emit(type: number, data?: any, exclude?: ServerPlayer): void {
        for (let i = 0, m = this.length; i < m; i++) {
            if (exclude !== this[i]) {
                this[i].emit(type, data);
            }
        }
    }

    send(message: Message, exclude?: ServerPlayer): void {
        for (let i = 0, m = this.length; i < m; i++) {
            if (exclude !== this[i]) {
                this[i].send(message);
            }
        }
    }

    // Players each get a unique message because player.local depends on the receiver.
    sendPlayers(): void {
        for (let i = 0, m = this.length; i < m; i++) {
            this[i].send(new RoomPlayersMessage(this, this[i]));
        }
    }

    removeDisconnectedPlayers(): void {
        for (let i = 0; i < this.length; i++) {
            if (!this[i].connected) {
                this[i].destruct();
                this.remove(this[i]);
                this.send(new RoomPlayersMessage(this, this[i]));
            }
        }
    }

    setSnakes(level: Level): void {
        for (let i = 0, m = this.length; i < m; i++) {
            this[i].setSnake(i, level);
        }
    }

    getCollisionsOnTick(tick: number): ServerPlayer[] {
        const crashingPlayers = [];
        for (let i = 0, m = this.length; i < m; i++) {
            if (this[i].snake.hasCollisionLteTick(tick)) {
                crashingPlayers.push(this[i]);
            }
        }
        return crashingPlayers;
    }

    moveSnakes(tick: number, elapsed: number, shift: Shift): void {
        for (let i = 0, m = this.length; i < m; i++) {
            this[i].snake.handleNextMove(tick, elapsed, shift, this);
            this[i].snake.shiftParts(shift);
        }
    }
}
