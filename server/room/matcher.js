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
     * @param {xss.room.ServerOptions} preferences
     * @return {xss.room.ServerRoom}
     */
    getRoomMatching: function(preferences) {
        var rooms = this.rooms;
        if (!preferences.isPrivate) {
            for (var i = 0, m = rooms.length; i < m; i++) {
                var room = rooms[i];
                if (room.isAwaitingPlayers() && room.options.matches(preferences)) {
                    return rooms[i];
                }
            }
        }
        return null;
    }

};
