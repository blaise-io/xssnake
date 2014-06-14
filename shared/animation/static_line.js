'use strict';

/**
 * Static Line -- for debugging
 *
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @implements {xss.animation.Interface}
 * @constructor
 */
xss.animation.StaticLine = function(x0, y0, x1, y1) {
    this._lineShape = xss.shapegen.lineShape(x0, y0, x1, y1);
    this.seed = 0;
};

xss.animation.StaticLine.prototype = {

    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @return {xss.ShapeCollection}
     */
    update: function(ms, gameStarted) {
        return new xss.ShapeCollection([this._lineShape]);
    }
};
