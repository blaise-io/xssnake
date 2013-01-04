/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS*/
'use strict';

/**
 * Transform
 * Pixel transformations
 * @constructor
 */
function Transform() {}

Transform.prototype = {

    /**
     * @param {Array} pixels
     * @param {number=} x
     * @param {number=} y
     * @return {Array}
     */
    shift: function(pixels, x, y) {
        var ret = [];
        if (x === 0 && y === 0) {
            ret = pixels;
        } else {
            for (var i = 0, m = pixels.length; i < m; i++) {
                ret.push([pixels[i][0] + x, pixels[i][1] + y]);
            }
        }
        return ret;
    },

    /**
     * @param {XSS.ShapePixels} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @param {boolean=} antiAlias
     * @return {XSS.ShapePixels}
     */
    zoomX2: function(pixels, shiftX, shiftY, antiAlias) {
        var ret = [], x, y;
        shiftX = shiftX || 0;
        shiftY = shiftY || 0;
        for (var i = 0, m = pixels.length; i < m; i++) {
            x = pixels[i][0] * 2;
            y = pixels[i][1] * 2;
            ret.push(
                [x + shiftX, y + shiftY],
                [x + shiftX, y + shiftY + 1],
                [x + shiftX + 1, y + shiftY],
                [x + shiftX + 1, y + shiftY + 1]
            );
        }

        if (antiAlias) {
            ret = this._antiAlias(pixels, ret, shiftX, shiftY);
        }

        return ret;
    },

    /**
     * @param {XSS.ShapePixels} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @param {boolean=} antiAlias
     * @return {XSS.ShapePixels}
     */
    zoomX4: function(pixels, shiftX, shiftY, antiAlias) {
        return this.zoomX2(
            this.zoomX2(pixels, 0, 0, antiAlias),
            shiftX || 0,
            shiftY || 0,
            antiAlias
        );
    },

    /**
     * @param {XSS.ShapePixels} pixels
     * @return {XSS.ShapePixels}
     */
    zoomGame: function(pixels) {
        return this.zoomX4(pixels, XSS.GAME_LEFT, XSS.GAME_TOP);
    },

    /**
     * @param {XSS.ShapePixels} x1Pixels
     * @param {XSS.ShapePixels} x2Pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @return {XSS.ShapePixels}
     * @private
     */
    _antiAlias: function(x1Pixels, x2Pixels, shiftX, shiftY) {
        var index, cache = [];

        /**
         * @param {Array.<number>} p
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         */
        function has(p, x, y) {
            x = p[0] + x;
            y = p[1] + y;
            index = x + y * XSS.PIXELS_V;
            if (typeof cache[index] === 'undefined') {
                cache[index] = XSS.transform.has(x1Pixels, x, y);
            }
            return cache[index];
        }

        /**
         * @param {Array.<number>} p
         * @param {number} x
         * @param {number} y
         * @return {undefined}
         */
        function push(p, x, y) {
            x = p[0] * 2 + x + shiftX;
            y = p[1] * 2 + y + shiftY;
            if (!XSS.transform.has(x2Pixels, x, y)) {
                x2Pixels.push([x, y]);
            }
        }

        // Walk through pixels, see if neighbour pixels match a pattern where
        // pixels are visually missing, and fill those gaps.
        for (var i = 0, m = x1Pixels.length; i < m; i++) {
            var xx, yy, px, py, p = x1Pixels[i];

            // Vertical bottom-left to top-right fill.
            // Mainly for 2x zoom.
            if (has(p, 1, -1) &&
                !has(p, 0, -1) &&
                !has(p, 1, 0)
            ) {
                push(p, +2, +0);
                push(p, +1, -1);
            }

            // Vertical top-left to bottom-right fill.
            // Mainly for 2x zoom.
            if (has(p, 1, 1) &&
                !has(p, 1, 0) &&
                !has(p, 0, 1)
            ) {
                push(p, +2, +1);
                push(p, +1, +2);
            }

            // Vertical bottom-left and top-right fill.
            // 4x zoom, 4 directions.
            for (xx = -1; xx <= 1; xx += 2) {
                for (yy = -1; yy <= 1; yy += 2) {
                    if (has(p, xx, yy) &&
                        has(p, xx * 2, yy * 2) &&
                        !has(p, xx, 0) &&
                        !has(p, xx * 2, yy)
                    ) {
                        px = (xx < 0) ? -1 : 2;
                        py = (yy < 0) ? 0 : 1;
                        push(p, px, py);

                        px = (xx < 0) ? -3 : 4;
                        py = (yy < 0) ? -2 : 3;
                        push(p, px, py);
                    }
                }
            }

            // Misc square corners fill.
            // 4x zoom, 4 directions.
            for (xx = -1; xx <= 1; xx += 2) {
                for (yy = -1; yy <= 1; yy += 2) {
                    if (has(p, -xx, yy) &&
                        has(p, xx, yy) &&
                        has(p, xx * -2, yy * 3) &&
                        !has(p, xx * -2, yy * 2)
                    ) {
                        px = (xx < 0) ? 4 : -3;
                        py = (yy < 0) ? -1 : 2;
                        push(p, px, py);
                    }
                }
            }

        }

        return x2Pixels;
    },

    /**
     * @param {XSS.ShapePixels} pixels
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    has: function(pixels, x, y) {
        for (var i = 0, m = pixels.length; i < m; i++) {
            if (pixels[i][0] === x && pixels[i][1] === y) {
                return true;
            }
        }
        return false;
    }

};