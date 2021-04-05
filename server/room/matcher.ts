/**
 * @param {Array.<room.ServerRoom>} rooms
 * @constructor
 */
export class Matcher {
    constructor(Matcher) {
        this.rooms = rooms;
    }



    destruct() {
        this.rooms = null;
    }

    /**
     * @param {room.ServerOptions} requestOptions
     * @return {room.ServerRoom}
     */
    getRoomMatching(requestOptions): void {
        const rooms = this.rooms;
        if (!requestOptions.isPrivate) { // Shortcut.
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
