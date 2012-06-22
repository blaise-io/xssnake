/*global XSS: true */

XSS.Effects = function() {
    'use strict';

    var CanvasPixels = XSS.canvas.pixels,

        shiftPixels = function(pixels, x, y) {
            var sx, sy, pixelsShifted = [],
                w = XSS.settings.width,
                h = XSS.settings.height;

            for (var i = 0, m = pixels.length; i < m; i++) {
                sx = pixels[i][0] + x;
                sy = pixels[i][1] + y;
                if (sx < 0 || sy < 0 || sx > w || sy > h) {
                    continue;
                }
                pixelsShifted.push([sx, sy]);
            }

            return pixelsShifted;
        },

        swipeHorizontal = function(name, pixels, options) {
            options = options || {};

            var progress = 0,
                listener = '/xss/canvas/paint.swipeleft_' + name,
                trigger = '/xss/effects/swipe/complete/' + name,
                start = (typeof options.start === 'number') ? options.start : 0,
                end = (typeof options.end === 'number') ? options.end : -XSS.settings.width,
                duration = options.duration || XSS.settings.width; // Lock speed to pixels

            $(document).on(listener, function(e, diff) {

                progress += diff;

                if (progress > duration) {
                    if (options.callback) {
                        options.callback();
                    }

                    $(document).off(listener);
                    $(document).trigger(trigger);

                    delete CanvasPixels['swipeleft_' + name];
                } else {
                    CanvasPixels['swipeleft_' + name] = {
                        cache : false,
                        pixels: shiftPixels(pixels, Math.round(start - ((start - end) * (progress / duration))), 0)
                    };
                }
            });
        },

        zoomX2 = function(pixels, shiftX, shiftY) {
            var pixelsZoomed = [], x, y;
            for (var i = 0, m = pixels.length; i < m; i++) {
                x = pixels[i][0];
                y = pixels[i][1];
                pixelsZoomed = pixelsZoomed.concat([
                    [shiftX + 0 + x * 2, shiftY + 0 + y * 2],
                    [shiftX + 0 + x * 2, shiftY + 1 + y * 2],
                    [shiftX + 1 + x * 2, shiftY + 0 + y * 2],
                    [shiftX + 1 + x * 2, shiftY + 1 + y * 2]
                ]);
            }
            return pixelsZoomed;
        },

        zoomX4 = function(pixels, shiftX, shiftY) {
            return zoomX2(zoomX2(pixels, 0, 0), shiftX, shiftY);
        };

    return {
        swipe : swipeHorizontal,
        zoomX2: zoomX2,
        zoomX4: zoomX4
    };
};