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
    this.seed = 0;
    this.speed = speed || 0.5;
};

xss.animation.RotatingLine.prototype = {

    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @returns {Array.<xss.PixelCollection>}
     */
    update: function(ms, gameStarted) {
        var radian = ms / Math.pow(1 - this.speed, 1.5) / 2500;
        radian = Math.round(radian * 20) / 20; // No need for 60 fps.
        if (radian !== this.radian) {
            this.radian = radian;
            return this._update(radian);
        }
        return null;
    },

    /**
     * @param {number} radian
     * @returns {Array.<xss.PixelCollection>}
     * @private
     */
    _update: function(radian) {
        var shapegen = xss.shapegen;
        return [
            shapegen.radianLine(this.x, this.y, radian, this.len)
        ];
    }
};
