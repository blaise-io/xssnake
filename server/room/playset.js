'use strict';

/**
 * @param {number} levelsetIndex
 * @constructor
 */
xss.LevelPlayset = function(levelsetIndex) {
    this.levelsetIndex = levelsetIndex;
    this.levelset = xss.levelsetRegistry.getLevelset(this.levelsetIndex);
    /** @type {Array.<number>} */
    this.played = [];
};

xss.LevelPlayset.prototype = {

    destruct: function() {
        this.levelset = null;
        this.played = null;
    },

    getNext: function() {
        var nextLevelsetIndex = this.levelset.getRandomLevelIndex(this.played);
        this.played.push(nextLevelsetIndex);
        return nextLevelsetIndex;
    }

};
