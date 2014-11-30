'use strict';

/**
 * @param {xss.PixelCollection=} pixels
 * @constructor
 */
xss.BoundingBox = function(pixels) {
    this.x0 = 0;
    this.x1 = 0;
    this.y0 = 0;
    this.y1 = 0;
    this.width = 0;
    this.height = 0;

    if (pixels) {
        this.calculate(pixels);
    }
};

xss.BoundingBox.prototype = {

    /**
     * @param {number} expand
     * @return {xss.BoundingBox}
     */
    expand: function(expand) {
        this.x0 -= expand;
        this.y0 -= expand;
        this.x1 += expand;
        this.y1 += expand;
        this.setDimensions();
        return this;
    },

    /**
     * @param {xss.PixelCollection} pixels
     * @return {xss.BoundingBox}
     * @private
     */
    calculate: function(pixels) {
        var x0 = xss.WIDTH,
            x1 = 0,
            y0 = xss.HEIGHT,
            y1 = 0;

        pixels.each(function(x, y) {
            if (x0 > x) {x0 = x;}
            if (x1 < x) {x1 = x;}
            if (y0 > y) {y0 = y;}
            if (y1 < y) {y1 = y;}
        });

        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;

        this.setDimensions();

        return this;
    },

    setDimensions: function() {
        this.width = this.x1 - this.x0;
        this.height = this.y1 - this.y0;
    }

};
