/*jshint globalstrict:true*/
/*globals XSS, Entity*/

'use strict';

// TODO: Separate animation - and static effects

/**
 * Effects
 * Pixel transformations
 * @constructor
 */
function Effects() {
    this.topic = '/canvas/paint';
}

Effects.prototype = {

    shift: function(pixels, x, y) {
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

    blink: function(name, entity, speed) {
        var updater, ns, progress = 0, show = true;

        ns = 'blink_' + name;
        speed = speed || 500;

        XSS.ents[ns] = entity.clone().dynamic(true);

        updater = function(diff) {
            progress += diff;
            if (progress > speed) {
                progress -= speed;
                show = !show;
                XSS.ents[ns].enabled(show);
            }
        }.bind(this);

        XSS.utils.subscribe(this.topic, ns, updater);
    },

    blinkStop: function(name) {
        var ns = 'blink_' + name;
        XSS.utils.unsubscribe(this.topic, ns);
        delete XSS.ents[ns];
    },

    decay: function(name, entity, time) {
        var updater, ns, progress = 0;

        ns = 'decay_' + name;
        time = time || 500;

        XSS.ents[ns] = entity.clone().dynamic(true);

        updater = function(diff) {
            progress += diff;
            if (progress > time) {
                XSS.utils.unsubscribe(this.topic, ns);
                delete XSS.ents[ns];
            }
        }.bind(this);

        XSS.utils.subscribe(this.topic, ns, updater);
    },

    decayNow: function(name) {
        var ns = 'decay_' + name;
        delete XSS.ents[ns];
        XSS.utils.unsubscribe(this.topic, ns);
    },

    swipe: function(name, entity, options) {
        var updater, ns, start, end, duration, shifted, distance, progress = 0;

        options = options || {};

        ns = 'swipeleft_' + name;
        start = (typeof options.start === 'number') ? options.start : 0;
        end = (typeof options.end === 'number') ? options.end : -XSS.PIXELS_H;
        duration = options.duration || XSS.PIXELS_H; // Lock speed to pixels

        XSS.ents[ns] = entity.clone().dynamic(true);

        updater = function(diff) {
            progress += diff;
            if (progress < duration) {
                distance = start - ((start - end) * (progress / duration));
                distance = Math.round(distance);
                shifted = this.shift(entity.pixels(), distance, 0);
                XSS.ents[ns].pixels(shifted);
            } else {
                XSS.utils.unsubscribe(this.topic, ns);
                delete XSS.ents[ns];
                if (options.callback) {
                    options.callback();
                }
            }
        }.bind(this);

        XSS.utils.subscribe(this.topic, ns, updater);
    },

//    // Slow!
//    zoom: function(pixels, zoom, shiftX, shiftY) {
//        var pixelsZoomed = [];
//        for (var i = 0, m = pixels.length; i < m; ++i) {
//            for (var xx = 0; xx !== zoom; ++xx) {
//                for (var yy = 0; yy !== zoom; ++yy) {
//                    pixelsZoomed = pixelsZoomed.concat([[
//                        shiftX + xx + pixels[i][0] * zoom,
//                        shiftY + yy + pixels[i][1] * zoom
//                    ]]);
//                }
//            }
//        }
//        return pixelsZoomed;
//    },

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