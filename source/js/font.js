/*jshint globalstrict:true, sub:true*/
/*globals XSS, Shape*/

'use strict';

/**
 * Font
 * Pixel font definition and writing texts
 * @constructor
 */
function Font() {}

/**
 * No descenders height
 * @const
 * @type {number}
 */
Font.MIN = 5;

/**
 * Descenders height
 * @const
 * @type {number}
 */
Font.MAX = 6;

/** @typedef {Array.<Array.<boolean>>} */
var BoolPixels;

Font.prototype = {

    /**
     * @param {number} x
     * @param {number} y
     * @param {string} str
     * @param {boolean} inverted
     * @return {ShapePixels}
     */
    pixels: function(x, y, str, inverted) {
        var glyph, pixels = [],
            split = this._splitAndReplaceMissingChars(str);

        if (inverted) {
            this._invertHorWhitespace(pixels, x - 2, y);
        }

        for (var i = 0, m = split.length; i < m; i++) {
            glyph = XSS.shapegen.raw(split[i]);
            this._drawGlyph(pixels, x, y, glyph, inverted);
            if (inverted) {
                this._invertHorWhitespace(pixels, x - 1, y);
            }
            x = x + 1 + glyph[0].length;
        }

        if (inverted) {
            this._invertHorWhitespace(pixels, x - 1, y);
            this._invertHorWhitespace(pixels, x, y);
        }

        return pixels;
    },

    /**
     * @param {number} x
     * @param {number} y
     * @param {string} str
     * @param {boolean} inverted
     * @return {Shape}
     */
    shape: function(x, y, str, inverted) {
        return new Shape(this.pixels.apply(this, arguments));
    },

    /**
     * @param {string} str
     * @return {number}
     */
    width: function(str) {
        var len = 0, split = this._splitAndReplaceMissingChars(str);
        for (var i = 0, m = split.length; i < m; i++) {
            len += XSS.shapegen.raw(split[i])[0].length;
            if (i + 1 !== m) {
                len += 1;
            }
        }
        return len;
    },

    /**
     * @param {ShapePixels} pixels
     * @param {number} x
     * @param {number} y
     * @private
     */
    _invertHorWhitespace: function(pixels, x, y) {
        for (var i = -2; i < Font.MAX + 1; i++) {
            pixels.push([x, y + i]);
        }
    },

    /**
     * @param {ShapePixels} pixels
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @private
     */
    _invertVertWhitespace: function(pixels, x, y, width) {
        for (var i = 0; i + 1 < width; i++) {
            pixels.push([x + i, y]);
        }
    },

    /**
     * @param {string} str
     * @return {Array.<string>}
     * @private
     */
    _splitAndReplaceMissingChars: function(str) {
        var ret = [], arr = str.split('');
        for (var i = 0, m = arr.length; i < m; i++) {
            if (XSS.PIXELS[arr[i]]) {
                ret.push(arr[i]);
            } else {
                ret.push('■');
            }
        }
        return ret;
    },

    /**
     * @param {ShapePixels} pixels
     * @param {number} x
     * @param {number} y
     * @param {BoolPixels} glyph
     * @param {boolean} inverted
     * @private
     */
    _drawGlyph: function(pixels, x, y, glyph, inverted) {
        var glyphWidth;
        for (var xx = 0, m = glyph.length; xx < m; xx++) { // y
            for (var yy = 0, mm = glyph[0].length; yy < mm; yy++) { // x
                var pixel = glyph[xx] ? glyph[xx][yy] : false;
                if ((pixel && !inverted) || (!pixel && inverted)) {
                    pixels.push([yy + x, xx + y]);
                }
            }
        }
        if (inverted) {
            glyphWidth = glyph[0].length + 1;
            this._invertVertWhitespace(pixels, x, y - 1, glyphWidth); // Overline 1
            this._invertVertWhitespace(pixels, x, y - 2, glyphWidth); // Overline 2
            this._invertVertWhitespace(pixels, x, y + Font.MAX, glyphWidth); // Underline 2
            if (glyph.length === Font.MIN) {
                this._invertVertWhitespace(pixels, x, y + Font.MIN, glyphWidth); // Underline 1 when uppercase
            }
        }
    }

};