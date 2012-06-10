/*global XSS: true */

XSS.Effects = function() {
    'use strict';

    var CanvasPixels = XSS.canvas.pixels,

        shiftPixels = function(pixels, x, y) {
            var xx, yy,
                pixelsShifted = [],
                w = XSS.settings.width,
                h = XSS.settings.height;

            for (var i = 0, m = pixels.length; i < m; i++) {
                xx = pixels[i][0] + x;
                yy = pixels[i][1] + y;
                if (xx < 0 || yy < 0 || xx > w || yy > h) {
                    continue;
                }
                pixelsShifted.push([xx, yy]);
            }

            return pixelsShifted;
        },

        pulse = function(name, pixels, duration, progress) {
            var grow = true,
                pixelsname = 'pulse_' + name;

            duration = duration || 250;
            progress = progress || 1;

            $(document).on('/xss/canvas/paint.' + pixelsname, function(e, diff) {

                progress += (grow) ? diff : -1 * diff;

                if (progress <= 0) {
                    progress = 0.01;
                    grow = true;
                } else if (progress > duration) {
                    progress = duration;
                    grow = false;
                }

                CanvasPixels[pixelsname] = {
                    cache: false,
                    opacity: progress / duration,
                    pixels: pixels
                };
            });

            return pixelsname;
        },

        stopPulse = function(name) {
            var paintable = 'pulse_' + name;
            $(document).off('/xss/canvas/paint.' + paintable);
            delete CanvasPixels[paintable];
        },

        swipeHorizontal = function(name, pixels, options) {
            options = options || {};

            var progress = 0,
                listener = '/xss/canvas/paint.swipeleft_' + name,
                trigger  = '/xss/effects/swipe/complete/' + name,
                start    = (typeof options.start === 'number') ? options.start : 0,
                end      = (typeof options.end   === 'number') ? options.end : -XSS.settings.width,
                duration = options.duration || 256;

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
                        cache: false,
                        pixels: shiftPixels(pixels, Math.floor(start - ((start - end) * (progress / duration))), 0)
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
        };

    return {
        pulse: pulse,
        stopPulse: stopPulse,
        swipe: swipeHorizontal,
        zoomX2: zoomX2
    };

};