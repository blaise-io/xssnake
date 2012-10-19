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

Font.prototype = {

    draw: function(x, y, str, inverted) {
        var glyph, pixels = [];

        str = this._replaceMissingCharacters(str);

        if (inverted) {
            this._invertHorWhitespace(pixels, x - 2, y);
        }

        for (var i = 0, m = str.length; i < m; i++) {
            glyph = XSS.shapes.raw(str[i]);
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
     * @param {string} str
     * @return {number}
     */
    width: function(str) {
        var len = 0;
        str = this._replaceMissingCharacters(str);
        for (var i = 0, m = str.length; i < m; i++) {
            len += XSS.shapes.raw(str[i])[0].length;
            if (i + 1 !== m) {
                len += 1;
            }
        }
        return len;
    },

    /** @private */
    _invertHorWhitespace: function(pixels, x, y) {
        for (var i = -2; i < Font.MAX + 1; i++) {
            pixels.push([x, y + i]);
        }
    },

    /** @private */
    _invertVertWhitespace: function(pixels, x, y, width) {
        for (var i = 0; i + 1 < width; i++) {
            pixels.push([x + i, y]);
        }
    },

    /** @private */
    _replaceMissingCharacters: function(str) {
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

    /** @private */
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