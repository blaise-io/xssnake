/*globals ShapePixels*/
'use strict';

/**
 * Transform
 * Pixel transformations
 * @constructor
 */
function Transform() {}

Transform.prototype = {

    /**
     * @param {ShapePixels} pixels
     * @param {number=} xshift
     * @param {number=} yshift
     * @return {ShapePixels}
     */
    shift: function(pixels, xshift, yshift) {
        if (xshift === 0 && yshift === 0) {
            return pixels; // No shift
        }

        var ret = new ShapePixels();

        pixels.each(function(x, y) {
            ret.add(x + xshift, y + yshift);
        });

        return ret;
    },

    /**
     * @param {ShapePixels} pixels
     * @param {number=} width
     * @param {number=} height
     * @return {ShapePixels}
     */
    center: function(pixels, width, height) {
        var x, y, bbox = pixels.bbox();

        width = width || CONST.WIDTH;
        height = height || CONST.HEIGHT;

        x = Math.round((width - bbox.width) / 2);
        y = Math.round((height - bbox.height) / 2);

        x -= bbox.x1;
        y -= bbox.y1;

        return XSS.transform.shift(pixels, x, y);
    },

    /**
     * @param {Shape} shape
     * @param {number=} hPadding
     * @param {number=} vPadding
     * @param {boolean=} round
     * @return {Shape}
     */
    outline: function(shape, hPadding, vPadding, round) {
        var r, x1, x2, y1, y2, bbox = shape.bbox();

        r = (typeof round === 'undefined') ? 1 : 0;

        hPadding = (hPadding || 6);
        vPadding = (vPadding || 4);

        x1 = bbox.x1 - hPadding;
        x2 = bbox.x2 + hPadding;
        y1 = bbox.y1 - vPadding;
        y2 = bbox.y2 + vPadding;

        // Cannot add negative Y pixels, shift to y=0 position.
        if (y1 < 0) {
            shape.shift(0, Math.abs(y1));
            y2 += Math.abs(y1);
            y1 = 0;
        }

        shape.add(
            XSS.shapegen.line(x1, y1+1, x1, y2),      // Left
            XSS.shapegen.line(x1+r, y1, x2-r, y1),    // Top
            XSS.shapegen.line(x2, y1+1, x2, y2),      // Right
            XSS.shapegen.line(x1, y2, x2, y2),        // Bottom
            XSS.shapegen.line(x1+r, y2+1, x2-r, y2+1) // Bottom 2
        );

        // Don't clear the missing pixel in the corners
        // because of rounded corners:
        shape.bbox(-1);

        return shape;
    },

    /**
     * @param {ShapePixels} pixels
     * @param {number=} xshift
     * @param {number=} yshift
     * @param {boolean=} antiAlias
     * @return {ShapePixels}
     */
    zoomX2: function(pixels, xshift, yshift, antiAlias) {
        var ret = new ShapePixels();

        xshift = xshift || 0;
        yshift = yshift || 0;

        pixels.each(function(x,y) {
            var xx = x * 2 + xshift,
                yy = y * 2 + yshift;
            ret.add(xx, yy);
            ret.add(xx, yy + 1);
            ret.add(xx + 1, yy);
            ret.add(xx + 1, yy + 1);
        });

        if (antiAlias) {
            ret = this._antiAlias(pixels, ret, xshift, yshift);
        }

        return ret;
    },

    /**
     * @param {ShapePixels} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @param {boolean=} antiAlias
     * @return {ShapePixels}
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
     * @param {ShapePixels} pixels
     * @return {ShapePixels}
     */
    zoomGame: function(pixels) {
        return this.zoomX4(pixels, CONST.GAME_LEFT, CONST.GAME_TOP);
    },

    /**
     * @param {ShapePixels} x1Pixels
     * @param {ShapePixels} x2Pixels
     * @param {number=} xshift
     * @param {number=} yshift
     * @return {ShapePixels}
     * @private
     */
    _antiAlias: function(x1Pixels, x2Pixels, xshift, yshift) {
        // Walk through pixels, see if neighbour pixels match a pattern where
        // pixels are visually missing, and fill those gaps.
        x1Pixels.each(function(x, y) {
            var xx, yy, px, py, push;

            push = function(xdelta, ydelta) {
                var xfill = x * 2 + xdelta + xshift,
                    yfill = y * 2 + ydelta + yshift;
                if (!x2Pixels.has(xfill, yfill)) {
                    x2Pixels.add(xfill, yfill);
                }
            };

            // Vertical bottom-left to top-right fill.
            // Mainly for 2x zoom.
            if (x1Pixels.has(x + 1, y - 1) &&
                !x1Pixels.has(x, y - 1) &&
                !x1Pixels.has(x + 1, y)
            ) {
                push(2, 0);
                push(1, -1);
            }

            // Vertical top-left to bottom-right fill.
            // Mainly for 2x zoom.
            if (x1Pixels.has(x + 1, y + 1) &&
                !x1Pixels.has(x + 1, y) &&
                !x1Pixels.has(x, y + 1)
            ) {
                push(2, 1);
                push(1, 2);
            }

            // Vertical bottom-left and top-right fill.
            // 4x zoom, 4 directions.
            for (xx = -1; xx <= 1; xx += 2) {
                for (yy = -1; yy <= 1; yy += 2) {
                    if (x1Pixels.has(x + xx, y + yy) &&
                        x1Pixels.has(x + xx * 2, y + yy * 2) &&
                        !x1Pixels.has(x + xx, y) &&
                        !x1Pixels.has(x + xx * 2, y + yy)
                    ) {
                        px = (xx < 0) ? -1 : 2;
                        py = (yy < 0) ? 0 : 1;
                        push(px, py);

                        px = (xx < 0) ? -3 : 4;
                        py = (yy < 0) ? -2 : 3;
                        push(px, py);
                    }
                }
            }

            // Misc square corners fill.
            // 4x zoom, 4 directions.
            for (xx = -1; xx <= 1; xx += 2) {
                for (yy = -1; yy <= 1; yy += 2) {
                    if (x1Pixels.has(x - xx, y + yy) &&
                        x1Pixels.has(x + xx, y + yy) &&
                        x1Pixels.has(x + xx * -2, y + yy * 3) &&
                        !x1Pixels.has(x + xx * -2, y + yy * 2)
                    ) {
                        px = (xx < 0) ? 4 : -3;
                        py = (yy < 0) ? -1 : 2;
                        push(px, py);
                    }
                }
            }

        });
        return x2Pixels;
    }

};
