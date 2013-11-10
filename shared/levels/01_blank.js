'use strict';

// TODO: Move to separate file
xss.animations = {};


/**
 * @interface
 * @todo: Move to separate file
 */
xss.animations.Interface = function() {};
xss.animations.Interface.prototype = {
    /**
     * For predictable randomness.
     * @type string
     */
    seed: '',

    /**
     * Return one or more ShapePixel objects.
     * Return null if animation was not updated.
     * @param ms
     * @return {Array.<xss.ShapePixels>}
     */
    update: function(ms) {}
};


/**
 * @param {number} x
 * @param {number} y
 * @param {number} len
 * @param {number=} speed
 * @implements {xss.animations.Interface}
 * @constructor
 */
xss.animations.RotatingLine = function(x, y, len, speed) {
    this.x = x;
    this.y = y;
    this.len = len;
    this.seed = '';
    this.speed = speed || 0.5;
};

xss.animations.RotatingLine.prototype = {

    /**
     * @param {number} ms
     * @returns {Array.<xss.ShapePixels>}
     */
    update: function(ms) {
        var radian = Math.ceil(ms / (300 * this.speed)) / (Math.PI * 2);
        if (radian !== this.radian) {
            this.radian = radian;
            return this._update(radian);
        }
        return null;
    },

    /**
     * @param {number} radian
     * @returns {Array.<xss.ShapePixels>}
     * @private
     */
    _update: function(radian) {
        var shapegen = xss.shapegen;
        return [
            shapegen.radianLine(this.x, this.y, radian, this.len),
            shapegen.radianLine(this.x, this.y, radian + Math.PI, this.len)
        ];
    }
};
