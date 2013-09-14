'use strict';

/**
 * @param {ShapePixels=} pixels
 * @constructor
 */
function BoundingBox(pixels) {
    if (pixels) {
        this._calculateFromPixels(pixels);
    }
}

BoundingBox.prototype = {

    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,

    width: 0,
    height: 0,

    /**
     * @param {number} expand
     * @return {BoundingBox}
     */
    expand: function(expand) {
        this.x1 -= expand;
        this.y1 -= expand;
        this.x2 += expand;
        this.y2 += expand;
        this._calculateDimensions();
        return this;
    },

    /**
     * @param {ShapePixels} pixels
     * @return {BoundingBox}
     * @private
     */
    _calculateFromPixels: function(pixels) {
        var x1 = null,
            x2 = null,
            y1 = null,
            y2 = null;

        pixels.each(function(x, y) {
            x1 = (x1 === null || x1 > x) ? x : x1;
            x2 = (x2 === null || x2 < x) ? x : x2;
            y1 = (y1 === null || y1 > y) ? y : y1;
            y2 = (y2 === null || y2 < y) ? y : y2;
        });

        this.x1 = Number(x1);
        this.x2 = Number(x2);
        this.y1 = Number(y1);
        this.y2 = Number(y2);

        this._calculateDimensions();

        return this;
    },

    /**
     * @return {BoundingBox}
     * @private
     */
    _calculateDimensions: function() {
        this.width = this.x2 - this.x1;
        this.height = this.y2 - this.y1;
        return this;
    }

};
