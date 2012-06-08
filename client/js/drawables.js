/*global XSS: true */

XSS.Drawables = function() {
    'use strict';

    var w = XSS.settings.width - 1, // Width as index
        h = XSS.settings.height - 1, // Heigh as index

        line = function(x0, y0, x1, y1) {
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
        getPreGameCanvasPixels = function() {
            return [].concat(
                // Top
                line(1, 0, w - 1, 0),
                line(0, 1, w, 1),
                // Bottom
                line(1, h, w - 1, h),
                line(0, h - 1, w, h - 1),
                // Left
                line(0, 2, 0, h - 2),
                line(1, 2, 1, h - 2),
                // Right
                line(w, 2, w, h - 2),
                line(w - 1, 2, w - 1, h - 2)
            );
        },

        getMenuPixels = function(name, x, y, menu) {
            var pixels = [],
                options = menu.options,
                selected = menu.selected || 0,
                help = options[selected][2];

            // Option
            for (var i = 0, m = options.length; i < m; i++) {
                pixels = pixels.concat(
                    XSS.font.write(x, y + (i * 9), options[i][1], (selected === i))
                );
            }

            // Help text line(s)
            if (help) {
                if (typeof help === 'string') {
                    help = [help];
                }
                for (var j = 0, n = help.length; j < n; j++) {
                    pixels = pixels.concat(
                        XSS.font.write(x, y + ((i + 1 + j) * 9), help[j])
                    );
                }
            }

            return pixels;
        },

        getboundingBox = function(pixels) {
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
                x: minX,
                y: minY,
                x2: maxX ? maxX + 1 : 0,
                y2: maxY ? maxY + 1 : 0,
                width: maxX - minX,
                height: maxY - minY
            };
        };

    return {
        line: line,
        getPreGameCanvasPixels: getPreGameCanvasPixels,
        getMenuPixels: getMenuPixels,
        getboundingBox: getboundingBox
    };
};