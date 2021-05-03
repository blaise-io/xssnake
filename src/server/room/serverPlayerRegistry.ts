import { NC_PLAYERS_SERIALIZE } from "../../shared/const";
import { Level } from "../../shared/level/level";
import { Message } from "../../shared/room/netcode";
import { PlayerRegistry, RoomPlayersMessage } from "../../shared/room/playerRegistry";
import { ServerPlayer } from "./serverPlayer";

export class ServerPlayerRegistry extends PlayerRegistry {
    private averageLatencyInTicks: number;
    players: ServerPlayer[];

    constructor() {
        super();
        this.averageLatencyInTicks = 0;
    }

    /**
     * @deprecated
     * Send data to everyone in the room.
     */
    emit(type: number, data?: any, exclude?: ServerPlayer): void {
        for (let i = 0, m = this.players.length; i < m; i++) {
            if (exclude !== this.players[i]) {
                this.players[i].emit(type, data);
            }
        }
    }

    send(message: Message, exclude?: ServerPlayer): void {
        for (let i = 0, m = this.players.length; i < m; i++) {
            console.log(this.players[i]);
            if (exclude !== this.players[i]) {
                this.players[i].send(message);
            }
        }
    }

    /**
     * @deprecated
     * Players get their own message because serialize contains local flag.
     */
    emitPlayers(): void {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].emit(NC_PLAYERS_SERIALIZE, this.serialize(this.players[i]));
        }
    }

    removeDisconnectedPlayers(): void {
        for (let i = 0; i < this.players.length; i++) {
            if (!this.players[i].connected) {
                this.players[i].destruct();
                this.remove(this.players[i]);
                this.send(new RoomPlayersMessage(this));
            }
        }
    }

    setSnakes(level: Level): void {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].setSnake(i, level);
        }
    }

    getCollisionsOnTick(tick: number): ServerPlayer[] {
        const crashingPlayers = [];
        for (let i = 0, m = this.players.length; i < m; i++) {
            if (this.players[i].snake.hasCollisionLteTick(tick)) {
                crashingPlayers.push(this.players[i]);
            }
        }
        return crashingPlayers;
    }

    moveSnakes(tick: number, elapsed: number, shift: Shift): void {
        for (let i = 0, m = this.players.length; i < m; i++) {
            this.players[i].snake.handleNextMove(tick, elapsed, shift, this.players);
            this.players[i].snake.shiftParts(shift);
        }
    }
}
