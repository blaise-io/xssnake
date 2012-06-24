/*globals XSS*/

// TODO: Separate animation and static effects

/**
 * Effects
 * Pixel transformations
 *
 * @return {Object}
 * @constructor
 */
XSS.Effects = function() {
    'use strict';

    var canvasPixels = XSS.canvas.pixels,

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

        blink = function(name, pixels, speed) {
            var namespace = 'blink_' + name,
                listener = '/xss/canvas/paint.' + namespace,
                lastSwitch = 0,
                show = 1;

            speed = (typeof speed === 'number') ? speed : 500;

            XSS.doc.on(listener, function(e, diff) {
                lastSwitch += diff;
                if (lastSwitch > speed) {
                    lastSwitch = 0;
                    show = !show;
                }
                if (show) {
                    canvasPixels[namespace] = {
                        pixels: pixels,
                        cache : false
                    };
                } else {
                    delete canvasPixels[namespace];
                }
            });
        },

        blinkStop = function(name) {
            var listener = '/xss/canvas/paint.blink_' + name;
            XSS.doc.off(listener);
        },

        swipeHorizontal = function(name, pixels, options) {
            options = options || {};

            var progress = 0,
                listener = '/xss/canvas/paint.swipeleft_' + name,
                trigger = '/xss/effects/swipe/complete/' + name,
                start = (typeof options.start === 'number') ? options.start : 0,
                end = (typeof options.end === 'number') ? options.end : -XSS.settings.width,
                duration = options.duration || XSS.settings.width; // Lock speed to pixels

            XSS.doc.on(listener, function(e, diff) {

                progress += diff;

                if (progress > duration) {
                    if (options.callback) {
                        options.callback();
                    }

                    XSS.doc.off(listener);
                    XSS.doc.trigger(trigger);

                    delete canvasPixels['swipeleft_' + name];
                } else {
                    canvasPixels['swipeleft_' + name] = {
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
        swipe    : swipeHorizontal,
        blink    : blink,
        blinkStop: blinkStop,
        zoomX2   : zoomX2,
        zoomX4   : zoomX4
    };
};