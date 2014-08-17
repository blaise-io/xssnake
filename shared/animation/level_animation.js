'use strict';

/**
 * @param {number} seed
 * @param {Function=} animation
 * @param {number=} progress Animation progress (in ms)
 * @constructor
 */
xss.LevelAnimation = function(seed, animation, progress) {
    /**
     * List of animations.
     * Each levelanim has one or more shapes that update every N ms.
     *
     * @type {Array.<xss.levelanim.Interface>}
     * @private
     */
    this._animations = animation ? animation(seed) : [];

    /**
     * @type {number}
     * @private
     */
    this._progressMs = progress || 0;
};

xss.LevelAnimation.prototype = {

    /**
     * Returns an array of animations.
     * Every levelanim is an array of shapes, or null
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
