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
        return new xss.Shape(
            this.line.apply(this, arguments)
        );
    },

    /**
     * @param x0
     * @param y0
     * @param radian
     * @param length
     * @returns {xss.ShapePixels}
     */
    radianLine: function(x0, y0, radian, length) {
        var x1, y1;

        x1 = x0 + length / 2 * Math.cos(radian);
        y1 = y0 + length / 2 * Math.sin(radian);

        return this.line(x0, y0, Math.round(x1), Math.round(y1));
    },

    /**
     * rosettacode.org/wiki/Bitmap/Bresenham%27s_line_algorithm#JavaScript
     *
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @returns {xss.ShapePixels}
     */
    line: function bline(x0, y0, x1, y1) {
        var pixels, dx, sx, dy, sy, err;

        pixels = new xss.ShapePixels();

        dx = Math.abs(x1 - x0);
        sx = x0 < x1 ? 1 : -1;
        dy = Math.abs(y1 - y0);
        sy = y0 < y1 ? 1 : -1;
        err = (dx > dy ? dx : -dy) / 2;

        while (true) {
            pixels.add(x0, y0);
            if (x0 === x1 && y0 === y1) break;
            var e2 = err;
            if (e2 > -dx) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dy) {
                err += dx;
                y0 += sy;
            }
        }

        return pixels;
    }

};
