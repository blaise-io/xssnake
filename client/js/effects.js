/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

// TODO: Separate animation and static effects

/**
 * Effects
 * Pixel transformations
 * @constructor
 */
function Effects() {
    this.canvasPixels = XSS.canvas.objects;
}

Effects.prototype = {

    shiftPixels: function(pixels, x, y) {
        var sx, sy, pixelsShifted = [],
            w = XSS.HPIXELS,
            h = XSS.VPIXELS;

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

    blink: function(name, pixels, speed) {
        var painter,
            namespace = 'blink_' + name,
            listener = '/xss/canvas/paint.' + namespace,
            lastSwitch = 0,
            show = 1;

        speed = (typeof speed === 'number') ? speed : 500;

        painter = function(e, diff) {
            lastSwitch += diff;
            if (lastSwitch > speed) {
                lastSwitch = 0;
                show = !show;
            }
            if (show) {
                this.canvasPixels[namespace] = {
                    pixels: pixels,
                    cache : false
                };
            } else {
                delete this.canvasPixels[namespace];
            }
        };

        XSS.doc.on(listener, painter.bind(this));
    },

    blinkStop: function(name) {
        var listener = '/xss/canvas/paint.blink_' + name,
            namespace = 'blink_' + name;
        XSS.doc.off(listener);
        delete this.canvasPixels[namespace];
    },

    decay: function(name, pixels, time) {
        var namespace = 'decay_' + name;

        time = time || 500;

        this.canvasPixels[namespace] = {
            pixels: pixels
        };

        window.clearTimeout(XSS[namespace]);

        XSS[namespace] = window.setTimeout(function() {
            delete this.canvasPixels[namespace];
        }.bind(this), time);
    },

    decayNow: function(name) {
        var namespace = 'decay_' + name;
        delete this.canvasPixels[namespace];
    },

    swipe: function(name, pixels, options) {
        options = options || {};

        var painter,
            progress = 0,
            listener = '/xss/canvas/paint.swipeleft_' + name,
            trigger = '/xss/effects/swipe/complete/' + name,
            start = (typeof options.start === 'number') ? options.start : 0,
            end = (typeof options.end === 'number') ? options.end : -XSS.HPIXELS,
            duration = options.duration || XSS.HPIXELS; // Lock speed to pixels

        painter = function(e, diff) {
            progress += diff;

            if (progress > duration) {
                if (options.callback) {
                    options.callback();
                }

                XSS.doc.off(listener);
                XSS.doc.trigger(trigger);

                delete this.canvasPixels['swipeleft_' + name];
            } else {
                this.canvasPixels['swipeleft_' + name] = {
                    cache : false,
                    pixels: this.shiftPixels(pixels, Math.round(start - ((start - end) * (progress / duration))), 0)
                };
            }
        };

        XSS.doc.on(listener, painter.bind(this));
    },

    zoomX2: function(pixels, shiftX, shiftY) {
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

    zoomX4: function(pixels, shiftX, shiftY) {
        return this.zoomX2(this.zoomX2(pixels, 0, 0), shiftX, shiftY);
    }

};