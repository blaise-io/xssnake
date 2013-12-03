'use strict';

/**
 * @param {number} x
 * @param {number} y
 * @param {number} len
 * @param {number=} speed
 * @implements {xss.animation.Interface}
 * @constructor
 */
xss.animation.RotatingLine = function(x, y, len, speed) {
    this.x = x;
    this.y = y;
    this.len = len;
    this.seed = '';
    this.speed = speed || 0.5;
};

xss.animation.RotatingLine.prototype = {

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
