/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, BoundingBox, ShapePixels*/
'use strict';

/** @typedef {Array.<number>} */
XSS.ShapePixel = null;

/** @typedef {{canvas: *, bbox: BoundingBox}} */
XSS.ShapeCache = null;

/**
 * Shape
 * @constructor
 * @param {...ShapePixels} varArgs
 */
function Shape(varArgs) {
    /** @type {ShapePixels} */
    this.pixels = new ShapePixels();

    /** @type {boolean} */
    this.enabled = true;

    /**
     * Put at end of painting queue and clear bbox coverage before painting.
     * @type {boolean}
     */
    this.clearBBox = false;

    /** @type {Object.<string,*>} */
    this.effects = {};

    /** @type {?XSS.ShapeCache} */
    this.cache = null;

    /**
     * @type {number}
     * @private
     */
    this._expand = 0;

    this.add.apply(this, arguments);
}

Shape.prototype = {

    /**
     * @param {number=} on Visible duration
     * @param {number=} off Invisible duration
     * @return {Shape}
     */
    flash: function(on, off) {
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
     * @param {number} delta
     */
    applyEffects: function(delta) {
        for (var k in this.effects) {
            if (this.effects.hasOwnProperty(k)) {
                this.effects[k].call(this, delta);
            }
        }
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
     * @param {number} width
     * @param {number} height
     * @return {Shape}
     */
    center: function(width, height) {
        return this.set(XSS.transform.center(this.pixels, width, height));
    },

    /**
     * @param {number=} hPadding
     * @param {number=} vPadding
     * @return {Shape}
     */
    outline: function(hPadding, vPadding) {
        XSS.transform.outline(this, hPadding, vPadding);
        return this;
    },

    /**
     * @param {BoundingBox=} bbox
     * @return {Shape}
     */
    invert: function(bbox) {
        var pixels = this.pixels, inverted;

        inverted = new ShapePixels();
        bbox = bbox || this.bbox();

        for (var x = bbox.x1; x <= bbox.x2; x++) {
            for (var y = bbox.y1; y < bbox.y2; y++) {
                if (!pixels.has(x, y)) {
                    inverted.add(x, y);
                }
            }
        }

        return this.set(inverted);
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
     * @param {...ShapePixels} varArgs
     * @return {Shape}
     */
    set: function(varArgs) {
        this.pixels = new ShapePixels();
        return this.add.apply(this, arguments);
    },

    /**
     * @param {...ShapePixels} varArgs
     * @return {Shape}
     */
    add: function(varArgs) {
        var add = this.pixels.add.bind(this.pixels);
        for (var i = 0, m = arguments.length; i < m; i++) {
            arguments[i].each(add);
        }
        return this.uncache();
    },

    /**
     * @param {...ShapePixels} pixels
     * @return {Shape}
     */
    remove: function(pixels) {
        var remove = this.pixels.remove.bind(this.pixels);
        for (var i = 0, m = arguments.length; i < m; i++) {
            arguments[i].each(remove);
        }
        return this.uncache();
    },

    /**
     * @param {number=} expand
     * @return {BoundingBox}
     */
    bbox: function(expand) {
        if (typeof expand === 'undefined') {
            expand = this._expand || 0;
        }
        if (!this._bbox || this._expand !== expand) {
            this._bbox = this.pixels.bbox();
            if (expand) {
                this._bbox.expand(expand);
            }
        }
        this._expand = expand;
        return this._bbox;
    },

    /**
     * @param {number=} on
     * @param {number=} off
     * @return {function({number})}
     * @private
     */
    _flashEffect: function(on, off) {
        var duration = [on || 500, off || 100], progress = 0;
        return function(delta) {
            progress += delta;
            if (progress > duration[+!this.enabled]) {
                progress -= duration[+!this.enabled];
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
        var from, to, duration, clone, progress = 0;

        options  = options || {};
        from     = options.from || [0, 0];
        to       = options.to || [0, 0];
        duration = options.duration || 200;
        clone    = this.clone();

        /** @this {Shape} */
        return function(delta) {
            var x, y;
            progress += delta;
            if (progress < duration) {
                x = from[0] - ((from[0] - to[0]) * progress / duration);
                x = Math.round(x);
                y = from[1] - ((from[1] - to[1]) * progress / duration);
                y = Math.round(y);
                this.set(XSS.transform.shift(clone.pixels, x, y));
            } else {
                delete this.effects.animate;
                this.set(clone.shift(to[0], to[1]).pixels);
                if (options.callback) {
                    options.callback();
                }
            }
        }.bind(this);
    }

};
