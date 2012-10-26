/*jshint globalstrict:true, sub:true*/
/*globals XSS*/

'use strict';

/** @typedef {Array.<Array>} */
var ShapePixels;

/** @typedef {{
 *      x: number,
 *      y: number,
 *      x2: number,
 *      y2: number,
 *      width: number,
 *      height: number
 *   }}
 */
var BBox;

/**
 * Shape
 * @constructor
 * @param {...Array} varArgs
 */
function Shape(varArgs) {
    /** @type {ShapePixels} */
    this.pixels = [];

    /** @type {?Object} */
    this.cache = null;

    /** @type {boolean} */
    this.enabled = true;

    /** @type {boolean} */
    this.dynamic = false;

    /** @type {boolean} */
    this.clear = false;

    /** @type {Object.<string,*>} */
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
        this.pixels = XSS.transform.shift(this.pixels, x, y);
        return this;
    },

    /**
     * @param {Array} pixelStr
     * @return {Shape}
     */
    str: function(pixelStr) {
        this.pixels = XSS.shapegen.strToXYArr(pixelStr[0], pixelStr[1]);
        return this;
    },

    /**
     * @param {...Array} varArgs
     * @return {Shape}
     */
    add: function(varArgs) {
        for (var i = 0, m = arguments.length; i < m; ++i) {
            // Avoid concat() for performance reasons
            for (var ii = 0, mm = arguments[i].length; ii < mm; ii++) {
                this.pixels.push(arguments[i][ii]);
            }
        }
        this._cache = null;
        this._bbox = null;
        return this;
    },

    /**
     * @return {BBox}
     */
    bbox: function() {
        if (!this._bbox) {
            this._bbox = this._getBBox();
        }
        return this._bbox;
    },

    /**
     * @return {BBox}
     * @private
     */
    _getBBox: function() {
        var pixels = this.pixels,
            minX = false,
            minY = false,
            maxX = false,
            maxY = false;

        for (var i = 0, m = pixels.length; i < m; i++) {
            var x = pixels[i][0],
                y = pixels[i][1];

            if (minX === false || minX > x) {
                minX = x;
            }
            if (maxX === false || maxX < x) {
                maxX = x;
            }
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