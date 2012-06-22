/*globals XSS*/

XSS.Font = function() {
    'use strict';

    var meta = {
            heightMin: 5,
            heightMax: 6
        },

        writeCharacters = function(x, y, str, inverted) {
            var glyph, pixels = [];

            str = replaceMissingCharacters(str);

            if (inverted) {
                pixels = pixels.concat(invertHorizontalWhitespace(x-2, y));
            }

            for (var i = 0, m = str.length; i < m; i++) {
                glyph = glyphs[str[i]];
                pixels = pixels.concat(drawGlyph(x, y, glyph, inverted));
                if (inverted) {
                    pixels = pixels.concat(invertHorizontalWhitespace(x-1, y));
                }
                x = x + 1 + glyph[0].length;
            }

            if (inverted) {
                pixels = pixels.concat(invertHorizontalWhitespace(x-1, y));
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
            for (var i = -2; i < meta.heightMax + 1; i++) {
                pixels.push([x, y + i]);
            }
            return pixels;
        },

        invertVerticalWhitespace = function(x, y, width) {
            var pixels = [];
            for (var i = 0; i + 1 < width; i++) {
                pixels.push([x+i, y]);
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
                    pixel = glyph[xx][yy];
                    if ((pixel && !inverted) || (!pixel && inverted)) {
                        pixels.push([yy + x, xx + y]);
                    }
                }
            }
            if (inverted) {
                pixels = pixels.concat(invertVerticalWhitespace(x, y-1, glyph[0].length+1)); // Overline 1
                pixels = pixels.concat(invertVerticalWhitespace(x, y-2, glyph[0].length+1)); // Overline 2
                pixels = pixels.concat(invertVerticalWhitespace(x, y+meta.heightMax, glyph[0].length+1)); // Underline 2
                if (glyph.length === meta.heightMin) {
                    pixels = pixels.concat(invertVerticalWhitespace(x, y+meta.heightMin, glyph[0].length+1)); // Underline 1 when uppercase
                }
            }
            return pixels;
        },

        parseGlyph = function(glyph) {
            var width, height, re, row, glyphArr,
                glyphFinal = [],
                length = glyph.length;

            height = meta.heightMax;
            if (length % height === 0) {
                width = length / height;
            } else {
                height = meta.heightMin;
                if (length % height === 0) {
                    width = length / height;
                } else {
                    throw 'invalid glyph:' + glyph;
                }
            }

            re = new RegExp('', 'g');
            glyphArr = glyph.split(re);

            for (var i = 0, m = glyphArr.length; i < m; i++) {
                row = Math.floor(i / width);
                if (!glyphFinal[row]) {
                    glyphFinal[row] = [];
                }
                glyphFinal[row].push((glyphArr[i] === 'X'));
            }
            return glyphFinal;
        },

        glyphs = {};

    // Define glyphs

    glyphs['■'] = parseGlyph('' +
        'XXXX' +
        'XXXX' +
        'XXXX' +
        'XXXX' +
        'XXXX');

    glyphs['♥'] = parseGlyph('' +
        '  XX XX  ' +
        ' XXXXXXX ' +
        ' XXXXXXX ' +
        '  XXXXX  ' +
        '   XXX   ' +
        '    X    ');

    glyphs['☠'] = parseGlyph('' +
        ' XX XXXX XX ' +
        ' X XXXXXX X ' +
        '   X XX X   ' +
        '   XXXXXX   ' +
        ' X  XXXX  X ' +
        ' XX XXXX XX ');

    glyphs['←'] = parseGlyph('' +
        '  X  ' +
        ' XX  ' +
        'XXXXX' +
        ' XX  ' +
        '  X  ');

    glyphs['•'] = parseGlyph('' +
        '  ' +
        '  ' +
        'XX' +
        'XX' +
        '  ');

    glyphs['@'] = parseGlyph('' +
        ' XXXX ' +
        'X    X' +
        'X XX X' +
        'X XXX ' +
        'X     ' +
        ' XXX  ');

    glyphs[' '] = parseGlyph('' +
        '  ' +
        '  ' +
        '  ' +
        '  ' +
        '  ');

    glyphs['.'] = parseGlyph('' +
        ' ' +
        ' ' +
        ' ' +
        ' ' +
        'X');

    glyphs[','] = parseGlyph('' +
        ' ' +
        ' ' +
        ' ' +
        ' ' +
        'X' +
        'X');

    glyphs[':'] = parseGlyph('' +
        ' ' +
        ' ' +
        'X' +
        ' ' +
        'X');

    glyphs[';'] = parseGlyph('' +
        '  ' +
        '  ' +
        ' X' +
        '  ' +
        'XX' +
        ' X');

    glyphs['!'] = parseGlyph('' +
        'X' +
        'X' +
        'X' +
        ' ' +
        'X');

    glyphs['?'] = parseGlyph('' +
        ' XX ' +
        'X  X' +
        '  X ' +
        '    ' +
        '  X ');

    glyphs['&'] = parseGlyph('' +
        ' X  ' +
        'X X ' +
        ' X  ' +
        'X X ' +
        ' X X');

    glyphs['-'] = parseGlyph('' +
        '    ' +
        '    ' +
        'XXXX' +
        '    ' +
        '    ');

    glyphs._ = parseGlyph('' +
        '    ' +
        '    ' +
        '    ' +
        '    ' +
        '    ' +
        'XXXX');

    glyphs['+'] = parseGlyph('' +
        '   ' +
        '   ' +
        ' X ' +
        'XXX' +
        ' X ');

    glyphs['='] = parseGlyph('' +
        '    ' +
        'XXXX' +
        '    ' +
        'XXXX' +
        '    ');

    glyphs['‘'] =
    glyphs['’'] =
    glyphs["'"] = parseGlyph('' +
        'X' +
        'X' +
        ' ' +
        ' ' +
        ' ');

    glyphs['“'] =
    glyphs['”'] =
    glyphs['"'] = parseGlyph('' +
        'X X' +
        'X X' +
        '   ' +
        '   ' +
        '   ');

    glyphs['('] = parseGlyph('' +
        '  X' +
        ' X ' +
        ' X ' +
        ' X ' +
        ' X ' +
        '  X');

    glyphs[')'] = parseGlyph('' +
        'X  ' +
        ' X ' +
        ' X ' +
        ' X ' +
        ' X ' +
        'X  ');

    glyphs['['] = parseGlyph('' +
        ' XX' +
        ' X ' +
        ' X ' +
        ' X ' +
        ' X ' +
        ' XX');

    glyphs[']'] = parseGlyph('' +
        'XX ' +
        ' X ' +
        ' X ' +
        ' X ' +
        ' X ' +
        'XX ');

    glyphs['{'] = parseGlyph('' +
        '   X' +
        '  X ' +
        ' X  ' +
        '  X ' +
        '  X ' +
        '   X');

    glyphs['}'] = parseGlyph('' +
        'X   ' +
        ' X  ' +
        '  X ' +
        ' X  ' +
        ' X  ' +
        'X   ');

    glyphs['\\'] = parseGlyph('' +
        'X    ' +
        ' X   ' +
        '  X  ' +
        '   X ' +
        '    X');

    glyphs['/'] = parseGlyph('' +
        '    X' +
        '   X ' +
        '  X  ' +
        ' X   ' +
        'X    ');

    glyphs['<'] = parseGlyph('' +
        '  X ' +
        ' X  ' +
        'X   ' +
        ' X  ' +
        '  X ');

    glyphs['>'] = parseGlyph('' +
        ' X  ' +
        '  X ' +
        '   X' +
        '  X ' +
        ' X  ');

    glyphs['0'] = parseGlyph('' +
        ' XX ' +
        'X XX' +
        'X  X' +
        'XX X' +
        ' XX ');

    glyphs['1'] = parseGlyph('' +
        '  X ' +
        ' XX ' +
        '  X ' +
        '  X ' +
        ' XXX');

    glyphs['2'] = parseGlyph('' +
        'XXX ' +
        '   X' +
        '  X ' +
        ' X  ' +
        'XXXX');

    glyphs['3'] = parseGlyph('' +
        'XXX ' +
        '   X' +
        ' XX ' +
        '   X' +
        'XXX ');

    glyphs['4'] = parseGlyph('' +
        'X  X' +
        'X  X' +
        'XXXX' +
        '   X' +
        '   X');

    glyphs['5'] = parseGlyph('' +
        'XXXX' +
        'X   ' +
        'XXX ' +
        '   X' +
        'XXX ');

    glyphs['6'] = parseGlyph('' +
        ' XX ' +
        'X   ' +
        'XXX ' +
        'X  X' +
        ' XX ');

    glyphs['7'] = parseGlyph('' +
        'XXXX' +
        '  X ' +
        ' X  ' +
        ' X  ' +
        ' X  ');

    glyphs['8'] = parseGlyph('' +
        ' XX ' +
        'X  X' +
        ' XX ' +
        'X  X' +
        ' XX ');
    glyphs['9'] = parseGlyph('' +
        ' XX ' +
        'X  X' +
        ' XXX' +
        '   X' +
        ' XX ');

    glyphs.A = parseGlyph('' +
        ' XX ' +
        'X  X' +
        'XXXX' +
        'X  X' +
        'X  X');

    glyphs.B = parseGlyph('' +
        'XXX ' +
        'X  X' +
        'XXX ' +
        'X  X' +
        'XXX ');

    glyphs.C = parseGlyph('' +
        ' XXX' +
        'X   ' +
        'X   ' +
        'X   ' +
        ' XXX');

    glyphs.D = parseGlyph('' +
        'XXX ' +
        'X  X' +
        'X  X' +
        'X  X' +
        'XXX ');

    glyphs.E = parseGlyph('' +
        'XXXX' +
        'X   ' +
        'XXX ' +
        'X   ' +
        'XXXX');

    glyphs.F = parseGlyph('' +
        'XXXX' +
        'X   ' +
        'XXX ' +
        'X   ' +
        'X   ');

    glyphs.G = parseGlyph('' +
        ' XX ' +
        'X   ' +
        'X XX' +
        'X  X' +
        ' XXX');

    glyphs.H = parseGlyph('' +
        'X  X' +
        'X  X' +
        'XXXX' +
        'X  X' +
        'X  X');

    glyphs.I = parseGlyph('' +
        'X' +
        'X' +
        'X' +
        'X' +
        'X');

    glyphs.J = parseGlyph('' +
        'XXX' +
        '  X' +
        '  X' +
        '  X' +
        'XX ');

    glyphs.K = parseGlyph('' +
        'X  X' +
        'X X ' +
        'XX  ' +
        'X X ' +
        'X  X');

    glyphs.L = parseGlyph('' +
        'X  ' +
        'X  ' +
        'X  ' +
        'X  ' +
        'XXX');

    glyphs.M = parseGlyph('' +
        'X   X' +
        'XX XX' +
        'X X X' +
        'X   X' +
        'X   X');

    glyphs.N = parseGlyph('' +
        'X  X' +
        'XX X' +
        'X XX' +
        'X  X' +
        'X  X');

    glyphs.O = parseGlyph('' +
        ' XX ' +
        'X  X' +
        'X  X' +
        'X  X' +
        ' XX ');

    glyphs.P = parseGlyph('' +
        'XXX ' +
        'X  X' +
        'XXX ' +
        'X   ' +
        'X   ');

    glyphs.Q = parseGlyph('' +
        ' XX ' +
        'X  X' +
        'X  X' +
        'X  X' +
        ' XX ' +
        '   X');

    glyphs.R = parseGlyph('' +
        'XXX ' +
        'X  X' +
        'XXX ' +
        'X  X' +
        'X  X');

    glyphs.S = parseGlyph('' +
        ' XXX' +
        'X   ' +
        ' XX ' +
        '   X' +
        'XXX ');

    glyphs.T = parseGlyph('' +
        'XXXXX' +
        '  X  ' +
        '  X  ' +
        '  X  ' +
        '  X  ');

    glyphs.U = parseGlyph('' +
        'X  X' +
        'X  X' +
        'X  X' +
        'X  X' +
        ' XX ');

    glyphs.V = parseGlyph('' +
        'X   X' +
        'X   X' +
        'X   X' +
        ' X X ' +
        '  X  ');

    glyphs.W = parseGlyph('' +
        'X   X' +
        'X   X' +
        'X X X' +
        'X X X' +
        ' X X ');

    glyphs.X = parseGlyph('' +
        'X  X' +
        'X  X' +
        ' XX ' +
        'X  X' +
        'X  X');

    glyphs.Y = parseGlyph('' +
        'X   X' +
        ' X X ' +
        '  X  ' +
        '  X  ' +
        '  X  ');

    glyphs.Z = parseGlyph('' +
        'XXXXX' +
        '   X ' +
        '  X  ' +
        ' X   ' +
        'XXXXX');

    glyphs.a = parseGlyph('' +
        '   ' +
        ' XX' +
        'X X' +
        'X X' +
        ' XX');

    glyphs.b = parseGlyph('' +
        'X  ' +
        'XX ' +
        'X X' +
        'X X' +
        'XX ');

    glyphs.c = parseGlyph('' +
        '   ' +
        ' XX' +
        'X  ' +
        'X  ' +
        ' XX');

    glyphs.d = parseGlyph('' +
        '  X' +
        ' XX' +
        'X X' +
        'X X' +
        ' XX');

    glyphs.e = parseGlyph('' +
        '   ' +
        ' XX' +
        'X X' +
        'XX ' +
        ' XX');

    glyphs.f = parseGlyph('' +
        ' XX' +
        'X  ' +
        'XX ' +
        'X  ' +
        'X  ');

    glyphs.g = parseGlyph('' +
        '   ' +
        ' XX' +
        'X X' +
        'XX ' +
        '  X' +
        'XX ');

    glyphs.h = parseGlyph('' +
        'X  ' +
        'X  ' +
        'XX ' +
        'X X' +
        'X X');

    glyphs.i = parseGlyph('' +
        'X' +
        ' ' +
        'X' +
        'X' +
        'X');

    glyphs.j = parseGlyph('' +
        ' X' +
        '  ' +
        ' X' +
        ' X' +
        ' X' +
        'X ');

    glyphs.k = parseGlyph('' +
        'X  ' +
        'X X' +
        'XX ' +
        'X X' +
        'X X');

    glyphs.l = parseGlyph('' +
        'X ' +
        'X ' +
        'X ' +
        'X ' +
        ' X');

    glyphs.m = parseGlyph('' +
        '     ' +
        ' X X ' +
        'X X X' +
        'X X X' +
        'X X X');

    glyphs.n = parseGlyph('' +
        '   ' +
        'XX ' +
        'X X' +
        'X X' +
        'X X');

    glyphs.o = parseGlyph('' +
        '   ' +
        ' X ' +
        'X X' +
        'X X' +
        ' X ');

    glyphs.p = parseGlyph('' +
        '   ' +
        'XX ' +
        'X X' +
        'X X' +
        'XX ' +
        'X  ');

    glyphs.q = parseGlyph('' +
        '   ' +
        ' XX' +
        'X X' +
        ' XX' +
        '  X' +
        '  X');

    glyphs.r = parseGlyph('' +
        '   ' +
        ' XX' +
        'X  ' +
        'X  ' +
        'X  ');

    glyphs.s = parseGlyph('' +
        '   ' +
        ' XX' +
        'XX ' +
        '  X' +
        'XX ');

    glyphs.t = parseGlyph('' +
        'X ' +
        'X ' +
        'XX' +
        'X ' +
        ' X');

    glyphs.u = parseGlyph('' +
        '   ' +
        'X X' +
        'X X' +
        'X X' +
        ' XX');

    glyphs.v = parseGlyph('' +
        '   ' +
        'X X' +
        'X X' +
        'X X' +
        ' X ');

    glyphs.w = parseGlyph('' +
        '     ' +
        'X   X' +
        'X X X' +
        'X X X' +
        ' X X ');

    glyphs.x = parseGlyph('' +
        '    ' +
        'X  X' +
        ' XX ' +
        ' XX ' +
        'X  X');

    glyphs.y = parseGlyph('' +
        '   ' +
        'X X' +
        'X X' +
        ' XX' +
        '  X' +
        'XX ');

    glyphs.z = parseGlyph('' +
        '   ' +
        'XXX' +
        '  X' +
        'XX ' +
        'XXX');

    return {
        write: writeCharacters,
        getLength: getLength
    };

};