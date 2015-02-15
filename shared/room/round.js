'use strict';

/**
 * @param {xss.room.PlayerRegistry} players
 * @param {xss.room.Options} options
 * @constructor
 */
xss.room.Round = function(players, options) {
    this.players = players;
    this.options = options;
    /** @type {Number} */
    this.levelsetIndex = null;
    /** @type {Number} */
    this.levelIndex = null;
    /** @type {xss.levelset.Levelset} */
    this.levelset = null;
    /** @type {xss.level.Level} */
    this.level = null;

    this.index = 0;
    this.started = false;
};

xss.room.Round.prototype = {

    serialize: function() {
        return [this.levelsetIndex, this.levelIndex];
    },

    deserialize: function(serialized) {
        this.levelsetIndex = serialized[0];
        this.levelIndex = serialized[1];
    },

    getLevel: function(levelsetIndex, levelIndex) {
        var levelset = xss.levelsetRegistry.getLevelset(levelsetIndex);
        return levelset.getLevel(levelIndex);
    }

};
