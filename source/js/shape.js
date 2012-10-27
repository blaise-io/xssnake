/*jshint globalstrict:true, sub:true*/
/*globals XSS, BoundingBox*/

'use strict';

/** @typedef {Array.<Array>} */
var ShapePixels;

/** @typedef {{canvas: Object, bbox: BoundingBox}} */
var ShapeCache;

/**
 * Shape
 * @constructor
 * @param {...Array} varArgs
 */
function Shape(varArgs) {
    /** @type {ShapePixels} */
    this.pixels = [];

    /** @type {?ShapeCache} */
    this.cache = null;

    /** @type {boolean} */
    this.enabled = true;

    /** @type {boolean} */
    this.dynamic = false;

    /** @type {boolean} */
    this.clear = false;

    /** @type {Object.<string,*>} */
    this.effects = {};

    this.add.apply(this, arguments);
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
        this.pixels = XSS.shapegen.strToShapePixels(pixelStr[0], pixelStr[1]);
        return this;
    },

    /**
     * @param {...Array} varArgs
     * @return {Shape}
     */
    add: function(varArgs) {
        for (var i = 0, m = arguments.length; i < m; ++i) {
            for (var ii = 0, mm = arguments[i].length; ii < mm; ii++) {
                this.pixels.push(arguments[i][ii]);
            }
        }
        this._cache = null;
        this._bbox = null;
        return this;
    },

    /**
     * @return {BoundingBox}
     */
    bbox: function() {
        if (!this._bbox) {
            this._bbox = new BoundingBox().ofShape(this);
        }
        return this._bbox;
    }

};