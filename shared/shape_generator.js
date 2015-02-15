'use strict';

/**
 * Generates shapes
 * @constructor
 */
xss.ShapeGenerator = function() {
    /** @private */
    this._cache = {};
};

xss.ShapeGenerator.prototype = {

    /**
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {xss.Shape}
     */
    lineShape: function(x0, y0, x1, y1) {
        return new xss.Shape(this.line(x0, y0, x1, y1));
    },

    /**
     * @param {number} xc
     * @param {number} yc
     * @param {number} radian
     * @param {number} length
     * @return {xss.PixelCollection}
     */
    radianLine: function(xc, yc, radian, length) {
        var x0, y0, x1, y1;

        x0 = xc + length / 2 * Math.cos(radian);
        y0 = yc + length / 2 * Math.sin(radian);
        x1 = xc + length / 2 * Math.cos(radian + Math.PI);
        y1 = yc + length / 2 * Math.sin(radian + Math.PI);

        return this.line(
            Math.round(x0),
            Math.round(y0),
            Math.round(x1),
            Math.round(y1)
        );
    },

    /**
     * Bresenham's line algorithm
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {xss.PixelCollection}
     */
    line: function(x0, y0, x1, y1) {
        var pixels, dx, sx, dy, sy, err, err2;

        pixels = new xss.PixelCollection();

        dx = Math.abs(x1 - x0);
        sx = x0 < x1 ? 1 : -1;
        dy = Math.abs(y1 - y0);
        sy = y0 < y1 ? 1 : -1;
        err = (dx > dy ? dx : -dy) / 2;

        while (true) {
            pixels.add(x0, y0);
            if (x0 === x1 && y0 === y1) {
                break;
            }
            err2 = err;
            if (err2 > -dx) {
                err -= dy;
                x0 += sx;
            }
            if (err2 < dy) {
                err += dx;
                y0 += sy;
            }
        }

        return pixels;
    }

};
