'use strict';

/**
 * @param {Function=} animation
 * @constructor
 */
xss.LevelAnimation = function(animation) {
    /**
     * List of animations.
     * Each animation has one or more shapes that update every N ms.
     *
     * @type {Array.<xss.animation.Interface>}
     * @private
     */
    this._animations = [];

    /**
     * @type {number}
     * @private
     */
    this._progressMs = 0;

    if (animation) {
        this._animations = animation();
    }
};

xss.LevelAnimation.prototype = {

    /**
     * Returns an array of animations.
     * Every animation is an array of shape pixels, or null
     *
     * @param {number} delta
     * @return {Array.<Array.<xss.ShapePixels>>}
     */
    update: function(delta) {
        var shapePixelsArrArr = [];
        this._progressMs += delta;
        for (var i = 0, m = this._animations.length; i < m; i++) {
            shapePixelsArrArr.push(this._animations[i].update(this._progressMs));
        }
        return shapePixelsArrArr;
    }

};
