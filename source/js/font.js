/*jshint globalstrict:true, sub:true*/
/*globals XSS, PixelEntity*/

'use strict';

/**
 * Font
 * Pixel font definition and writing texts
 * @constructor
 */
function Font() {
    this._buildGlyphCache();
}

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
            this._invertHorizontalWhitespace(pixels, x - 2, y);
        }

        for (var i = 0, m = str.length; i < m; i++) {
            glyph = this._glyphs[str[i]];
            this._drawGlyph(pixels, x, y, glyph, inverted);
            if (inverted) {
                this._invertHorizontalWhitespace(pixels, x - 1, y);
            }
            x = x + 1 + glyph[0].length;
        }

        if (inverted) {
            this._invertHorizontalWhitespace(pixels, x - 1, y);
            this._invertHorizontalWhitespace(pixels, x, y);
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
            len += this._glyphs[str[i]][0].length;
            if (i + 1 !== m) {
                len += 1;
            }
        }
        return len;
    },

    /** @private */
    _invertHorizontalWhitespace: function(pixels, x, y) {
        for (var i = -2; i < Font.MAX + 1; i++) {
            pixels.push([x, y + i]);
        }
    },

    /** @private */
    _invertVerticalWhitespace: function(pixels, x, y, width) {
        for (var i = 0; i + 1 < width; i++) {
            pixels.push([x + i, y]);
        }
    },

    /** @private */
    _replaceMissingCharacters: function(str) {
        var strNew = [],
            strArr = str.split('');

        for (var i = 0, m = strArr.length; i < m; i++) {
            if (this._glyphs[strArr[i]]) {
                strNew.push(strArr[i]);
            } else {
                strNew.push('■');
            }
        }

        return strNew;
    },

    /** @private */
    _drawGlyph: function(pixels, x, y, glyph, inverted) {
        var pixel, invertWidth;
        for (var xx = 0, m = glyph.length; xx < m; xx++) { // y
            for (var yy = 0, mm = glyph[0].length; yy < mm; yy++) { // x
                pixel = glyph[xx] ? glyph[xx][yy] : false;
                if ((pixel && !inverted) || (!pixel && inverted)) {
                    pixels.push([yy + x, xx + y]);
                }
            }
        }
        if (inverted) {
            invertWidth = glyph[0].length + 1;
            this._invertVerticalWhitespace(pixels, x, y - 1, invertWidth); // Overline 1
            this._invertVerticalWhitespace(pixels, x, y - 2, invertWidth); // Overline 2
            this._invertVerticalWhitespace(pixels, x, y + Font.MAX, invertWidth); // Underline 2
            if (glyph.length === Font.MIN) {
                this._invertVerticalWhitespace(pixels, x, y + Font.MIN, invertWidth); // Underline 1 when uppercase
            }
        }
    },

    /** @private */
    _parseGlyph: function(height, glyph) {
        var row, glyphArr,
            glyphFinal = [];

        glyphArr = glyph.split('');

        for (var i = 0, m = glyphArr.length; i < m; i++) {
            row = Math.floor(i / (m / height));
            if (!glyphFinal[row]) {
                glyphFinal[row] = [];
            }
            glyphFinal[row].push((glyphArr[i] === 'X'));
        }

        return glyphFinal;
    },

    /** @private */
    _glyphs: {},

    /** @private */
    _buildGlyphCache: function() {
        var glyphs = this._glyphs;

        // Define glyphs
        glyphs['■'] = this._parseGlyph(Font.MIN, '' +
            'XXXX' +
            'XXXX' +
            'XXXX' +
            'XXXX' +
            'XXXX');

        glyphs['♥'] = this._parseGlyph(Font.MAX, '' +
            '  XX XX  ' +
            ' XXXXXXX ' +
            ' XXXXXXX ' +
            '  XXXXX  ' +
            '   XXX   ' +
            '    X    ');

        glyphs['☠'] = this._parseGlyph(Font.MAX, '' +
            ' XX XXXX XX ' +
            ' X XXXXXX X ' +
            '   X XX X   ' +
            '   XXXXXX   ' +
            ' X  XXXX  X ' +
            ' XX XXXX XX ');

        glyphs['←'] = this._parseGlyph(Font.MIN, '' +
            '  X  ' +
            ' XX  ' +
            'XXXXX' +
            ' XX  ' +
            '  X  ');

        glyphs['↑'] = this._parseGlyph(Font.MIN, '' +
            '  X  ' +
            ' XXX ' +
            'XXXXX' +
            '  X  ' +
            '  X  ');

        glyphs['→'] = this._parseGlyph(Font.MIN, '' +
            '  X  ' +
            '  XX ' +
            'XXXXX' +
            '  XX ' +
            '  X  ');

        glyphs['↓'] = this._parseGlyph(Font.MIN, '' +
            '  X  ' +
            '  X  ' +
            'XXXXX' +
            ' XXX ' +
            '  X  ');

        glyphs['•'] = this._parseGlyph(Font.MIN, '' +
            '  ' +
            '  ' +
            'XX' +
            'XX' +
            '  ');

        glyphs['@'] = this._parseGlyph(Font.MAX, '' +
            ' XXXX ' +
            'X    X' +
            'X XX X' +
            'X XXX ' +
            'X     ' +
            ' XXX  ');

        glyphs[' '] = this._parseGlyph(Font.MIN, '' +
            '  ' +
            '  ' +
            '  ' +
            '  ' +
            '  ');

        glyphs['.'] = this._parseGlyph(Font.MIN, '' +
            ' ' +
            ' ' +
            ' ' +
            ' ' +
            'X');

        glyphs[','] = this._parseGlyph(Font.MAX, '' +
            ' ' +
            ' ' +
            ' ' +
            ' ' +
            'X' +
            'X');

        glyphs[':'] = this._parseGlyph(Font.MIN, '' +
            ' ' +
            ' ' +
            'X' +
            ' ' +
            'X');

        glyphs[';'] = this._parseGlyph(Font.MAX, '' +
            '  ' +
            '  ' +
            ' X' +
            '  ' +
            'XX' +
            ' X');

        glyphs['!'] = this._parseGlyph(Font.MIN, '' +
            'X' +
            'X' +
            'X' +
            ' ' +
            'X');

        glyphs['?'] = this._parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X  X' +
            '  X ' +
            '    ' +
            '  X ');

        glyphs['&'] = this._parseGlyph(Font.MIN, '' +
            ' X  ' +
            'X X ' +
            ' X  ' +
            'X X ' +
            ' X X');

        glyphs['-'] = this._parseGlyph(Font.MIN, '' +
            '    ' +
            '    ' +
            'XXXX' +
            '    ' +
            '    ');

        glyphs['_'] = this._parseGlyph(Font.MAX, '' +
            '    ' +
            '    ' +
            '    ' +
            '    ' +
            '    ' +
            'XXXX');

        glyphs['+'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            '   ' +
            ' X ' +
            'XXX' +
            ' X ');

        glyphs['='] = this._parseGlyph(Font.MIN, '' +
            '    ' +
            'XXXX' +
            '    ' +
            'XXXX');

        glyphs['‘'] = glyphs['’'] = glyphs["'"] = this._parseGlyph(Font.MIN, '' +
            'X' +
            'X' +
            ' ' +
            ' ' +
            ' ');

        glyphs['“'] = glyphs['”'] = glyphs['"'] = this._parseGlyph(Font.MIN, '' +
            'X X' +
            'X X' +
            '   ' +
            '   ' +
            '   ');

        glyphs['('] = this._parseGlyph(Font.MAX, '' +
            '  X' +
            ' X ' +
            ' X ' +
            ' X ' +
            ' X ' +
            '  X');

        glyphs[')'] = this._parseGlyph(Font.MAX, '' +
            'X  ' +
            ' X ' +
            ' X ' +
            ' X ' +
            ' X ' +
            'X  ');

        glyphs['['] = this._parseGlyph(Font.MAX, '' +
            ' XX' +
            ' X ' +
            ' X ' +
            ' X ' +
            ' X ' +
            ' XX');

        glyphs[']'] = this._parseGlyph(Font.MAX, '' +
            'XX ' +
            ' X ' +
            ' X ' +
            ' X ' +
            ' X ' +
            'XX ');

        glyphs['{'] = this._parseGlyph(Font.MAX, '' +
            '   X' +
            '  X ' +
            ' X  ' +
            '  X ' +
            '  X ' +
            '   X');

        glyphs['}'] = this._parseGlyph(Font.MAX, '' +
            'X   ' +
            ' X  ' +
            '  X ' +
            ' X  ' +
            ' X  ' +
            'X   ');

        glyphs['\\'] = this._parseGlyph(Font.MIN, '' +
            'X    ' +
            ' X   ' +
            '  X  ' +
            '   X ' +
            '    X');

        glyphs['/'] = this._parseGlyph(Font.MIN, '' +
            '    X' +
            '   X ' +
            '  X  ' +
            ' X   ' +
            'X    ');

        glyphs['<'] = this._parseGlyph(Font.MIN, '' +
            '  X ' +
            ' X  ' +
            'X   ' +
            ' X  ' +
            '  X ');

        glyphs['>'] = this._parseGlyph(Font.MIN, '' +
            ' X  ' +
            '  X ' +
            '   X' +
            '  X ' +
            ' X  ');

        glyphs['0'] = this._parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X XX' +
            'X  X' +
            'XX X' +
            ' XX ');

        glyphs['1'] = this._parseGlyph(Font.MIN, '' +
            '  X ' +
            ' XX ' +
            '  X ' +
            '  X ' +
            ' XXX');

        glyphs['2'] = this._parseGlyph(Font.MIN, '' +
            'XXX ' +
            '   X' +
            '  X ' +
            ' X  ' +
            'XXXX');

        glyphs['3'] = this._parseGlyph(Font.MIN, '' +
            'XXX ' +
            '   X' +
            ' XX ' +
            '   X' +
            'XXX ');

        glyphs['4'] = this._parseGlyph(Font.MIN, '' +
            'X  X' +
            'X  X' +
            'XXXX' +
            '   X' +
            '   X');

        glyphs['5'] = this._parseGlyph(Font.MIN, '' +
            'XXXX' +
            'X   ' +
            'XXX ' +
            '   X' +
            'XXX ');

        glyphs['6'] = this._parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X   ' +
            'XXX ' +
            'X  X' +
            ' XX ');

        glyphs['7'] = this._parseGlyph(Font.MIN, '' +
            'XXXX' +
            '  X ' +
            ' X  ' +
            ' X  ' +
            ' X  ');

        glyphs['8'] = this._parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X  X' +
            ' XX ' +
            'X  X' +
            ' XX ');
        glyphs['9'] = this._parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X  X' +
            ' XXX' +
            '   X' +
            ' XX ');

        glyphs['A'] = this._parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X  X' +
            'XXXX' +
            'X  X' +
            'X  X');

        glyphs['B'] = this._parseGlyph(Font.MIN, '' +
            'XXX ' +
            'X  X' +
            'XXX ' +
            'X  X' +
            'XXX ');

        glyphs['C'] = this._parseGlyph(Font.MIN, '' +
            ' XXX' +
            'X   ' +
            'X   ' +
            'X   ' +
            ' XXX');

        glyphs['D'] = this._parseGlyph(Font.MIN, '' +
            'XXX ' +
            'X  X' +
            'X  X' +
            'X  X' +
            'XXX ');

        glyphs['E'] = this._parseGlyph(Font.MIN, '' +
            'XXXX' +
            'X   ' +
            'XXX ' +
            'X   ' +
            'XXXX');

        glyphs['F'] = this._parseGlyph(Font.MIN, '' +
            'XXXX' +
            'X   ' +
            'XXX ' +
            'X   ' +
            'X   ');

        glyphs['G'] = this._parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X   ' +
            'X XX' +
            'X  X' +
            ' XXX');

        glyphs['H'] = this._parseGlyph(Font.MIN, '' +
            'X  X' +
            'X  X' +
            'XXXX' +
            'X  X' +
            'X  X');

        glyphs['I'] = this._parseGlyph(Font.MIN, '' +
            'X' +
            'X' +
            'X' +
            'X' +
            'X');

        glyphs['J'] = this._parseGlyph(Font.MIN, '' +
            'XXX' +
            '  X' +
            '  X' +
            '  X' +
            'XX ');

        glyphs['K'] = this._parseGlyph(Font.MIN, '' +
            'X  X' +
            'X X ' +
            'XX  ' +
            'X X ' +
            'X  X');

        glyphs['L'] = this._parseGlyph(Font.MIN, '' +
            'X  ' +
            'X  ' +
            'X  ' +
            'X  ' +
            'XXX');

        glyphs['M'] = this._parseGlyph(Font.MIN, '' +
            'X   X' +
            'XX XX' +
            'X X X' +
            'X   X' +
            'X   X');

        glyphs['N'] = this._parseGlyph(Font.MIN, '' +
            'X  X' +
            'XX X' +
            'X XX' +
            'X  X' +
            'X  X');

        glyphs['O'] = this._parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X  X' +
            'X  X' +
            'X  X' +
            ' XX ');

        glyphs['P'] = this._parseGlyph(Font.MIN, '' +
            'XXX ' +
            'X  X' +
            'XXX ' +
            'X   ' +
            'X   ');

        glyphs['Q'] = this._parseGlyph(Font.MAX, '' +
            ' XX ' +
            'X  X' +
            'X  X' +
            'X  X' +
            ' XX ' +
            '   X');

        glyphs['R'] = this._parseGlyph(Font.MIN, '' +
            'XXX ' +
            'X  X' +
            'XXX ' +
            'X  X' +
            'X  X');

        glyphs['S'] = this._parseGlyph(Font.MIN, '' +
            ' XXX' +
            'X   ' +
            ' XX ' +
            '   X' +
            'XXX ');

        glyphs['T'] = this._parseGlyph(Font.MIN, '' +
            'XXXXX' +
            '  X  ' +
            '  X  ' +
            '  X  ' +
            '  X  ');

        glyphs['U'] = this._parseGlyph(Font.MIN, '' +
            'X  X' +
            'X  X' +
            'X  X' +
            'X  X' +
            ' XX ');

        glyphs['V'] = this._parseGlyph(Font.MIN, '' +
            'X   X' +
            'X   X' +
            'X   X' +
            ' X X ' +
            '  X  ');

        glyphs['W'] = this._parseGlyph(Font.MIN, '' +
            'X   X' +
            'X   X' +
            'X X X' +
            'X X X' +
            ' X X ');

        glyphs['X'] = this._parseGlyph(Font.MIN, '' +
            'X  X' +
            'X  X' +
            ' XX ' +
            'X  X' +
            'X  X');

        glyphs['Y'] = this._parseGlyph(Font.MIN, '' +
            'X   X' +
            ' X X ' +
            '  X  ' +
            '  X  ' +
            '  X  ');

        glyphs['Z'] = this._parseGlyph(Font.MIN, '' +
            'XXXXX' +
            '   X ' +
            '  X  ' +
            ' X   ' +
            'XXXXX');

        glyphs['a'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            ' XX' +
            'X X' +
            'X X' +
            ' XX');

        glyphs['b'] = this._parseGlyph(Font.MIN, '' +
            'X  ' +
            'XX ' +
            'X X' +
            'X X' +
            'XX ');

        glyphs['c'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            ' XX' +
            'X  ' +
            'X  ' +
            ' XX');

        glyphs['d'] = this._parseGlyph(Font.MIN, '' +
            '  X' +
            ' XX' +
            'X X' +
            'X X' +
            ' XX');

        glyphs['e'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            ' XX' +
            'X X' +
            'XX ' +
            ' XX');

        glyphs['f'] = this._parseGlyph(Font.MIN, '' +
            ' XX' +
            'X  ' +
            'XX ' +
            'X  ' +
            'X  ');

        glyphs['g'] = this._parseGlyph(Font.MAX, '' +
            '   ' +
            ' XX' +
            'X X' +
            'XX ' +
            '  X' +
            'XX ');

        glyphs['h'] = this._parseGlyph(Font.MIN, '' +
            'X  ' +
            'X  ' +
            'XX ' +
            'X X' +
            'X X');

        glyphs['i'] = this._parseGlyph(Font.MIN, '' +
            'X' +
            ' ' +
            'X' +
            'X' +
            'X');

        glyphs['j'] = this._parseGlyph(Font.MAX, '' +
            ' X' +
            '  ' +
            ' X' +
            ' X' +
            ' X' +
            'X ');

        glyphs['k'] = this._parseGlyph(Font.MIN, '' +
            'X  ' +
            'X X' +
            'XX ' +
            'X X' +
            'X X');

        glyphs['l'] = this._parseGlyph(Font.MIN, '' +
            'X ' +
            'X ' +
            'X ' +
            'X ' +
            ' X');

        glyphs['m'] = this._parseGlyph(Font.MIN, '' +
            '     ' +
            ' X X ' +
            'X X X' +
            'X X X' +
            'X X X');

        glyphs['n'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            'XX ' +
            'X X' +
            'X X' +
            'X X');

        glyphs['o'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            ' X ' +
            'X X' +
            'X X' +
            ' X ');

        glyphs['p'] = this._parseGlyph(Font.MAX, '' +
            '   ' +
            'XX ' +
            'X X' +
            'X X' +
            'XX ' +
            'X  ');

        glyphs['q'] = this._parseGlyph(Font.MAX, '' +
            '   ' +
            ' XX' +
            'X X' +
            ' XX' +
            '  X' +
            '  X');

        glyphs['r'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            ' XX' +
            'X  ' +
            'X  ' +
            'X  ');

        glyphs['s'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            ' XX' +
            'XX ' +
            '  X' +
            'XX ');

        glyphs['t'] = this._parseGlyph(Font.MIN, '' +
            'X ' +
            'X ' +
            'XX' +
            'X ' +
            ' X');

        glyphs['u'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            'X X' +
            'X X' +
            'X X' +
            ' XX');

        glyphs['v'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            'X X' +
            'X X' +
            'X X' +
            ' X ');

        glyphs['w'] = this._parseGlyph(Font.MIN, '' +
            '     ' +
            'X   X' +
            'X X X' +
            'X X X' +
            ' X X ');

        glyphs['x'] = this._parseGlyph(Font.MIN, '' +
            '    ' +
            'X  X' +
            ' XX ' +
            ' XX ' +
            'X  X');

        glyphs['y'] = this._parseGlyph(Font.MAX, '' +
            '   ' +
            'X X' +
            'X X' +
            ' XX' +
            '  X' +
            'XX ');

        glyphs['z'] = this._parseGlyph(Font.MIN, '' +
            '   ' +
            'XXX' +
            '  X' +
            'XX ' +
            'XXX');
    }

};