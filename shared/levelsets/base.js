'use strict';

/**
 * @constructor
 */
xss.levelset.Base = function() {
    /** @type {Array.<xss.level.Base>} */
    this.levels = [];
    this.loaded = false;
    this.options = new xss.levelset.Options();
};


xss.levelset.Base.prototype = {

    /**
     * @param {Object} Level
     */
    register: function(Level) {
        this.levels.push(new Level(this));
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

        for (var i = 0, m = this.levels.length; i < m; i++) {
            this.levels.preload(checkAllLoaded);
        }
    }
};
