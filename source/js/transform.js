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
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @param {boolean=} antiAlias
     * @return {XSS.ShapePixels}
     */
    zoomX2: function(pixels, shiftX, shiftY, antiAlias) {
        var ret = [], x, y;
        shiftX = shiftX || 0;
        shiftY = shiftY || 0;
        for (var i = 0, m = pixels.length; i < m; i++) {
            x = pixels[i][0] * 2;
            y = pixels[i][1] * 2;
            ret.push(
                [x + shiftX, y + shiftY],
                [x + shiftX, y + shiftY + 1],
                [x + shiftX + 1, y + shiftY],
                [x + shiftX + 1, y + shiftY + 1]
            );
        }

        if (antiAlias) {
            ret = this._antiAlias(pixels, ret, shiftX, shiftY);
        }

        return ret;
    },

    /**
     * @param {XSS.ShapePixels} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @param {boolean=} antiAlias
     * @return {XSS.ShapePixels}
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
     * @param {XSS.ShapePixels} pixels
     * @return {XSS.ShapePixels}
     */
    zoomGame: function(pixels) {
        return this.zoomX4(pixels, XSS.GAME_LEFT, XSS.GAME_TOP);
    },

    /**
     * @param {XSS.ShapePixels} origPixels
     * @param {XSS.ShapePixels} zoomedPixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @return {XSS.ShapePixels}
     * @private
     */
    _antiAlias: function(origPixels, zoomedPixels, shiftX, shiftY) {
        var has, push;

        has = function(p, x, y) {
            return this._hasPixel(origPixels, p[0] + x, p[1] + y);
        }.bind(this);

        push = function(p, x, y) {
            x = p[0] * 2 + x + shiftX;
            y = p[1] * 2 + y + shiftY;
            if (!this._hasPixel(zoomedPixels, x, y)) {
                zoomedPixels.push([x, y]);
            }
        }.bind(this);

        for (var i = 0, m = origPixels.length; i < m; i++) {
            var p = origPixels[i];

            // ?
            // /#
            // x/?
            if (has(p, 1, -1) &&
                !has(p, 0, -1) &&
                !has(p, 1, 0) &&
                (!has(p, 2, 0) || !has(p, 0, -2))
            ) {
                push(p, +2, +0); // Right
                push(p, +1, -1); // Top
            }

            // x\?
            // \#
            // ?
            if (has(p, 1, 1) &&
                !has(p, 1, 0) &&
                !has(p, 0, 1) &&
                (!has(p, 2, 0) || !has(p, 0, 2))
            ) {
                push(p, +2, +1); // Right
                push(p, +1, +2); // Bottom
            }

            // x\
            // ##\
            // # #
            else if (has(p, 0, 1) &&
                has(p, 1, 1) &&
                has(p, 0, 2) &&
                has(p, 0, 2) &&
                has(p, 2, 2) &&
                !has(p, 1, 0) &&
                !has(p, 2, 1)
            ) {
                push(p, +2, +1);
                push(p, +4, +3);
            }

            //  /x
            // /##
            // # #
            else if (has(p, 0, 1) &&
                has(p, -1, 1) &&
                has(p, 0, 2) &&
                has(p, -2, 2) &&
                !has(p, -1, 0) &&
                !has(p, -2, 1)
            ) {
                push(p, -1, +1);
                push(p, -3, +3);
            }

            // # #
            // \##
            //  \x
            else if (has(p, -2, -2) &&
                has(p, 0, -2) &&
                has(p, -1, -1) &&
                has(p, 0, -1) &&
                !has(p, -2, -1) &&
                !has(p, -1, 0)
            ) {
                push(p, -3, -2);
                push(p, -1, 0);
            }

            // # #
            // ##/
            // x/
            else if (has(p, 2, -2) &&
                has(p, 0, -2) &&
                has(p, 1, -1) &&
                has(p, 0, -1) &&
                !has(p, 2, -1) &&
                !has(p, 1, 0)
            ) {
                push(p, 4, -2);
                push(p, 2, 0);
            }
        }
        return zoomedPixels;
    },

    /**
     * @param {XSS.ShapePixels} pixels
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     * @private
     */
    _hasPixel: function(pixels, x, y) {
        for (var i = 0, m = pixels.length; i < m; i++) {
            if (pixels[i][0] === x && pixels[i][1] === y) {
                return true;
            }
        }
        return false;
    }

};