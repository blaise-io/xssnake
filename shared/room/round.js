'use strict';

/**
 * @param {xss.room.PlayerRegistry} players
 * @param {xss.room.Options} options
 * @constructor
 */
xss.room.Round = function(players, options) {
    this.players = players;
    this.options = options;
    this.levelset = null;
    this.levelsetIndex = null;
    this.levelIndex = null;
};

xss.room.Round.prototype = {

    serialize: function() {
        return [this.levelsetIndex, this.levelIndex];
    },

    deserialize: function(serialized) {
        this.levelsetIndex = serialized[0];
        this.levelIndex = serialized[1];
    }

};
