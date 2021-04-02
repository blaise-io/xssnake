/**
 * @param {Array.<room.ServerRoom>} rooms
 * @constructor
 */
export class Matcher {
    constructor(Matcher) {
    this.rooms = rooms;
};



    destruct() {
        this.rooms = null;
    },

    /**
     * @param {room.ServerOptions} requestOptions
     * @return {room.ServerRoom}
     */
    getRoomMatching(requestOptions) {
        var rooms = this.rooms;
        if (!requestOptions.isPrivate) { // Shortcut.
            for (var i = 0, m = rooms.length; i < m; i++) {
                var room = rooms[i];
                if (room.isAwaitingPlayers()) {
                    if (room.options.matches(requestOptions)) {
                        return room;
                    }
                }
            }
        }
        return null;
    }

};
