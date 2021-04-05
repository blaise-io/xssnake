/***
 * @param {level.Level} level
 * @param {room.ServerPlayerRegistry} players
 * @constructor
 */
export class ServerItems {
    constructor(ServerItems) {
        this.level = level;
        this.players = players;
    }

    destruct() {
        this.level = null;
        this.players = null;
    }
}
