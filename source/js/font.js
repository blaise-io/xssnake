/*jshint globalstrict:true, sub:true*/
/*globals XSS, PixelEntity*/

'use strict';

/**
 * Font
 * Pixel font definition and writing texts
 * @constructor
 */
function Font() {
    this.buildGlyphCache();
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

    /** @private */
    glyphs: {},

    draw: function(x, y, str, inverted) {
        var glyph, pixels = [];

        str = this.replaceMissingCharacters(str);

        if (inverted) {
            this.invertHorizontalWhitespace(pixels, x - 2, y);
        }

        for (var i = 0, m = str.length; i < m; i++) {
            glyph = this.glyphs[str[i]];
            this.drawGlyph(pixels, x, y, glyph, inverted);
            if (inverted) {
                this.invertHorizontalWhitespace(pixels, x - 1, y);
            }
            x = x + 1 + glyph[0].length;
        }

        if (inverted) {
            this.invertHorizontalWhitespace(pixels, x - 1, y);
            this.invertHorizontalWhitespace(pixels, x, y);
        }

        return pixels;
    },

    /**
     * @param {string} str
     * @return {number}
     */
    width: function(str) {
        var len = 0;
        str = this.replaceMissingCharacters(str);
        for (var i = 0, m = str.length; i < m; i++) {
            len += this.glyphs[str[i]][0].length;
            if (i + 1 !== m) {
                len += 1;
            }
        }
        return len;
    },

    /** @private */
    invertHorizontalWhitespace: function(pixels, x, y) {
        for (var i = -2; i < Font.MAX + 1; i++) {
            pixels.push([x, y + i]);
        }
    },

    /** @private */
    invertVerticalWhitespace: function(pixels, x, y, width) {
        for (var i = 0; i + 1 < width; i++) {
            pixels.push([x + i, y]);
        }
    },

    /** @private */
    replaceMissingCharacters: function(str) {
        var strNew = [],
            strArr = str.split('');

        for (var i = 0, m = strArr.length; i < m; i++) {
            if (this.glyphs[strArr[i]]) {
                strNew.push(strArr[i]);
            } else {
                strNew.push('■');
            }
        }

        return strNew;
    },

    /** @private */
    drawGlyph: function(pixels, x, y, glyph, inverted) {
        var pixel;
        for (var xx = 0, m = glyph.length; xx < m; xx++) { // y
            for (var yy = 0, mm = glyph[0].length; yy < mm; yy++) { // x
                pixel = glyph[xx] ? glyph[xx][yy] : false;
                if ((pixel && !inverted) || (!pixel && inverted)) {
                    pixels.push([yy + x, xx + y]);
                }
            }
        }
        if (inverted) {
            this.invertVerticalWhitespace(pixels, x, y - 1, glyph[0].length + 1); // Overline 1
            this.invertVerticalWhitespace(pixels, x, y - 2, glyph[0].length + 1); // Overline 2
            this.invertVerticalWhitespace(pixels, x, y + Font.MAX, glyph[0].length + 1); // Underline 2
            if (glyph.length === Font.MIN) {
                this.invertVerticalWhitespace(pixels, x, y + Font.MIN, glyph[0].length + 1); // Underline 1 when uppercase
            }
        }
    },

    /** @private */
    parseGlyph: function(height, glyph) {
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
    buildGlyphCache: function() {
        var glyph = this.glyphs;

        // Define glyphs
        glyph['■'] = this.parseGlyph(Font.MIN, '' +
            'XXXX' +
            'XXXX' +
            'XXXX' +
            'XXXX' +
            'XXXX');

        glyph['♥'] = this.parseGlyph(Font.MAX, '' +
            '  XX XX  ' +
            ' XXXXXXX ' +
            ' XXXXXXX ' +
            '  XXXXX  ' +
            '   XXX   ' +
            '    X    ');

        glyph['☠'] = this.parseGlyph(Font.MAX, '' +
            ' XX XXXX XX ' +
            ' X XXXXXX X ' +
            '   X XX X   ' +
            '   XXXXXX   ' +
            ' X  XXXX  X ' +
            ' XX XXXX XX ');

        glyph['←'] = this.parseGlyph(Font.MIN, '' +
            '  X  ' +
            ' XX  ' +
            'XXXXX' +
            ' XX  ' +
            '  X  ');

        glyph['•'] = this.parseGlyph(Font.MIN, '' +
            '  ' +
            '  ' +
            'XX' +
            'XX' +
            '  ');

        glyph['@'] = this.parseGlyph(Font.MAX, '' +
            ' XXXX ' +
            'X    X' +
            'X XX X' +
            'X XXX ' +
            'X     ' +
            ' XXX  ');

        glyph[' '] = this.parseGlyph(Font.MIN, '' +
            '  ' +
            '  ' +
            '  ' +
            '  ' +
            '  ');

        glyph['.'] = this.parseGlyph(Font.MIN, '' +
            ' ' +
            ' ' +
            ' ' +
            ' ' +
            'X');

        glyph[','] = this.parseGlyph(Font.MAX, '' +
            ' ' +
            ' ' +
            ' ' +
            ' ' +
            'X' +
            'X');

        glyph[':'] = this.parseGlyph(Font.MIN, '' +
            ' ' +
            ' ' +
            'X' +
            ' ' +
            'X');

        glyph[';'] = this.parseGlyph(Font.MAX, '' +
            '  ' +
            '  ' +
            ' X' +
            '  ' +
            'XX' +
            ' X');

        glyph['!'] = this.parseGlyph(Font.MIN, '' +
            'X' +
            'X' +
            'X' +
            ' ' +
            'X');

        glyph['?'] = this.parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X  X' +
            '  X ' +
            '    ' +
            '  X ');

        glyph['&'] = this.parseGlyph(Font.MIN, '' +
            ' X  ' +
            'X X ' +
            ' X  ' +
            'X X ' +
            ' X X');

        glyph['-'] = this.parseGlyph(Font.MIN, '' +
            '    ' +
            '    ' +
            'XXXX' +
            '    ' +
            '    ');

        glyph['_'] = this.parseGlyph(Font.MAX, '' +
            '    ' +
            '    ' +
            '    ' +
            '    ' +
            '    ' +
            'XXXX');

        glyph['+'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            '   ' +
            ' X ' +
            'XXX' +
            ' X ');

        glyph['='] = this.parseGlyph(Font.MIN, '' +
            '    ' +
            'XXXX' +
            '    ' +
            'XXXX');

        glyph['‘'] = glyph['’'] = glyph["'"] = this.parseGlyph(Font.MIN, '' +
            'X' +
            'X' +
            ' ' +
            ' ' +
            ' ');

        glyph['“'] = glyph['”'] = glyph['"'] = this.parseGlyph(Font.MIN, '' +
            'X X' +
            'X X' +
            '   ' +
            '   ' +
            '   ');

        glyph['('] = this.parseGlyph(Font.MAX, '' +
            '  X' +
            ' X ' +
            ' X ' +
            ' X ' +
            ' X ' +
            '  X');

        glyph[')'] = this.parseGlyph(Font.MAX, '' +
            'X  ' +
            ' X ' +
            ' X ' +
            ' X ' +
            ' X ' +
            'X  ');

        glyph['['] = this.parseGlyph(Font.MAX, '' +
            ' XX' +
            ' X ' +
            ' X ' +
            ' X ' +
            ' X ' +
            ' XX');

        glyph[']'] = this.parseGlyph(Font.MAX, '' +
            'XX ' +
            ' X ' +
            ' X ' +
            ' X ' +
            ' X ' +
            'XX ');

        glyph['{'] = this.parseGlyph(Font.MAX, '' +
            '   X' +
            '  X ' +
            ' X  ' +
            '  X ' +
            '  X ' +
            '   X');

        glyph['}'] = this.parseGlyph(Font.MAX, '' +
            'X   ' +
            ' X  ' +
            '  X ' +
            ' X  ' +
            ' X  ' +
            'X   ');

        glyph['\\'] = this.parseGlyph(Font.MIN, '' +
            'X    ' +
            ' X   ' +
            '  X  ' +
            '   X ' +
            '    X');

        glyph['/'] = this.parseGlyph(Font.MIN, '' +
            '    X' +
            '   X ' +
            '  X  ' +
            ' X   ' +
            'X    ');

        glyph['<'] = this.parseGlyph(Font.MIN, '' +
            '  X ' +
            ' X  ' +
            'X   ' +
            ' X  ' +
            '  X ');

        glyph['>'] = this.parseGlyph(Font.MIN, '' +
            ' X  ' +
            '  X ' +
            '   X' +
            '  X ' +
            ' X  ');

        glyph['0'] = this.parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X XX' +
            'X  X' +
            'XX X' +
            ' XX ');

        glyph['1'] = this.parseGlyph(Font.MIN, '' +
            '  X ' +
            ' XX ' +
            '  X ' +
            '  X ' +
            ' XXX');

        glyph['2'] = this.parseGlyph(Font.MIN, '' +
            'XXX ' +
            '   X' +
            '  X ' +
            ' X  ' +
            'XXXX');

        glyph['3'] = this.parseGlyph(Font.MIN, '' +
            'XXX ' +
            '   X' +
            ' XX ' +
            '   X' +
            'XXX ');

        glyph['4'] = this.parseGlyph(Font.MIN, '' +
            'X  X' +
            'X  X' +
            'XXXX' +
            '   X' +
            '   X');

        glyph['5'] = this.parseGlyph(Font.MIN, '' +
            'XXXX' +
            'X   ' +
            'XXX ' +
            '   X' +
            'XXX ');

        glyph['6'] = this.parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X   ' +
            'XXX ' +
            'X  X' +
            ' XX ');

        glyph['7'] = this.parseGlyph(Font.MIN, '' +
            'XXXX' +
            '  X ' +
            ' X  ' +
            ' X  ' +
            ' X  ');

        glyph['8'] = this.parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X  X' +
            ' XX ' +
            'X  X' +
            ' XX ');
        glyph['9'] = this.parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X  X' +
            ' XXX' +
            '   X' +
            ' XX ');

        glyph['A'] = this.parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X  X' +
            'XXXX' +
            'X  X' +
            'X  X');

        glyph['B'] = this.parseGlyph(Font.MIN, '' +
            'XXX ' +
            'X  X' +
            'XXX ' +
            'X  X' +
            'XXX ');

        glyph['C'] = this.parseGlyph(Font.MIN, '' +
            ' XXX' +
            'X   ' +
            'X   ' +
            'X   ' +
            ' XXX');

        glyph['D'] = this.parseGlyph(Font.MIN, '' +
            'XXX ' +
            'X  X' +
            'X  X' +
            'X  X' +
            'XXX ');

        glyph['E'] = this.parseGlyph(Font.MIN, '' +
            'XXXX' +
            'X   ' +
            'XXX ' +
            'X   ' +
            'XXXX');

        glyph['F'] = this.parseGlyph(Font.MIN, '' +
            'XXXX' +
            'X   ' +
            'XXX ' +
            'X   ' +
            'X   ');

        glyph['G'] = this.parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X   ' +
            'X XX' +
            'X  X' +
            ' XXX');

        glyph['H'] = this.parseGlyph(Font.MIN, '' +
            'X  X' +
            'X  X' +
            'XXXX' +
            'X  X' +
            'X  X');

        glyph['I'] = this.parseGlyph(Font.MIN, '' +
            'X' +
            'X' +
            'X' +
            'X' +
            'X');

        glyph['J'] = this.parseGlyph(Font.MIN, '' +
            'XXX' +
            '  X' +
            '  X' +
            '  X' +
            'XX ');

        glyph['K'] = this.parseGlyph(Font.MIN, '' +
            'X  X' +
            'X X ' +
            'XX  ' +
            'X X ' +
            'X  X');

        glyph['L'] = this.parseGlyph(Font.MIN, '' +
            'X  ' +
            'X  ' +
            'X  ' +
            'X  ' +
            'XXX');

        glyph['M'] = this.parseGlyph(Font.MIN, '' +
            'X   X' +
            'XX XX' +
            'X X X' +
            'X   X' +
            'X   X');

        glyph['N'] = this.parseGlyph(Font.MIN, '' +
            'X  X' +
            'XX X' +
            'X XX' +
            'X  X' +
            'X  X');

        glyph['O'] = this.parseGlyph(Font.MIN, '' +
            ' XX ' +
            'X  X' +
            'X  X' +
            'X  X' +
            ' XX ');

        glyph['P'] = this.parseGlyph(Font.MIN, '' +
            'XXX ' +
            'X  X' +
            'XXX ' +
            'X   ' +
            'X   ');

        glyph['Q'] = this.parseGlyph(Font.MAX, '' +
            ' XX ' +
            'X  X' +
            'X  X' +
            'X  X' +
            ' XX ' +
            '   X');

        glyph['R'] = this.parseGlyph(Font.MIN, '' +
            'XXX ' +
            'X  X' +
            'XXX ' +
            'X  X' +
            'X  X');

        glyph['S'] = this.parseGlyph(Font.MIN, '' +
            ' XXX' +
            'X   ' +
            ' XX ' +
            '   X' +
            'XXX ');

        glyph['T'] = this.parseGlyph(Font.MIN, '' +
            'XXXXX' +
            '  X  ' +
            '  X  ' +
            '  X  ' +
            '  X  ');

        glyph['U'] = this.parseGlyph(Font.MIN, '' +
            'X  X' +
            'X  X' +
            'X  X' +
            'X  X' +
            ' XX ');

        glyph['V'] = this.parseGlyph(Font.MIN, '' +
            'X   X' +
            'X   X' +
            'X   X' +
            ' X X ' +
            '  X  ');

        glyph['W'] = this.parseGlyph(Font.MIN, '' +
            'X   X' +
            'X   X' +
            'X X X' +
            'X X X' +
            ' X X ');

        glyph['X'] = this.parseGlyph(Font.MIN, '' +
            'X  X' +
            'X  X' +
            ' XX ' +
            'X  X' +
            'X  X');

        glyph['Y'] = this.parseGlyph(Font.MIN, '' +
            'X   X' +
            ' X X ' +
            '  X  ' +
            '  X  ' +
            '  X  ');

        glyph['Z'] = this.parseGlyph(Font.MIN, '' +
            'XXXXX' +
            '   X ' +
            '  X  ' +
            ' X   ' +
            'XXXXX');

        glyph['a'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            ' XX' +
            'X X' +
            'X X' +
            ' XX');

        glyph['b'] = this.parseGlyph(Font.MIN, '' +
            'X  ' +
            'XX ' +
            'X X' +
            'X X' +
            'XX ');

        glyph['c'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            ' XX' +
            'X  ' +
            'X  ' +
            ' XX');

        glyph['d'] = this.parseGlyph(Font.MIN, '' +
            '  X' +
            ' XX' +
            'X X' +
            'X X' +
            ' XX');

        glyph['e'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            ' XX' +
            'X X' +
            'XX ' +
            ' XX');

        glyph['f'] = this.parseGlyph(Font.MIN, '' +
            ' XX' +
            'X  ' +
            'XX ' +
            'X  ' +
            'X  ');

        glyph['g'] = this.parseGlyph(Font.MAX, '' +
            '   ' +
            ' XX' +
            'X X' +
            'XX ' +
            '  X' +
            'XX ');

        glyph['h'] = this.parseGlyph(Font.MIN, '' +
            'X  ' +
            'X  ' +
            'XX ' +
            'X X' +
            'X X');

        glyph['i'] = this.parseGlyph(Font.MIN, '' +
            'X' +
            ' ' +
            'X' +
            'X' +
            'X');

        glyph['j'] = this.parseGlyph(Font.MAX, '' +
            ' X' +
            '  ' +
            ' X' +
            ' X' +
            ' X' +
            'X ');

        glyph['k'] = this.parseGlyph(Font.MIN, '' +
            'X  ' +
            'X X' +
            'XX ' +
            'X X' +
            'X X');

        glyph['l'] = this.parseGlyph(Font.MIN, '' +
            'X ' +
            'X ' +
            'X ' +
            'X ' +
            ' X');

        glyph['m'] = this.parseGlyph(Font.MIN, '' +
            '     ' +
            ' X X ' +
            'X X X' +
            'X X X' +
            'X X X');

        glyph['n'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            'XX ' +
            'X X' +
            'X X' +
            'X X');

        glyph['o'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            ' X ' +
            'X X' +
            'X X' +
            ' X ');

        glyph['p'] = this.parseGlyph(Font.MAX, '' +
            '   ' +
            'XX ' +
            'X X' +
            'X X' +
            'XX ' +
            'X  ');

        glyph['q'] = this.parseGlyph(Font.MAX, '' +
            '   ' +
            ' XX' +
            'X X' +
            ' XX' +
            '  X' +
            '  X');

        glyph['r'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            ' XX' +
            'X  ' +
            'X  ' +
            'X  ');

        glyph['s'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            ' XX' +
            'XX ' +
            '  X' +
            'XX ');

        glyph['t'] = this.parseGlyph(Font.MIN, '' +
            'X ' +
            'X ' +
            'XX' +
            'X ' +
            ' X');

        glyph['u'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            'X X' +
            'X X' +
            'X X' +
            ' XX');

        glyph['v'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            'X X' +
            'X X' +
            'X X' +
            ' X ');

        glyph['w'] = this.parseGlyph(Font.MIN, '' +
            '     ' +
            'X   X' +
            'X X X' +
            'X X X' +
            ' X X ');

        glyph['x'] = this.parseGlyph(Font.MIN, '' +
            '    ' +
            'X  X' +
            ' XX ' +
            ' XX ' +
            'X  X');

        glyph['y'] = this.parseGlyph(Font.MAX, '' +
            '   ' +
            'X X' +
            'X X' +
            ' XX' +
            '  X' +
            'XX ');

        glyph['z'] = this.parseGlyph(Font.MIN, '' +
            '   ' +
            'XXX' +
            '  X' +
            'XX ' +
            'XXX');
    }

};