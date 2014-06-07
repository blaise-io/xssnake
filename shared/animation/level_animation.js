'use strict';

/**
 * @param {Function=} animation
 * @param {number=} progress Animation progress (in ms)
 * @constructor
 */
xss.LevelAnimation = function(animation, progress) {
    /**
     * List of animations.
     * Each animation has one or more shapes that update every N ms.
     *
     * @type {Array.<xss.animation.Interface>}
     * @private
     */
    this._animations = animation ? animation() : [];

    /**
     * @type {number}
     * @private
     */
    this._progressMs = progress || 0;
};

xss.LevelAnimation.prototype = {

    /**
     * Returns an array of animations.
     * Every animation is an array of shapes, or null
     *
     * @param {number} delta
     * @param {boolean} gameStarted
     * @return {Array.<xss.ShapeCollection>}
     */
    update: function(delta, gameStarted) {
        var shapeCollections = [];
        this._progressMs += delta;
        for (var i = 0, m = this._animations.length; i < m; i++) {
            shapeCollections.push(
                this._animations[i].update(this._progressMs, gameStarted)
            );
        }
        return shapeCollections;
    }

};
