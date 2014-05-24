'use strict';

/**
 * @param {xss.PixelCollection=} pixels
 * @constructor
 */
xss.BoundingBox = function(pixels) {
    if (pixels) {
        this._calculateFromPixels(pixels);
    }
};

xss.BoundingBox.prototype = {

    x0: 0,
    x1: 0,
    y0: 0,
    y1: 0,

    width: 0,
    height: 0,

    /**
     * @param {number} expand
     * @return {xss.BoundingBox}
     */
    expand: function(expand) {
        this.x0 -= expand;
        this.y0 -= expand;
        this.x1 += expand;
        this.y1 += expand;
        this._calculateDimensions();
        return this;
    },

    /**
     * @param {xss.PixelCollection} pixels
     * @return {xss.BoundingBox}
     * @private
     */
    _calculateFromPixels: function(pixels) {
        var x0 = null,
            x1 = null,
            y0 = null,
            y1 = null;

        pixels.each(function(x, y) {
            x0 = (x0 === null || x0 > x) ? x : x0;
            x1 = (x1 === null || x1 < x) ? x : x1;
            y0 = (y0 === null || y0 > y) ? y : y0;
            y1 = (y1 === null || y1 < y) ? y : y1;
        });

        this.x0 = Number(x0);
        this.x1 = Number(x1);
        this.y0 = Number(y0);
        this.y1 = Number(y1);

        this._calculateDimensions();

        return this;
    },

    /**
     * @return {!xss.BoundingBox}
     * @private
     */
    _calculateDimensions: function() {
        this.width = this.x1 - this.x0;
        this.height = this.y1 - this.y0;
        return this;
    }

};
