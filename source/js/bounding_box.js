/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS*/
'use strict';

/**
 * @param {number=} x1
 * @param {number=} y1
 * @param {number=} x2
 * @param {number=} y2
 * @constructor
 */
function BoundingBox(x1, y1, x2, y2) {
    this.x1 = x1 || 0;
    this.y1 = y1 || 0;
    this.x2 = x2 || 0;
    this.y2 = y2 || 0;
    this._calculateDimensions();
}

BoundingBox.prototype = {

    /**
     * @param {Shape} shape
     * @return {BoundingBox}
     */
    ofShape: function(shape) {
        var pixels = shape.pixels,
            x1 = null,
            x2 = null,
            y1 = null,
            y2 = null;

        for (var i = 0, m = pixels.length; i < m; i++) {
            var x = pixels[i][0],
                y = pixels[i][1];
            x1 = (x1 === null || x1 > x) ? x : x1;
            x2 = (x2 === null || x2 < x) ? x : x2;
            y1 = (y1 === null || y1 > y) ? y : y1;
            y2 = (y2 === null || y2 < y) ? y : y2;
        }

        this.x1 = Number(x1);
        this.x2 = Number(x2) + 1;
        this.y1 = Number(y1);
        this.y2 = Number(y2) + 1;

        this._calculateDimensions();

        return this;
    },

    /**
     * @param {number} expandBy
     * @return {BoundingBox}
     */
    expand: function(expandBy) {
        this.x1 -= expandBy;
        this.y1 -= expandBy;
        this.x2 += expandBy;
        this.y2 += expandBy;
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