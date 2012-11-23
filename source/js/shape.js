/*jshint globalstrict:true, es5:true, sub:true*/
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
    this.clip = false;

    /** @type {Object.<string,*>} */
    this.effects = {};

    this.add.apply(this, arguments);
}

Shape.prototype = {

    /**
     * @param {number=} speed
     * @return {Shape}
     */
    flash: function(speed) {
        this.effects.flash = this._effects.flash.apply(this, arguments);
        return this;
    },

    /**
     * @param {number} start
     * @param {number} stop
     * @param {boolean=} deleteShape
     * @return {Shape}
     */
    lifetime: function(start, stop, deleteShape) {
        this.effects.lifetime = this._effects.lifetime.apply(this, arguments);
        return this;
    },

    /**
     * @param {Object=} options
     * @return {Shape}
     */
    animate: function(options) {
        this.effects.animate = this._effects.animate.apply(this, arguments);
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
     * @param {Array} str
     * @return {Shape}
     */
    str: function(str) {
        return this.set(XSS.shapegen.strToShapePixels(str[0], str[1]));
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
        this.cache = null;
        this._bbox = null;
        return this;
    },

    /**
     * @param {ShapePixels} pixels
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
        this.cache = null;
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