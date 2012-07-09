/*jshint globalstrict:true*/
/*globals XSS*/

'use strict';

// TODO: Separate animation - and static effects

/**
 * Effects
 * Pixel transformations
 * @constructor
 */
function Effects() {
    this.canvasObjects = XSS.canvas.objects;
    this.publishPaint = '/canvas/paint';
}

Effects.prototype = {

    shiftPixels: function(pixels, x, y) {
        var sx, sy,
            shifted = [];

        for (var i = 0, m = pixels.length; i < m; ++i) {
            sx = pixels[i][0] + x;
            sy = pixels[i][1] + y;
            if (sx > 0 && sy > 0 && sx <= XSS.PIXELS_H && sy <= XSS.PIXELS_V) {
                shifted.push([sx, sy]);
            }
        }

        return shifted;
    },

    blink: function(name, pixels, speed) {
        var painter, namespace, wait, show;

        namespace = 'blink_' + name;
        speed = speed || 500;
        wait = 0;
        show = 1;

        painter = function(diff) {
            wait += diff;
            if (wait > speed) {
                wait -= speed;
                show = !show;
            }
            if (show) {
                this.canvasObjects[namespace] = {
                    pixels: pixels,
                    cache : false
                };
            } else {
                delete this.canvasObjects[namespace];
            }
        };

        XSS.utils.subscribe(this.publishPaint, namespace, painter.bind(this));
    },

    blinkStop: function(name) {
        var namespace = 'blink_' + name;
        XSS.utils.unsubscribe(this.publishPaint, namespace);
        delete this.canvasObjects[namespace];
    },

    decay: function(name, pixels, time) {
        var namespace = 'decay_' + name;

        time = time || 500;

        this.canvasObjects[namespace] = {
            pixels: pixels
        };

        window.clearTimeout(XSS[namespace]);

        XSS[namespace] = window.setTimeout(function() {
            delete this.canvasObjects[namespace];
        }.bind(this), time);
    },

    decayNow: function(name) {
        var namespace = 'decay_' + name;
        delete this.canvasObjects[namespace];
    },

    swipe: function(name, pixels, options) {
        options = options || {};

        var painter,
            event = this.publishPaint,
            progress = 0,
            namespace = 'swipeleft_' + name,
            start = (typeof options.start === 'number') ? options.start : 0,
            end = (typeof options.end === 'number') ? options.end : -XSS.PIXELS_H,
            duration = options.duration || XSS.PIXELS_H; // Lock speed to pixels

        painter = function(diff) {
            progress += diff;
            if (progress > duration) {
                XSS.utils.unsubscribe(event, namespace);
                delete this.canvasObjects[namespace];
                if (options.callback) {
                    options.callback();
                }
            } else {
                this.canvasObjects[namespace] = {
                    cache : false,
                    pixels: this.shiftPixels(pixels, Math.round(start - ((start - end) * (progress / duration))), 0)
                };
            }
        };

        XSS.utils.subscribe(this.publishPaint, namespace, painter.bind(this));
    },

    // Slow!
    zoom: function(pixels, zoom, shiftX, shiftY) {
        var pixelsZoomed = [];
        for (var i = 0, m = pixels.length; i < m; ++i) {
            for (var xx = 0; xx !== zoom; ++xx) {
                for (var yy = 0; yy !== zoom; ++yy) {
                    pixelsZoomed = pixelsZoomed.concat([[
                        shiftX + xx + pixels[i][0] * zoom,
                        shiftY + yy + pixels[i][1] * zoom
                    ]]);
                }
            }
        }
        return pixelsZoomed;
    },

    zoomX2: function(pixels, shiftX, shiftY) {
        var pixelsZoomed = [], x, y;
        for (var i = 0, m = pixels.length; i < m; ++i) {
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