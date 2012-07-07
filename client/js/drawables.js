/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

/**
 * Drawables
 * Pixel object definitions
 * @constructor
 */
function Drawables() {}

Drawables.prototype = {

    line: function(x0, y0, x1, y1) {
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
    },

    // Background before game starts
    getOuterBorderPixels: function() {
        var w = XSS.PIXELS_H - 1,
            h = XSS.PIXELS_V - 1;

        return [].concat(
            // Top
            this.line(1, 0, w - 1, 0),
            this.line(0, 1, w, 1),
            // Bottom
            this.line(1, h, w - 1, h),
            this.line(0, h - 1, w, h - 1),
            // Left
            this.line(0, 2, 0, h - 2),
            this.line(1, 2, 1, h - 2),
            // Right
            this.line(w, 2, w, h - 2),
            this.line(w - 1, 2, w - 1, h - 2)
        );
    },

    getHeaderPixels: function(x, y) {
        y = y || 18;
        var welcome = XSS.font.write(0, 0, '<XSSNAKE>');
        return [].concat(
            XSS.effects.zoomX4(welcome, x, y),
            XSS.font.write(x, y + 20, (new Array(45)).join('+'))
        );
    },

    getMenuPixels: function(name, x, y, menu) {
        var pixels = [],
            options = menu.options,
            selected = menu.selected || 0,
            description = options[selected] ? options[selected].description : '';

        // Option
        for (var i = 0, m = options.length; i < m; i++) {
            pixels = pixels.concat(
                XSS.font.write(x, y + (i * 9), options[i].title, (selected === i))
            );
        }

        // Help text line(s)
        if (description) {
            if (typeof description === 'string') {
                description = [description];
            }
            for (var j = 0, n = description.length; j < n; j++) {
                pixels = pixels.concat(
                    XSS.font.write(x, y + ((i + 1 + j) * 9), description[j])
                );
            }
        }

        return pixels;
    },

    getBoundingBox: function(pixels) {
        var x, y,
            minX = false,
            minY = false,
            maxX = false,
            maxY = false;

        for (var i = 0, m = pixels.length; i < m; i++) {
            x = pixels[i][0];
            if (minX === false || minX > x) {
                minX = x;
            }
            if (maxX === false || maxX < x) {
                maxX = x;
            }
            y = pixels[i][1];
            if (minY === false || minY > y) {
                minY = y;
            }
            if (maxY === false || maxY < y) {
                maxY = y;
            }
        }

        return {
            x     : minX,
            y     : minY,
            x2    : maxX ? maxX + 1 : 0,
            y2    : maxY ? maxY + 1 : 0,
            width : 1 + maxX - minX,
            height: 1 + maxY - minY
        };
    }

};