/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, BoundingBox*/

'use strict';

/** @typedef {Array.<number>} */
XSS.ShapePixel = null;

/** @typedef {Array.<XSS.ShapePixel>} */
XSS.ShapePixels = null;

/** @typedef {{canvas: *, bbox: BoundingBox}} */
XSS.ShapeCache = null;

/**
 * Shape
 * @constructor
 * @param {...Array} varArgs
 */
function Shape(varArgs) {
    /** @type {XSS.ShapePixels} */
    this.pixels = [];

    /** @type {boolean} */
    this.enabled = true;

    /**
     * Put at end of painting queue and clear bbox coverage before painting.
     * @type {boolean}
     */
    this.clearBBox = false;

    /**
     * Clear pixels before painting. Useful for lazy overlays.
     * @type {boolean}
     */
    this.clearPx = false;

    /** @type {Object.<string,*>} */
    this.effects = {};

    /** @type {?XSS.ShapeCache} */
    this.cache = null;

    /** @type {?BoundingBox} */
    this._bbox = null;

    this.add.apply(this, arguments);
}

Shape.prototype = {

    /**
     * @param {number=} speed
     * @return {Shape}
     */
    flash: function(speed) {
        this.effects.flash = this._flashEffect.apply(this, arguments);
        return this;
    },

    /**
     * @param {number} start
     * @param {number} end
     * @return {Shape}
     */
    lifetime: function(start, end) {
        this.effects.lifetime = this._lifetimeEffect.apply(this, arguments);
        return this;
    },

    /**
     * @param {Object=} options
     * @return {Shape}
     */
    animate: function(options) {
        this.effects.animate = this._animateEffect.apply(this, arguments);
        return this;
    },

    /**
     * @return {Shape}
     */
    clone: function() {
        return new Shape(this.pixels);
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {Shape}
     */
    shift: function(x, y) {
        return this.set(XSS.transform.shift(this.pixels, x, y));
    },

    /**
     * @param {BoundingBox=} bbox
     * @return {Shape}
     */
    invert: function(bbox) {
        var pixels = this.pixels.slice(), inverted = [];
        bbox = bbox || this.bbox();
        for (var x = bbox.x1; x < bbox.x2; x++) {
            for (var y = bbox.y1; y < bbox.y2; y++) {
                inverted.push([x, y]);
            }
        }
        this.pixels = inverted;
        this.remove(pixels);
        this.uncache();
        return this;
    },

    /**
     * @return {Shape}
     */
    uncache: function() {
        this.cache = null;
        this._bbox = null;
        return this;
    },

    /**
     * @param {...Array} varArgs
     * @return {Shape}
     */
    set: function(varArgs) {
        this.pixels = [];
        return this.add.apply(this, arguments);
    },

    /**
     * @param {...Array} varArgs
     * @return {Shape}
     */
    add: function(varArgs) {
        for (var i = 0, m = arguments.length; i < m; i++) {
            for (var ii = 0, mm = arguments[i].length; ii < mm; ii++) {
                this.pixels.push(arguments[i][ii]);
            }
        }
        return this.uncache();
    },

    /**
     * @param {XSS.ShapePixels} pixels
     * @return {Shape}
     */
    remove: function(pixels) {
        for (var i = 0, m = pixels.length; i < m; i++) {
            for (var ii = 0, mm = this.pixels.length; ii < mm; ii++) {
                if (pixels[i][0] === this.pixels[ii][0] &&
                    pixels[i][1] === this.pixels[ii][1]) {
                    this.pixels.splice(ii, 1);
                    break;
                }
            }
        }
        return this.uncache();
    },

    /**
     * @return {BoundingBox}
     */
    bbox: function() {
        if (!this._bbox) {
            this._bbox = new BoundingBox().ofShape(this);
        }
        return this._bbox;
    },

    /**
     * @param {number=} speed
     * @return {function({number})}
     * @private
     */
    _flashEffect: function(speed) {
        var progress = 0;
        speed = speed || XSS.FLASH_NORMAL;
        return function(delta) {
            progress += delta;
            if (progress > speed) {
                progress -= speed;
                this.enabled = !this.enabled;
            }
        };
    },

    /**
     * @param {number} start
     * @param {number} end
     * @return {function({number})}
     * @private
     */
    _lifetimeEffect: function(start, end) {
        var key, progress = 0;
        return function(delta) {
            // Enable/disable shape only once, allows combination
            // with other enabling/disabling effects

            // Init
            progress += delta;
            if (progress === delta) {
                this.enabled = false;
            }

            // Start time reached
            if (progress >= start) {
                this.enabled = true;
            }

            // Stop time reached
            if (end && progress >= end) {
                key = XSS.util.getKey(XSS.shapes, this);
                if (key) {
                    XSS.shapes[key] = null;
                }
            }
        };
    },

    /**
     * @param {Object=} options
     * @return {function({number})}
     * @private
     */
    _animateEffect: function(options) {
        var from, to, duration, clone, clear, progress = 0;

        options  = options || {};
        from     = options.from || [0, 0];
        to       = options.to || [0, 0];
        duration = options.duration || 200;
        clone    = this.clone();
        clear    = this.clearPx;

        this.clearPx = true;

        /** @this {Shape} */
        return function(delta) {
            var x, y;
            progress += delta;
            if (progress < duration) {
                x = from[0] - ((from[0] - to[0]) * progress / duration);
                x = Math.round(x);
                y = from[1] - ((from[1] - to[1]) * progress / duration);
                y = Math.round(y);
                this.pixels = XSS.transform.shift(clone.pixels, x, y);
            } else {
                delete this.effects.animate;
                this.clearPx = clear;
                this.set(clone.shift(to[0], to[1]).pixels);
                if (options.callback) {
                    options.callback();
                }
            }
        }.bind(this);
    }

};