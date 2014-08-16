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

    getConfig: function() {
        return new xss.levelset.Config();
    },

    /**
     * @param {Function} Level
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
    }
};
