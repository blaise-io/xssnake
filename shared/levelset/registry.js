'use strict';

/**
 * @constructor
 */
xss.levelset.Registry = function() {
    /** @type {Array.<xss.levelset.Base>} */
    this.levelsets = [];
};

xss.levelset.Registry.prototype = {
    /**
     * @param {xss.levelset.Base} levelset
     */
    register: function(levelset) {
        this.levelsets.push(levelset);
    },

    /**
     * @param {Function} continueFn
     */
    preloadLevels: function(continueFn) {
        var checkAllLoaded, loaded = 0;

        checkAllLoaded = function() {
            if (++loaded === this.levelsets.length) {
                continueFn();
            }
        }.bind(this);

        for (var i = 0, m = this.levelsets.length; i < m; i++) {
            this.levelsets[i].preload(checkAllLoaded);
        }
    }

};
