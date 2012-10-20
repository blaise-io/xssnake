/*jshint globalstrict:true */
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
     * @param {number} x
     * @param {number} y
     * @return {Array}
     */
    shift: function(pixels, x, y) {
        var sx, sy, ret = [];

        for (var i = 0, m = pixels.length; i < m; ++i) {
            sx = pixels[i][0] + x;
            sy = pixels[i][1] + y;
            if (sx >= 0 && sy >= 0 && sx <= XSS.PIXELS_H && sy <= XSS.PIXELS_V) {
                ret.push([sx, sy]);
            }
        }

        return ret;
    },

    /**
     * @param {Array.<Array>} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @return {Array.<Array>}
     */
    zoomX2: function(pixels, shiftX, shiftY) {
        var ret = [], x, y;
        shiftX = shiftX || 0;
        shiftY = shiftY || 0;
        for (var i = 0, m = pixels.length; i < m; ++i) {
            x = pixels[i][0] * 2;
            y = pixels[i][1] * 2;
            ret.push(
                [shiftX +     x, shiftY +     y],
                [shiftX +     x, shiftY + 1 + y],
                [shiftX + 1 + x, shiftY +     y],
                [shiftX + 1 + x, shiftY + 1 + y]
            );
        }
        return ret;
    },

    /**
     * @param {Array.<Array>} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @return {Array.<Array>}
     */
    zoomX4: function(pixels, shiftX, shiftY) {
        return this.zoomX2(this.zoomX2(pixels, 0, 0), shiftX || 0, shiftY || 0);
    },

    /**
     * @param {Array.<Array>} pixels
     * @return {Array.<Array>}
     */
    zoomGame: function(pixels) {
        return this.zoomX4(pixels, XSS.GAME_LEFT, XSS.GAME_TOP);
    }

};