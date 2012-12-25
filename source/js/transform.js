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
     * @param {number=} horShift
     * @param {number=} verShift
     * @return {XSS.ShapePixels}
     */
    zoomX2: function(pixels, horShift, verShift) {
        var ret = [], x, y;
        horShift = horShift || 0;
        verShift = verShift || 0;
        for (var i = 0, m = pixels.length; i < m; i++) {
            x = pixels[i][0] * 2;
            y = pixels[i][1] * 2;
            ret.push(
                [horShift +     x, verShift +     y],
                [horShift +     x, verShift + 1 + y],
                [horShift + 1 + x, verShift +     y],
                [horShift + 1 + x, verShift + 1 + y]
            );
        }
        return ret;
    },

    /**
     * @param {XSS.ShapePixels} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @return {XSS.ShapePixels}
     */
    zoomX4: function(pixels, shiftX, shiftY) {
        return this.zoomX2(this.zoomX2(pixels, 0, 0), shiftX || 0, shiftY || 0);
    },

    /**
     * @param {XSS.ShapePixels} pixels
     * @return {XSS.ShapePixels}
     */
    zoomGame: function(pixels) {
        return this.zoomX4(pixels, XSS.GAME_LEFT, XSS.GAME_TOP);
    }

};