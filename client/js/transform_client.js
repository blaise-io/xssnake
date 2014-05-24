'use strict';

/**
 * Extend Transform with client-only methods.
 */
xss.util.extend(xss.Transform.prototype, /** @lends {xss.Transform.prototype} */{

    /**
     * @param {xss.Shape} shape
     * @param {number=} hPadding
     * @param {number=} vPadding
     * @param {boolean=} round
     * @return {xss.Shape}
     */
    outline: function(shape, hPadding, vPadding, round) {
        var r, x0, x1, y0, y1, bbox = shape.bbox();

        r = (typeof round === 'undefined') ? 1 : 0;

        hPadding = (hPadding || 6);
        vPadding = (vPadding || 4);

        // Keep in viewport
        if (bbox.y0 - vPadding < 0) {
            shape.set(this.shift(shape.pixels, 0, vPadding - bbox.y0));
            bbox = shape.bbox();
        }

        x0 = bbox.x0 - hPadding;
        x1 = bbox.x1 + hPadding;
        y0 = bbox.y0 - vPadding;
        y1 = bbox.y1 + vPadding;

        shape.add(
            xss.shapegen.line(x0, y0+1, x0, y1),      // Left
            xss.shapegen.line(x0+r, y0, x1-r, y0),    // Top
            xss.shapegen.line(x1, y0+1, x1, y1),      // Right
            xss.shapegen.line(x0, y1, x1, y1),        // Bottom
            xss.shapegen.line(x0+r, y1+1, x1-r, y1+1) // Bottom 2
        );

        // Don't clear the missing pixel in the corners
        // because of rounded corners:
        shape.bbox(-1);

        return shape;
    },

    /**
     * @param {xss.PixelCollection} pixels
     * @param {number=} xshift
     * @param {number=} yshift
     * @param {boolean=} antiAlias
     * @return {xss.PixelCollection}
     */
    zoomX2: function(pixels, xshift, yshift, antiAlias) {
        var ret = new xss.PixelCollection();

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
     * @param {xss.PixelCollection} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @param {boolean=} antiAlias
     * @return {xss.PixelCollection}
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
     * @param {xss.PixelCollection} pixels
     * @return {xss.PixelCollection}
     */
    zoomGame: function(pixels) {
        return this.zoomX4(pixels, xss.GAME_LEFT, xss.GAME_TOP);
    },

    /**
     * @param {xss.PixelCollection} x0Pixels
     * @param {xss.PixelCollection} x1Pixels
     * @param {number=} xshift
     * @param {number=} yshift
     * @return {xss.PixelCollection}
     * @private
     */
    _antiAlias: function(x0Pixels, x1Pixels, xshift, yshift) {
        // Walk through pixels, see if neighbour pixels match a pattern where
        // pixels are visually missing, and fill those gaps.
        x0Pixels.each(function(x, y) {
            var xx, yy, px, py, push;

            push = function(xdelta, ydelta) {
                var xfill = x * 2 + xdelta + xshift,
                    yfill = y * 2 + ydelta + yshift;
                if (!x1Pixels.has(xfill, yfill)) {
                    x1Pixels.add(xfill, yfill);
                }
            };

            // Vertical bottom-left to top-right fill.
            // Mainly for 2x zoom.
            if (x0Pixels.has(x + 1, y - 1) &&
                !x0Pixels.has(x, y - 1) &&
                !x0Pixels.has(x + 1, y)
            ) {
                push(2, 0);
                push(1, -1);
            }

            // Vertical top-left to bottom-right fill.
            // Mainly for 2x zoom.
            if (x0Pixels.has(x + 1, y + 1) &&
                !x0Pixels.has(x + 1, y) &&
                !x0Pixels.has(x, y + 1)
            ) {
                push(2, 1);
                push(1, 2);
            }

            // Vertical bottom-left and top-right fill.
            // 4x zoom, 4 directions.
            for (xx = -1; xx <= 1; xx += 2) {
                for (yy = -1; yy <= 1; yy += 2) {
                    if (x0Pixels.has(x + xx, y + yy) &&
                        x0Pixels.has(x + xx * 2, y + yy * 2) &&
                        !x0Pixels.has(x + xx, y) &&
                        !x0Pixels.has(x + xx * 2, y + yy)
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
                    if (x0Pixels.has(x - xx, y + yy) &&
                        x0Pixels.has(x + xx, y + yy) &&
                        x0Pixels.has(x + xx * -2, y + yy * 3) &&
                        !x0Pixels.has(x + xx * -2, y + yy * 2)
                    ) {
                        px = (xx < 0) ? 4 : -3;
                        py = (yy < 0) ? -1 : 2;
                        push(px, py);
                    }
                }
            }

        });
        return x1Pixels;
    }

});
