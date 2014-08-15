'use strict';

/**
 * @constructor
 */
xss.levelset.Levelset = function() {
    this.title = '';
    /** @type {Array.<xss.level.Level>} */
    this.levels = [];
    this.loaded = false;
    this.options = new xss.levelset.Options();
};

xss.levelset.Levelset.prototype = {

    /**
     * @param {Function} Level
     */
    register: function(Level) {
        this.levels.push(new Level(this.options));
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
