/*jshint globalstrict:true */
/*globals XSS, PixelEntity*/

'use strict';

// TODO: Simple animations in PixelEntity (blink, decay)
// TODO: Swipe as a PixelEntity manipulator function
// TODO: new PixelManipulation class


/**
 * Effects
 * Pixel transformations
 * @constructor
 */
function Effects() {
    this.topic = '/canvas/update';
    this.nsInc = 0;
}

Effects.prototype = {

    /**
     * @param {Array} pixels
     * @param {number} x
     * @param {number} y
     * @return {Array}
     */
    shift: function(pixels, x, y) {
        var sx, sy,
            shifted = [];

        for (var i = 0, m = pixels.length; i < m; ++i) {
            sx = pixels[i][0] + x;
            sy = pixels[i][1] + y;
            if (sx >= 0 && sy >= 0 && sx <= XSS.PIXELS_H && sy <= XSS.PIXELS_V) {
                shifted.push([sx, sy]);
            }
        }

        return shifted;
    },

    delay: function(callback, delay) {
        var updater, progress = 0, ns = ++this.nsInc;

        updater = function(delta) {
            progress += delta;
            if (progress >= delay) {
                callback();
                XSS.utils.unsubscribe(this.topic, ns);
            }
        }.bind(this);

        XSS.utils.subscribe(this.topic, ns, updater);
        return ns;
    },

    delayStop: function(ns) {
        XSS.utils.unsubscribe(this.topic, ns);
    },

    /**
     * @param {String} name
     * @param {PixelEntity} entity
     * @param {number=} speed
     */
    blink: function(name, entity, speed) {
        var updater, ns, progress = 0, show = true;

        ns = 'blink_' + name;
        speed = speed || 500;

        XSS.ents[ns] = entity.clone().dynamic(true);

        updater = function(delta) {
            progress += delta;
            if (progress > speed) {
                progress -= speed;
                show = !show;
                XSS.ents[ns].enabled(show);
            }
        }.bind(this);

        XSS.utils.subscribe(this.topic, ns, updater);
    },

    /**
     * @param {String} name
     */
    blinkStop: function(name) {
        var ns = 'blink_' + name;
        XSS.utils.unsubscribe(this.topic, ns);
        delete XSS.ents[ns];
    },

    /**
     * @param {String} name
     * @param {PixelEntity} entity
     * @param {number=} time
     */
    decay: function(name, entity, time) {
        var updater, ns, progress = 0;

        ns = 'decay_' + name;
        time = time || 500;

        XSS.ents[ns] = entity.clone().dynamic(true);

        updater = function(delta) {
            progress += delta;
            if (progress > time) {
                XSS.utils.unsubscribe(this.topic, ns);
                delete XSS.ents[ns];
            }
        }.bind(this);

        XSS.utils.subscribe(this.topic, ns, updater);
    },

    /**
     * @param {String} name
     */
    decayStop: function(name) {
        var ns = 'decay_' + name;
        delete XSS.ents[ns];
        XSS.utils.unsubscribe(this.topic, ns);
    },

    /**
     * @param {String} name
     * @param {PixelEntity} entity
     * @param {Object=} options
     */
    swipe: function(name, entity, options) {
        var updater, ns, start, end, duration, shifted, distance, progress = 0;

        options = options || {};

        ns = 'swipeleft_' + name;
        start = (typeof options.start === 'number') ? options.start : 0;
        end = (typeof options.end === 'number') ? options.end : -XSS.PIXELS_H;
        duration = options.duration || XSS.PIXELS_H; // Lock speed to pixels

        XSS.ents[ns] = entity.clone().dynamic(true);

        updater = function(delta) {
            progress += delta;
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

    /**
     * @param {Array.<Array>} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @return {Array.<Array>}
     */
    zoomX2: function(pixels, shiftX, shiftY) {
        var pixelsZoomed = [], x, y;
        shiftX = shiftX || 0;
        shiftY = shiftY || 0;
        for (var i = 0, m = pixels.length; i < m; ++i) {
            x = pixels[i][0] * 2;
            y = pixels[i][1] * 2;
            pixelsZoomed.push(
                [shiftX + 0 + x, shiftY + 0 + y],
                [shiftX + 0 + x, shiftY + 1 + y],
                [shiftX + 1 + x, shiftY + 0 + y],
                [shiftX + 1 + x, shiftY + 1 + y]
            );
        }
        return pixelsZoomed;
    },

    /**
     * @param {Array.<Array>} pixels
     * @param {number=} shiftX
     * @param {number=} shiftY
     * @return {Array.<Array>}
     */
    zoomX4: function(pixels, shiftX, shiftY) {
        return this.zoomX2(this.zoomX2(pixels, 0, 0), shiftX || 0, shiftY || 0);
    },

    /**
     * @param {Array.<Array>} pixels
     * @return {Array.<Array>}
     */
    zoomGame: function(pixels) {
        return XSS.effects.zoomX4(pixels, XSS.GAME_LEFT, XSS.GAME_TOP);
    }

};