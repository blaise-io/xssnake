'use strict';

/**
 * Transform
 * Pixel transformations
 * @constructor
 */
xss.Transform = function() {};

xss.Transform.prototype = {

    /**
     * @param {xss.ShapePixels} pixels
     * @param {number=} xshift
     * @param {number=} yshift
     * @return {xss.ShapePixels}
     */
    shift: function(pixels, xshift, yshift) {
        var ret;

        if (xshift === 0 && yshift === 0) {
            return pixels; // No shift
        }

        ret = new xss.ShapePixels();
        xshift = xshift || 0;
        yshift = yshift || 0;

        pixels.each(function(x, y) {
            ret.add(x + xshift, y + yshift);
        });

        return ret;
    }

};
