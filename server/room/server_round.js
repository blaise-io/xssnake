'use strict';

/**
 * @param {xss.room.ServerPlayerRegistry} players
 * @param {xss.room.Options} options
 * @param {Array.<number>} levelsPlayed
 * @constructor
 * @extends {xss.room.Round}
 */
xss.room.ServerRound = function(players, options, levelsPlayed) {
    xss.room.Round.call(this, players, options);
    this.levelsetIndex = options.levelset;
    this.levelset = xss.levelSetRegistry.getLevelset(this.levelsetIndex);
    this.levelIndex = this.levelset.getRandomLevelIndex(levelsPlayed);
};

xss.util.extend(xss.room.ServerRound.prototype, xss.room.Round.prototype);
