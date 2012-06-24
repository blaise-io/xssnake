/*jshint sub:true */
/*globals XSS*/

/**
 * Font
 * Pixel font definition and writing texts
 * @constructor
 */
XSS.Font = function() {
    'use strict';

    var MIN = 5,
        MAX = 6,

        writeCharacters = function(x, y, str, inverted) {
            var glyph, pixels = [];

            str = replaceMissingCharacters(str);

            if (inverted) {
                pixels = pixels.concat(invertHorizontalWhitespace(x - 2, y));
            }

            for (var i = 0, m = str.length; i < m; i++) {
                glyph = glyphs[str[i]];
                pixels = pixels.concat(drawGlyph(x, y, glyph, inverted));
                if (inverted) {
                    pixels = pixels.concat(invertHorizontalWhitespace(x - 1, y));
                }
                x = x + 1 + glyph[0].length;
            }

            if (inverted) {
                pixels = pixels.concat(invertHorizontalWhitespace(x - 1, y));
                pixels = pixels.concat(invertHorizontalWhitespace(x, y));
            }

            return pixels;
        },

        getLength = function(str) {
            var len = 0;
            str = replaceMissingCharacters(str);
            for (var i = 0, m = str.length; i < m; i++) {
                len += glyphs[str[i]][0].length;
                if (i + 1 !== m) {
                    len += 1;
                }
            }
            return len;
        },

        invertHorizontalWhitespace = function(x, y) {
            var pixels = [];
            for (var i = -2; i < MAX + 1; i++) {
                pixels.push([x, y + i]);
            }
            return pixels;
        },

        invertVerticalWhitespace = function(x, y, width) {
            var pixels = [];
            for (var i = 0; i + 1 < width; i++) {
                pixels.push([x + i, y]);
            }
            return pixels;
        },

        replaceMissingCharacters = function(str) {
            var strNew = [],
                strArr = str.split('');

            for (var i = 0, m = strArr.length; i < m; i++) {
                if (glyphs[strArr[i]]) {
                    strNew.push(strArr[i]);
                } else {
                    strNew.push('■');
                }
            }

            return strNew;
        },

        drawGlyph = function(x, y, glyph, inverted) {
            var pixels = [], pixel;
            for (var xx = 0, m = glyph.length; xx < m; xx++) { // y
                for (var yy = 0, mm = glyph[0].length; yy < mm; yy++) { // x
                    pixel = glyph[xx] ? glyph[xx][yy] : false;
                    if ((pixel && !inverted) || (!pixel && inverted)) {
                        pixels.push([yy + x, xx + y]);
                    }
                }
            }
            if (inverted) {
                pixels = pixels.concat(invertVerticalWhitespace(x, y - 1, glyph[0].length + 1)); // Overline 1
                pixels = pixels.concat(invertVerticalWhitespace(x, y - 2, glyph[0].length + 1)); // Overline 2
                pixels = pixels.concat(invertVerticalWhitespace(x, y + MAX, glyph[0].length + 1)); // Underline 2
                if (glyph.length === MIN) {
                    pixels = pixels.concat(invertVerticalWhitespace(x, y + MIN, glyph[0].length + 1)); // Underline 1 when uppercase
                }
            }
            return pixels;
        },

        parseGlyph = function(height, glyph) {
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

        glyphs = {};

    // Define glyphs
    glyphs['■'] = parseGlyph(MIN, '' +
        'XXXX' +
        'XXXX' +
        'XXXX' +
        'XXXX' +
        'XXXX');

    glyphs['♥'] = parseGlyph(MAX, '' +
        '  XX XX  ' +
        ' XXXXXXX ' +
        ' XXXXXXX ' +
        '  XXXXX  ' +
        '   XXX   ' +
        '    X    ');

    glyphs['☠'] = parseGlyph(MAX, '' +
        ' XX XXXX XX ' +
        ' X XXXXXX X ' +
        '   X XX X   ' +
        '   XXXXXX   ' +
        ' X  XXXX  X ' +
        ' XX XXXX XX ');

    glyphs['←'] = parseGlyph(MIN, '' +
        '  X  ' +
        ' XX  ' +
        'XXXXX' +
        ' XX  ' +
        '  X  ');

    glyphs['•'] = parseGlyph(MIN, '' +
        '  ' +
        '  ' +
        'XX' +
        'XX' +
        '  ');

    glyphs['@'] = parseGlyph(MAX, '' +
        ' XXXX ' +
        'X    X' +
        'X XX X' +
        'X XXX ' +
        'X     ' +
        ' XXX  ');

    glyphs[' '] = parseGlyph(MIN, '' +
        '  ');

    glyphs['.'] = parseGlyph(MIN, '' +
        ' ' +
        ' ' +
        ' ' +
        ' ' +
        'X');

    glyphs[','] = parseGlyph(MAX, '' +
        ' ' +
        ' ' +
        ' ' +
        ' ' +
        'X' +
        'X');

    glyphs[':'] = parseGlyph(MIN, '' +
        ' ' +
        ' ' +
        'X' +
        ' ' +
        'X');

    glyphs[';'] = parseGlyph(MAX, '' +
        '  ' +
        '  ' +
        ' X' +
        '  ' +
        'XX' +
        ' X');

    glyphs['!'] = parseGlyph(MIN, '' +
        'X' +
        'X' +
        'X' +
        ' ' +
        'X');

    glyphs['?'] = parseGlyph(MIN, '' +
        ' XX ' +
        'X  X' +
        '  X ' +
        '    ' +
        '  X ');

    glyphs['&'] = parseGlyph(MIN, '' +
        ' X  ' +
        'X X ' +
        ' X  ' +
        'X X ' +
        ' X X');

    glyphs['-'] = parseGlyph(MIN, '' +
        '    ' +
        '    ' +
        'XXXX' +
        '    ' +
        '    ');

    glyphs._ = parseGlyph(MAX, '' +
        '    ' +
        '    ' +
        '    ' +
        '    ' +
        '    ' +
        'XXXX');

    glyphs['+'] = parseGlyph(MIN, '' +
        '   ' +
        '   ' +
        ' X ' +
        'XXX' +
        ' X ');

    glyphs['='] = parseGlyph(MIN, '' +
        '    ' +
        'XXXX' +
        '    ' +
        'XXXX');

    glyphs['‘'] = glyphs['’'] = glyphs["'"] = parseGlyph(MIN, '' +
        'X' +
        'X' +
        ' ' +
        ' ' +
        ' ');

    glyphs['“'] = glyphs['”'] = glyphs['"'] = parseGlyph(MIN, '' +
        'X X' +
        'X X' +
        '   ' +
        '   ' +
        '   ');

    glyphs['('] = parseGlyph(MAX, '' +
        '  X' +
        ' X ' +
        ' X ' +
        ' X ' +
        ' X ' +
        '  X');

    glyphs[')'] = parseGlyph(MAX, '' +
        'X  ' +
        ' X ' +
        ' X ' +
        ' X ' +
        ' X ' +
        'X  ');

    glyphs['['] = parseGlyph(MAX, '' +
        ' XX' +
        ' X ' +
        ' X ' +
        ' X ' +
        ' X ' +
        ' XX');

    glyphs[']'] = parseGlyph(MAX, '' +
        'XX ' +
        ' X ' +
        ' X ' +
        ' X ' +
        ' X ' +
        'XX ');

    glyphs['{'] = parseGlyph(MAX, '' +
        '   X' +
        '  X ' +
        ' X  ' +
        '  X ' +
        '  X ' +
        '   X');

    glyphs['}'] = parseGlyph(MAX, '' +
        'X   ' +
        ' X  ' +
        '  X ' +
        ' X  ' +
        ' X  ' +
        'X   ');

    glyphs['\\'] = parseGlyph(MIN, '' +
        'X    ' +
        ' X   ' +
        '  X  ' +
        '   X ' +
        '    X');

    glyphs['/'] = parseGlyph(MIN, '' +
        '    X' +
        '   X ' +
        '  X  ' +
        ' X   ' +
        'X    ');

    glyphs['<'] = parseGlyph(MIN, '' +
        '  X ' +
        ' X  ' +
        'X   ' +
        ' X  ' +
        '  X ');

    glyphs['>'] = parseGlyph(MIN, '' +
        ' X  ' +
        '  X ' +
        '   X' +
        '  X ' +
        ' X  ');

    glyphs['0'] = parseGlyph(MIN, '' +
        ' XX ' +
        'X XX' +
        'X  X' +
        'XX X' +
        ' XX ');

    glyphs['1'] = parseGlyph(MIN, '' +
        '  X ' +
        ' XX ' +
        '  X ' +
        '  X ' +
        ' XXX');

    glyphs['2'] = parseGlyph(MIN, '' +
        'XXX ' +
        '   X' +
        '  X ' +
        ' X  ' +
        'XXXX');

    glyphs['3'] = parseGlyph(MIN, '' +
        'XXX ' +
        '   X' +
        ' XX ' +
        '   X' +
        'XXX ');

    glyphs['4'] = parseGlyph(MIN, '' +
        'X  X' +
        'X  X' +
        'XXXX' +
        '   X' +
        '   X');

    glyphs['5'] = parseGlyph(MIN, '' +
        'XXXX' +
        'X   ' +
        'XXX ' +
        '   X' +
        'XXX ');

    glyphs['6'] = parseGlyph(MIN, '' +
        ' XX ' +
        'X   ' +
        'XXX ' +
        'X  X' +
        ' XX ');

    glyphs['7'] = parseGlyph(MIN, '' +
        'XXXX' +
        '  X ' +
        ' X  ' +
        ' X  ' +
        ' X  ');

    glyphs['8'] = parseGlyph(MIN, '' +
        ' XX ' +
        'X  X' +
        ' XX ' +
        'X  X' +
        ' XX ');
    glyphs['9'] = parseGlyph(MIN, '' +
        ' XX ' +
        'X  X' +
        ' XXX' +
        '   X' +
        ' XX ');

    glyphs['A'] = parseGlyph(MIN, '' +
        ' XX ' +
        'X  X' +
        'XXXX' +
        'X  X' +
        'X  X');

    glyphs['B'] = parseGlyph(MIN, '' +
        'XXX ' +
        'X  X' +
        'XXX ' +
        'X  X' +
        'XXX ');

    glyphs['C'] = parseGlyph(MIN, '' +
        ' XXX' +
        'X   ' +
        'X   ' +
        'X   ' +
        ' XXX');

    glyphs['D'] = parseGlyph(MIN, '' +
        'XXX ' +
        'X  X' +
        'X  X' +
        'X  X' +
        'XXX ');

    glyphs['E'] = parseGlyph(MIN, '' +
        'XXXX' +
        'X   ' +
        'XXX ' +
        'X   ' +
        'XXXX');

    glyphs['F'] = parseGlyph(MIN, '' +
        'XXXX' +
        'X   ' +
        'XXX ' +
        'X   ' +
        'X   ');

    glyphs['G'] = parseGlyph(MIN, '' +
        ' XX ' +
        'X   ' +
        'X XX' +
        'X  X' +
        ' XXX');

    glyphs['H'] = parseGlyph(MIN, '' +
        'X  X' +
        'X  X' +
        'XXXX' +
        'X  X' +
        'X  X');

    glyphs['I'] = parseGlyph(MIN, '' +
        'X' +
        'X' +
        'X' +
        'X' +
        'X');

    glyphs['J'] = parseGlyph(MIN, '' +
        'XXX' +
        '  X' +
        '  X' +
        '  X' +
        'XX ');

    glyphs['K'] = parseGlyph(MIN, '' +
        'X  X' +
        'X X ' +
        'XX  ' +
        'X X ' +
        'X  X');

    glyphs['L'] = parseGlyph(MIN, '' +
        'X  ' +
        'X  ' +
        'X  ' +
        'X  ' +
        'XXX');

    glyphs['M'] = parseGlyph(MIN, '' +
        'X   X' +
        'XX XX' +
        'X X X' +
        'X   X' +
        'X   X');

    glyphs['N'] = parseGlyph(MIN, '' +
        'X  X' +
        'XX X' +
        'X XX' +
        'X  X' +
        'X  X');

    glyphs['O'] = parseGlyph(MIN, '' +
        ' XX ' +
        'X  X' +
        'X  X' +
        'X  X' +
        ' XX ');

    glyphs['P'] = parseGlyph(MIN, '' +
        'XXX ' +
        'X  X' +
        'XXX ' +
        'X   ' +
        'X   ');

    glyphs['Q'] = parseGlyph(MAX, '' +
        ' XX ' +
        'X  X' +
        'X  X' +
        'X  X' +
        ' XX ' +
        '   X');

    glyphs['R'] = parseGlyph(MIN, '' +
        'XXX ' +
        'X  X' +
        'XXX ' +
        'X  X' +
        'X  X');

    glyphs['S'] = parseGlyph(MIN, '' +
        ' XXX' +
        'X   ' +
        ' XX ' +
        '   X' +
        'XXX ');

    glyphs['T'] = parseGlyph(MIN, '' +
        'XXXXX' +
        '  X  ' +
        '  X  ' +
        '  X  ' +
        '  X  ');

    glyphs['U'] = parseGlyph(MIN, '' +
        'X  X' +
        'X  X' +
        'X  X' +
        'X  X' +
        ' XX ');

    glyphs['V'] = parseGlyph(MIN, '' +
        'X   X' +
        'X   X' +
        'X   X' +
        ' X X ' +
        '  X  ');

    glyphs['W'] = parseGlyph(MIN, '' +
        'X   X' +
        'X   X' +
        'X X X' +
        'X X X' +
        ' X X ');

    glyphs['X'] = parseGlyph(MIN, '' +
        'X  X' +
        'X  X' +
        ' XX ' +
        'X  X' +
        'X  X');

    glyphs['Y'] = parseGlyph(MIN, '' +
        'X   X' +
        ' X X ' +
        '  X  ' +
        '  X  ' +
        '  X  ');

    glyphs['Z'] = parseGlyph(MIN, '' +
        'XXXXX' +
        '   X ' +
        '  X  ' +
        ' X   ' +
        'XXXXX');

    glyphs['a'] = parseGlyph(MIN, '' +
        '   ' +
        ' XX' +
        'X X' +
        'X X' +
        ' XX');

    glyphs['b'] = parseGlyph(MIN, '' +
        'X  ' +
        'XX ' +
        'X X' +
        'X X' +
        'XX ');

    glyphs['c'] = parseGlyph(MIN, '' +
        '   ' +
        ' XX' +
        'X  ' +
        'X  ' +
        ' XX');

    glyphs['d'] = parseGlyph(MIN, '' +
        '  X' +
        ' XX' +
        'X X' +
        'X X' +
        ' XX');

    glyphs['e'] = parseGlyph(MIN, '' +
        '   ' +
        ' XX' +
        'X X' +
        'XX ' +
        ' XX');

    glyphs['f'] = parseGlyph(MIN, '' +
        ' XX' +
        'X  ' +
        'XX ' +
        'X  ' +
        'X  ');

    glyphs['g'] = parseGlyph(MAX, '' +
        '   ' +
        ' XX' +
        'X X' +
        'XX ' +
        '  X' +
        'XX ');

    glyphs['h'] = parseGlyph(MIN, '' +
        'X  ' +
        'X  ' +
        'XX ' +
        'X X' +
        'X X');

    glyphs['i'] = parseGlyph(MIN, '' +
        'X' +
        ' ' +
        'X' +
        'X' +
        'X');

    glyphs['j'] = parseGlyph(MAX, '' +
        ' X' +
        '  ' +
        ' X' +
        ' X' +
        ' X' +
        'X ');

    glyphs['k'] = parseGlyph(MIN, '' +
        'X  ' +
        'X X' +
        'XX ' +
        'X X' +
        'X X');

    glyphs['l'] = parseGlyph(MIN, '' +
        'X ' +
        'X ' +
        'X ' +
        'X ' +
        ' X');

    glyphs['m'] = parseGlyph(MIN, '' +
        '     ' +
        ' X X ' +
        'X X X' +
        'X X X' +
        'X X X');

    glyphs['n'] = parseGlyph(MIN, '' +
        '   ' +
        'XX ' +
        'X X' +
        'X X' +
        'X X');

    glyphs['o'] = parseGlyph(MIN, '' +
        '   ' +
        ' X ' +
        'X X' +
        'X X' +
        ' X ');

    glyphs['p'] = parseGlyph(MAX, '' +
        '   ' +
        'XX ' +
        'X X' +
        'X X' +
        'XX ' +
        'X  ');

    glyphs['q'] = parseGlyph(MAX, '' +
        '   ' +
        ' XX' +
        'X X' +
        ' XX' +
        '  X' +
        '  X');

    glyphs['r'] = parseGlyph(MIN, '' +
        '   ' +
        ' XX' +
        'X  ' +
        'X  ' +
        'X  ');

    glyphs['s'] = parseGlyph(MIN, '' +
        '   ' +
        ' XX' +
        'XX ' +
        '  X' +
        'XX ');

    glyphs['t'] = parseGlyph(MIN, '' +
        'X ' +
        'X ' +
        'XX' +
        'X ' +
        ' X');

    glyphs['u'] = parseGlyph(MIN, '' +
        '   ' +
        'X X' +
        'X X' +
        'X X' +
        ' XX');

    glyphs['v'] = parseGlyph(MIN, '' +
        '   ' +
        'X X' +
        'X X' +
        'X X' +
        ' X ');

    glyphs['w'] = parseGlyph(MIN, '' +
        '     ' +
        'X   X' +
        'X X X' +
        'X X X' +
        ' X X ');

    glyphs['x'] = parseGlyph(MIN, '' +
        '    ' +
        'X  X' +
        ' XX ' +
        ' XX ' +
        'X  X');

    glyphs['y'] = parseGlyph(MAX, '' +
        '   ' +
        'X X' +
        'X X' +
        ' XX' +
        '  X' +
        'XX ');

    glyphs['z'] = parseGlyph(MIN, '' +
        '   ' +
        'XXX' +
        '  X' +
        'XX ' +
        'XXX');

    return {
        write    : writeCharacters,
        getLength: getLength
    };

};