/*jshint globalstrict:true*/
/*globals XSS, PixelEntity*/

'use strict';

/**
 * Drawables
 * Pixel object definitions
 * @constructor
 */
function Drawables() {
}

Drawables.prototype = {

    line: function() {
        return new PixelEntity(
            this._line.apply(this, arguments)
        );
    },

    apple: function(x, y) {
        return new PixelEntity(
            this._line(x + 1, y + 0, x + 2, y + 0),
            this._line(x + 0, y + 1, x + 3, y + 1),
            this._line(x + 0, y + 2, x + 3, y + 2),
            this._line(x + 1, y + 3, x + 2, y + 3)
        );
    },

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} side
     * @param {string} text
     */
    textAt: function(x, y, side, text) {
        var width, pixels;
        switch (side) {
            case 0:
                text = '← ' + text;
                width = XSS.font.width(text) + 2;
                pixels = XSS.font.draw(x - width, y, text);
                break;
            case 1:
                text = '↑ ' + text;
                pixels = XSS.font.draw(x, y - 4, text);
                break;
            case 2:
                text = text + ' →';
                pixels = XSS.font.draw(x + 8, y, text);
                break;
            case 3:
                text = text + ' ↓';
                pixels = XSS.font.draw(x, y + 2, text);
                break;
        }
        return new PixelEntity(pixels);
    },

    // Background before game starts
    outerBorder: function() {
        var w = XSS.PIXELS_H - 1,
            h = XSS.PIXELS_V - 1;

        return new PixelEntity(
            // Top
            this._line(1, 0, w - 1, 0),
            this._line(0, 1, w, 1),
            // Bottom
            this._line(1, h, w - 1, h),
            this._line(0, h - 1, w, h - 1),
            // Left
            this._line(0, 2, 0, h - 2),
            this._line(1, 2, 1, h - 2),
            // Right
            this._line(w, 2, w, h - 2),
            this._line(w - 1, 2, w - 1, h - 2)
        );
    },

    levelBorder: function() {
        var w = XSS.PIXELS_H - 1,
            h = XSS.PIXELS_V - 1;

        return new PixelEntity(
            this._line(0, h - 24, w, h - 24),
            this._line(0, h - 25, w, h - 25),

            XSS.font.draw(5, h - 22, 'Imaginary crashed into Imaginary'),

            XSS.font.draw(5, h - 15, 'Blaise'),
            XSS.font.draw(51, h - 15, '33'),
            XSS.font.draw(5, h - 8, 'Imaginary'),
            XSS.font.draw(56, h - 8, '7'),

            XSS.font.draw(65, h - 15, 'Foo'),
            XSS.font.draw(113, h - 15, '52'),
            XSS.font.draw(65, h - 8, 'Blabla'),
            XSS.font.draw(118, h - 8, '2'),

            XSS.font.draw(126, h - 22, 'Foo: :,('),
            XSS.font.draw(126, h - 15, 'Blaise: LOL OWNED'),
            XSS.font.draw(126, h - 8, 'Imaginary: Fuck you for cutting me!')
        );
    },

    header: function(x, y) {
        y = y || 18;
        var welcome = XSS.font.draw(0, 0, '<XSSNAKE>');
        return new PixelEntity(
            XSS.transform.zoomX4(welcome, x, y),
            XSS.font.draw(x, y + 20, (new Array(45)).join('+'))
        );
    },

    _line: function(x0, y0, x1, y1) {
        var pixels, dx, dy, sx, sy, err, errTmp;

        pixels = [];
        dx = Math.abs(x1 - x0);
        dy = Math.abs(y1 - y0);
        sx = x0 < x1 ? 1 : -1;
        sy = y0 < y1 ? 1 : -1;
        err = dx - dy;

        while (true) {
            pixels.push([x0, y0]);
            if (x0 === x1 && y0 === y1) {
                break;
            }
            errTmp = err;
            if (errTmp > -dx) {
                err -= dy;
                x0 += sx;
            }
            if (errTmp < dy) {
                err += dx;
                y0 += sy;
            }
        }

        return pixels;
    }

};