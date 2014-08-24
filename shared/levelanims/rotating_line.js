'use strict';

/**
 * @param {number} x
 * @param {number} y
 * @param {number} len
 * @param {number=} speed
 * @implements {xss.levelanim.Interface}
 * @constructor
 */
xss.levelanims.RotatingLine = function(x, y, len, speed) {
    this.x = x;
    this.y = y;
    this.len = len;
    this.speed = speed || 0.5;
};

xss.levelanims.RotatingLine.prototype = {

    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @return {xss.ShapeCollection|null}
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
     * @return {xss.ShapeCollection}
     * @private
     */
    _update: function(radian) {
        var shape = new xss.Shape(
            xss.shapegen.radianLine(this.x, this.y, radian, this.len)
        );
        return new xss.ShapeCollection([shape]);
    }
};
