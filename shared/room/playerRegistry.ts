/**
 * @constructor
 */
import { Player } from "./player";

export class PlayerRegistry {
    public players: Player[];

    constructor() {
        this.players = [];
    }

    destruct(): void {
        this.players.length = 0;
    }

    serialize(localPlayer: Player): any[] {
        const serialized = [];
        for (let i = 0, m = this.players.length; i < m; i++) {
            serialized.push(this.players[i].serialize(localPlayer === this.players[i]));
        }
        return serialized;
    }

    add(player: Player): void {
        this.players.push(player);
    }

    remove(player: Player): void {
        const index = this.players.indexOf(player);
        if (-1 !== index) {
            this.players.splice(index, 1);
        }
    }

    getTotal(): number {
        return this.players.length;
    }

    isHost(player: Player): boolean {
        return 0 === this.players.indexOf(player);
    }
}
