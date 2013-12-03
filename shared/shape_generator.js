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
     * @param x1
     * @param y1
     * @param radian
     * @param length
     * @returns {xss.ShapePixels}
     */
    radianLine: function(x1, y1, radian, length) {
        var x2, y2;

        x2 = x1 + length / 2 * Math.cos(radian);
        y2 = y1 + length / 2 * Math.sin(radian);

        return this.line(
            x1,
            y1,
            Math.round(x2),
            Math.round(y2)
        );
    },

    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @return {xss.ShapePixels}
     */
    line: function(x1, y1, x2, y2) {
        var pixels, dx, dy, sx, sy, err, errTmp;

        pixels = new xss.ShapePixels();

        dx = Math.abs(x2 - x1);
        dy = Math.abs(y2 - y1);
        sx = x1 < x2 ? 1 : -1;
        sy = y1 < y2 ? 1 : -1;

        err = dx - dy;

        while (true) {
            pixels.add(x1, y1);
            if (x1 === x2 && y1 === y2) {
                break;
            }
            errTmp = err;
            if (errTmp > -dx) {
                err -= dy;
                x1 += sx;
            }
            if (errTmp < dy) {
                err += dx;
                y1 += sy;
            }
        }

        return pixels;
    }

};
