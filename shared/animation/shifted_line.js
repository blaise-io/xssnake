'use strict';

/**
 * Shifted Line -- for debugging
 *
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} sx
 * @param {number} sy
 * @implements {xss.animation.Interface}
 * @constructor
 */
xss.animation.ShiftedLine = function(x0, y0, x1, y1, sx, sy) {
    this._lineShape = xss.shapegen.lineShape(x0, y0, x1, y1);
    this._lineShape.transform.translate = [sx, sy];
    this.seed = 0;
};

xss.animation.ShiftedLine.prototype = {

    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @return {xss.ShapeCollection}
     */
    update: function(ms, gameStarted) {
        return new xss.ShapeCollection([this._lineShape]);
    }
};
