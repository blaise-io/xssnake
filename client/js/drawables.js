/*jshint globalstrict:true*/
/*globals XSS, Entity*/

'use strict';

/**
 * Drawables
 * Pixel object definitions
 * @constructor
 */
function Drawables() {}

Drawables.prototype = {

    getLine: function() {
        return new Entity(
            this._line.apply(this, arguments)
        );
    },

    // Background before game starts
    getOuterBorder: function() {
        var w = XSS.PIXELS_H - 1,
            h = XSS.PIXELS_V - 1;

        return new Entity(
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

    getHeader: function(x, y) {
        y = y || 18;
        var welcome = XSS.font.write(0, 0, '<XSSNAKE>');
        return new Entity(
            XSS.effects.zoomX4(welcome, x, y),
            XSS.font.write(x, y + 20, (new Array(45)).join('+'))
        );
    },

    _line: function(x0, y0, x1, y1) {
        var pixels = [],
            dx = Math.abs(x1 - x0),
            dy = Math.abs(y1 - y0),
            sx = x0 < x1 ? 1 : -1,
            sy = y0 < y1 ? 1 : -1,
            err = dx - dy,
            er2;

        while (true) {
            pixels.push([x0, y0]);
            if (x0 === x1 && y0 === y1) {
                break;
            }
            er2 = err;
            if (er2 > -dx) {
                err -= dy;
                x0 += sx;
            }
            if (er2 < dy) {
                err += dx;
                y0 += sy;
            }
        }

        return pixels;
    }

};