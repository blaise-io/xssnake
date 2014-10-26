'use strict';

/**
 * @param {Array.<xss.room.ServerRoom>} rooms
 * @constructor
 */
xss.room.Matcher = function(rooms) {
    this.rooms = rooms;
};

xss.room.Matcher.prototype = {

    destruct: function() {
        this.rooms = null;
    },

    /**
     * @param {xss.room.ServerOptions} requestOptions
     * @return {xss.room.ServerRoom}
     */
    getRoomMatching: function(requestOptions) {
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
