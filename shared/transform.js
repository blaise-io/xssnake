'use strict';

/**
 * Transform
 * Pixel transformations
 * @constructor
 */
xss.Transform = function() {};

xss.Transform.prototype = {

    /**
     * @param {xss.PixelCollection} pixels
     * @param {number=} xshift
     * @param {number=} yshift
     * @return {xss.PixelCollection}
     */
    shift: function(pixels, xshift, yshift) {
        var ret;

        if (xshift === 0 && yshift === 0) {
            return pixels; // No shift
        }

        ret = new xss.PixelCollection();
        xshift = xshift || 0;
        yshift = yshift || 0;

        pixels.each(function(x, y) {
            ret.add(x + xshift, y + yshift);
        });

        return ret;
    }

};
