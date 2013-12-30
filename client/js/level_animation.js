'use strict';

/**
 * @param animation
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
     * Keys used for xss.shapes
     *
     * @type {Object.<string, boolean>}
     * @private
     */
    this._keys = {};

    if (animation) {
        this._animationMs = 0;
        this._animations = animation();
    }
};

xss.LevelAnimation.prototype = {

    destruct: function() {
        for (var k in this._keys) {
            if (this._keys.hasOwnProperty(k)) {
                xss.shapes[k] = null;
            }
        }
    },

    /**
     * @param {number} delta
     */
    update: function(delta) {
        this._animationMs += delta;
        this._updateAnimations(this._animationMs);
    },

    /**
     * @param {number} ms
     * @private
     */
    _updateAnimations: function(ms) {
        var shapePixelsArr;

        // Multiple animations per level.
        for (var i = 0, m = this._animations.length; i < m; i++) {
            shapePixelsArr = this._animations[i].update(ms);
            // May return null if shapes were not updated.
            if (shapePixelsArr) {
                this._updateShapes(i, shapePixelsArr);
            }
        }
    },

    /**
     * @param {number} i
     * @param {Array.<xss.ShapePixels>} shapePixelsArr
     * @private
     */
    _updateShapes: function(i, shapePixelsArr) {
        var pixels, key;
        for (var ii = 0, mm = shapePixelsArr.length; ii < mm; ii++) {
            pixels = xss.transform.zoomGame(shapePixelsArr[ii]);
            key = xss.NS_ANIM + i + '_' + ii;
            this._keys[key] = true;
            xss.shapes[key] = new xss.Shape(pixels);
        }
    }
};
