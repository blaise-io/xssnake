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
    },

    /**
     * @return {Array.<Array.<number|string>>}
     */
    getAsFieldValues: function() {
        var values = [];
        for (var i = 0, m = this.levelsets.length; i < m; i++) {
            values.push([i, this.levelsets[i].title.toUpperCase()]);
        }
        return values;
    },

    /**
     * @return {number}
     */
    getRandomIndex: function() {
        return xss.util.randomRange(0, this.levelsets.length - 1);
    }

};
