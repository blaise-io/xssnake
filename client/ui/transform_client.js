'use strict';

/**
 * Extend Transform with client-only methods.
 */
xss.extend(xss.Transform.prototype, /** @lends {xss.Transform.prototype} */{

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

        hPadding = typeof hPadding === 'number' ? hPadding : 6;
        vPadding = typeof vPadding === 'number' ? vPadding : 6;

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
     * @return {xss.PixelCollection}
     */
    zoomIn: function(pixels, xshift, yshift) {
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

        return ret;
    },

    /**
     * @param {number} zoomlevel (2 or 4)
     * @param {xss.PixelCollection} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @param {boolean=} antiAlising
     * @return {xss.PixelCollection}
     */
    zoom: function(zoomlevel, pixels, shiftX, shiftY, antiAlising) {
        var zoomedPixels;

        shiftX = shiftX || 0;
        shiftY = shiftY || 0;

        if (2 === zoomlevel) {
            zoomedPixels = xss.transform.zoomIn(pixels, shiftX, shiftY);
        } else if (4 === zoomlevel) {
            zoomedPixels = xss.transform.zoomIn(pixels);
            zoomedPixels = xss.transform.zoomIn(zoomedPixels, shiftX, shiftY);
        } else {
            return pixels; // Unsupported zoom level.
        }

        if (antiAlising !== false) {
            pixels.each(function(x, y) {
                for (var dirX = -1; dirX <= 1; dirX += 2) {
                    for (var dirY = -1; dirY <= 1; dirY += 2) {
                        handlePixel(x, y, dirX, dirY);
                    }
                }
            });
        }

        function add(dirX, dirY, x, y) {
            var baseY, baseX;

            baseX = x * zoomlevel + shiftX;
            baseY = y * zoomlevel + shiftY;

            if (2 === zoomlevel) {
                x = baseX + (dirX === -1 ? 0 : 1);
                y = baseY + (dirY === -1 ? 0 : 1);
                zoomedPixels.add(x, y);
            }

            if (4 === zoomlevel) {
                // Anti-aliasing in all directions.
                for (var dirX2 = -1; dirX2 <= 1; dirX2 += 2) {
                    for (var dirY2 = -1; dirY2 <= 1; dirY2 += 2) {
                        if (dirX === dirX2 && dirY === dirY2) {
                            addX4s(baseX, dirX2, baseY, dirY2);
                        }
                    }
                }
            }
        }

        // XX#
        //  XX
        //   X
        function addX4s(baseX, dirX2, baseY, dirY2) {
            var compX, compY;

            compX = baseX + (dirX2 === -1 ? 0 : 3);
            compY = baseY + (dirY2 === -1 ? 0 : 3);

            zoomedPixels.add(compX, compY);
            zoomedPixels.add(compX - 1 * dirX2, compY);
            zoomedPixels.add(compX - 2 * dirX2, compY);
            zoomedPixels.add(compX - 1 * dirX2, compY - dirY2);
            zoomedPixels.add(compX, compY - dirY2);
            zoomedPixels.add(compX, compY - 2 * dirY2);
        }

        function handlePixel(x, y, dirX, dirY) {
            // !X
            // #!
            if (!pixels.has(x, y - dirY) &&
                !pixels.has(x + dirX, y) &&
                pixels.has(x + dirX, y - dirY)) {
                add(dirX, dirY, x, y - dirY);
            }

            // !X
            // #X
            if (!pixels.has(x - dirX, y - dirY - dirY) &&
                !pixels.has(x - dirX, y - dirY) &&
                !pixels.has(x, y - dirY - dirY) &&
                !pixels.has(x, y - dirY) &&
                pixels.has(x + dirX, y) &&
                pixels.has(x + dirX, y - dirY) && (
                    // !XX
                    // #X
                    // Fixes: 0
                    pixels.has(x + dirX + dirX, y - dirY) ||
                    //  !X
                    // !X!
                    // #X
                    // Fixes: z, Z, 2
                    (
                        pixels.has(x + dirX + dirX, y - dirY - dirY) &&
                        !pixels.has(x + dirX, y - dirY - dirY) &&
                        !pixels.has(x + dirX + dirX, y - dirY)
                    ) ||
                    //  !X!
                    //  #X!
                    //   X!
                    //   XO
                    //    O
                    // Fixes: 1, 4, M, N
                    (
                        pixels.has(x + dirX, y + dirY) &&
                        pixels.has(x + dirX, y + dirY + dirY) &&
                        !pixels.has(x - dirX, y) &&
                        !pixels.has(x + dirX + dirX, y - dirY) &&
                        !pixels.has(x + dirX + dirX, y) &&
                        !pixels.has(x + dirX + dirX, y + dirY) && (
                            !pixels.has(x - dirX, y + dirY + dirY) || // Exclude b, d, p
                            pixels.has(x + dirX + dirX, y + dirY + dirY + dirY) || // 1
                            pixels.has(x + dirX + dirX, y + dirY + dirY)  // 4
                        )
                    )
                )
            ) {
                add(dirX, dirY, x, y - dirY);
            }
        }

        return zoomedPixels;
    }

});
