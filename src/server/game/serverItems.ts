import { Level } from "../../shared/level/level";
import { ServerPlayerRegistry } from "../room/serverPlayerRegistry";

export class ServerItems {
    constructor(public level: Level, public players: ServerPlayerRegistry) {
        this.level = level;
        this.players = players;
    }

    destruct() {
        this.level = undefined;
        this.players = undefined;
    }
}
