'use strict';

/**
 * @constructor
 */
xss.levelset.Levelset = function() {
    this.title = '';
    /** @type {Array.<xss.level.Level>} */
    this.levels = [];
    this.loaded = false;
};

xss.levelset.Levelset.prototype = {

    /**
     * @return {xss.levelset.Config}
     */
    getConfig: function() {
        return new xss.levelset.Config();
    },

    /**
     * @param {number} index
     * @return {xss.level.Level}
     */
    getLevel: function(index) {
        return this.levels[index];
    },

    /**
     * @param {?} Level
     */
    register: function(Level) {
        this.levels.push(new Level(this.getConfig()));
    },

    /**
     * @param {Function} continueFn
     */
    preload: function(continueFn) {
        var checkAllLoaded, loaded = 0;

        checkAllLoaded = function() {
            if (++loaded === this.levels.length) {
                continueFn();
            }
        }.bind(this);

        if (this.levels.length) {
            for (var i = 0, m = this.levels.length; i < m; i++) {
                this.levels[i].preload(checkAllLoaded);
            }
        } else {
            continueFn();
        }
    },

    /**
     * @param {Array.<number>} levelsPlayed
     * @return {number}
     */
    getRandomLevelIndex: function(levelsPlayed) {
        var notPlayed = this.levels.slice();

        if (notPlayed.length <= 1) {
            return 0;
        }

        // All levels were played.
        // Play any level except the one just played.
        if (this.levels.length === levelsPlayed.length) {
            levelsPlayed.splice(0, levelsPlayed.length - 1);
        }

        for (var i = 0, m = levelsPlayed.length; i < m; i++) {
            notPlayed.splice(levelsPlayed[i], 1);
        }

        return xss.util.randomArrIndex(notPlayed);
    }

};
