/*global XSS: true */

XSS.Effects = function() {
    'use strict';

    var paintables = XSS.canvas.paintables,

        shiftPixels = function(pixels, x, y) {
            var pixelsShifted = [];
            for (var i = 0, m = pixels.length; i < m; i++) {
                pixelsShifted.push([
                    pixels[i][0] + x,
                    pixels[i][1] + y
                ]);
            }
            return pixelsShifted;
        },

        pulse = function(name, pixels, duration, progress) {
            var grow = true,
                paintable = 'pulse_' + name;

            duration = duration || 250;
            progress = progress || 1;

            $(document).on('/xss/canvas/paint.' + paintable, function(e, diff) {

                progress += (grow) ? diff : -1 * diff;

                if (progress <= 0) {
                    progress = 0.01;
                    grow = true;
                } else if (progress > duration) {
                    progress = duration;
                    grow = false;
                }

                paintables[paintable] = {
                    cache: false,
                    opacity: progress / duration,
                    pixels: pixels
                };
            });

            return paintable;
        },

        stopPulse = function(name) {
            var paintable = 'pulse_' + name;
            $(document).off('/xss/canvas/paint.' + paintable);
            delete paintables[paintable];
        },

        swipeHorizontal = function(name, pixels, options) {
            options = options || {};

            var progress = 0,
                listener = '/xss/canvas/paint.swipeleft_' + name,
                trigger  = '/xss/effects/swipe/complete/' + name,
                start    = (typeof options.start === 'number') ? options.start : 0,
                end      = (typeof options.end   === 'number') ? options.end : XSS.settings.width * -1,
                duration = options.duration || 300;

            $(document).on(listener, function(e, diff) {

                progress += diff;

                if (progress > duration) {
                    if (options.callback) {
                        options.callback();
                    }

                    $(document).off(listener);
                    $(document).trigger(trigger);

                    delete paintables['swipeleft_' + name];
                } else {
                    paintables['swipeleft_' + name] = {
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