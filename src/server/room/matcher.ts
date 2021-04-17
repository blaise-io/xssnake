import { ServerOptions } from "./serverOptions";
import { ServerRoom } from "./serverRoom";

export class Matcher {
    constructor(public rooms: ServerRoom[]) {}

    destruct() {
        this.rooms = null;
    }

    getRoomMatching(requestOptions: ServerOptions): ServerRoom | null {
        const rooms = this.rooms;
        if (!requestOptions.isPrivate) {
            // Shortcut.
            for (let i = 0, m = rooms.length; i < m; i++) {
                const room = rooms[i];
                if (room.isAwaitingPlayers()) {
                    if (room.options.matches(requestOptions)) {
                        return room;
                    }
                }
            }
        }
        return null;
    }
}
