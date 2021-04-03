/**
 * @constructor
 */
import { Player } from "./player";

export class PlayerRegistry {
    public players: Player[];

    constructor() {
        this.players = [];
    }


    destruct() {
        this.players.length = 0;
    }

    /** @return {Array.<room.Player>} */
    filter(filter) {
        return filter(this.players, filter);
    }

    /**
     * @param {room.Player} localPlayer
     * @return {Array}
     */
    serialize(localPlayer) {
        const serialized = [];
        for (let i = 0, m = this.players.length; i < m; i++) {
            serialized.push(this.players[i].serialize(localPlayer === this.players[i]));
        }
        return serialized;
    }

    /**
     * @param {room.Player} player
     */
    add(player) {
        this.players.push(player);
    }

    /**
     * @param {room.Player} player
     */
    remove(player) {
        const index = this.players.indexOf(player);
        if (-1 !== index) {
            this.players.splice(index, 1);
        }
    }

    /**
     * @return {number}
     */
    getTotal() {
        return this.players.length;
    }

    /**
     * @param {room.Player} player
     * @return {boolean}
     */
    isHost(player) {
        return 0 === this.players.indexOf(player);
    }

}
