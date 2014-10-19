'use strict';

/**
 * @param {xss.room.ServerPlayerRegistry} players
 * @param {xss.room.Options} options
 * @param {Array.<number>} levelsPlayed
 * @constructor
 */
xss.room.ServerRound = function(players, options, levelsPlayed) {
    this.players = players;
    this.options = options;
    this.levelset = xss.levelSetRegistry.levelsets[this.options.levelset];
    this.levelIndex = this.levelset.getRandomLevelIndex(levelsPlayed);
};

xss.room.ServerRound.prototype = {

    serialize: function() {
        return [this.levelIndex];
    }

};
