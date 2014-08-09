'use strict';

/**
 * @type {xss.levelset.Base} levelset
 * @constructor
 */
xss.level.Base = function(levelset) {
    /** @type {xss.levelset.Options} */
    this.options = xss.util.clone(levelset.options);
    this.animations = new xss.level.animation.Registry();
    this.animations.register();

    this.levelImage = xss.data.levels.blank;
    this.levelData = null;
};

xss.level.Base.prorotype = {

    /**
     * @param {Function} continueFn
     */
    preload: function(continueFn) {
        new xss.level.ImageDecoder(this.levelImage).then(function(data) {
            xss.level.levelData = data;
            continueFn();
        });
    }
};
