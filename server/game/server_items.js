'use strict';

/***
 * @param {xss.level.Level} level
 * @param {xss.room.ServerPlayerRegistry} players
 * @constructor
 */
xss.game.ServerItems = function(level, players) {
    this.level = level;
    this.players = players;
};

xss.game.ServerItems.prototype = {

    destruct: function() {
        this.level = null;
        this.players = null;
    }

};
