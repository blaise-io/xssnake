'use strict';

/**
 * @param {Array.<xss.room.Room>} rooms
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
     * @returns {xss.room.Room}
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
