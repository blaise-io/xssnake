/*jshint globalstrict:true, sub:true*/
/*globals XSS*/

'use strict';

/**
 * Shape
 * @constructor
 * @param {...Array} varArgs
 */
function Shape(varArgs) {
    /** @private */ this._pixels = [];
    /** @private */ this._bbox = null;
    /** @private */ this._cache = null;
    /** @private */ this._enabled = true;
    /** @private */ this._dynamic = false;

    this.effects = {};
    this.add.apply(this, arguments || []);
}

Shape.prototype = {

    /**
     * @param {...} varArgs
     * @return {Shape}
     */
    flash: function(varArgs) {
        this.effects.flash = this._effects.flash.apply(this, arguments);
        return this;
    },

    /**
     * @param {...} varArgs
     * @return {Shape}
     */
    lifetime: function(varArgs) {
        this.effects.lifetime = this._effects.lifetime.apply(this, arguments);
        return this;
    },

    /**
     * @param {...} varArgs
     * @return {Shape}
     */
    swipe: function(varArgs) {
        this.effects.swipe = this._effects.swipe.apply(this, arguments);
        return this;
    },

    /**
     * @return {Shape}
     * @suppress {checkTypes}
     */
    clone: function() {
        return new Shape(this._pixels);
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {Shape}
     */
    shift: function(x, y) {
        this.pixels(XSS.transform.shift(this._pixels, x, y));
        return this;
    },

    /**
     * @param {Array} pixelStr
     * @return {Shape}
     */
    str: function(pixelStr) {
        this.pixels(XSS.shapes.strToXYArr(pixelStr[0], pixelStr[1]));
        return this;
    },

    /**
     * @param {...Array} varArgs
     * @return {(Array.<Array>|Shape)}
     */
    pixels: function(varArgs) {
        if (arguments.length === 0) {
            return this._pixels; // Getter
        } else {
            this._pixels = [];  // Setter
            this.add.apply(this, arguments);
            return this;
        }
    },

    /**
     * @param {...Array} varArgs
     * @return {Shape}
     */
    add: function(varArgs) {
        for (var i = 0, m = arguments.length; i < m; ++i) {
            // Avoiding concat() for performance reasons
            for (var ii = 0, mm = arguments[i].length; ii < mm; ii++) {
                this._pixels.push(arguments[i][ii]);
            }
        }
        delete this._cache;
        delete this._bbox;
        return this;
    },

    /**
     * @param {boolean=} enabled
     * @return {(boolean|Shape)}
     */
    enabled: function(enabled) {
        if (arguments.length === 0) {
            return this._enabled; // Getter
        } else {
            this._enabled = enabled; // Setter
            return this;
        }
    },

    /**
     * @param {boolean=} dynamic
     * @return {(boolean|Shape)}
     */
    dynamic: function(dynamic) {
        if (arguments.length === 0) {
            return this._dynamic; // Getter
        } else {
            this._dynamic = dynamic; // Setter
            return this;
        }
    },

    /**
     * @param {Object=} cache
     * @return {(Object|Shape)}
     */
    cache: function(cache) {
        if (arguments.length === 0) {
            return this._cache; // Getter
        } else {
            this._cache = cache; // Setter
            return this;
        }
    },

    /**
     * @return {Object}
     */
    bbox: function() {
        if (!this._bbox) {
            this._bbox = this._getBBox();
        }
        return this._bbox;
    },

    /**
     * @return {Object}
     * @private
     */
    _getBBox: function() {
        var x, y,
            pixels = this._pixels,
            minX = false,
            minY = false,
            maxX = false,
            maxY = false;

        for (var i = 0, m = pixels.length; i < m; i++) {
            x = pixels[i][0];
            if (minX === false || minX > x) {
                minX = x;
            }
            if (maxX === false || maxX < x) {
                maxX = x;
            }
            y = pixels[i][1];
            if (minY === false || minY > y) {
                minY = y;
            }
            if (maxY === false || maxY < y) {
                maxY = y;
            }
        }

        return {
            x     : minX,
            y     : minY,
            x2    : maxX ? maxX + 1 : 0,
            y2    : maxY ? maxY + 1 : 0,
            width : 1 + maxX - minX,
            height: 1 + maxY - minY
        };
    }

};