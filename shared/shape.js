'use strict';

/** @typedef {Array.<number>} */
xss.ShapePixel;

/** @typedef {{canvas: *, bbox: xss.BoundingBox}} */
xss.ShapeCache;

/**
 * xss.Shape
 * @constructor
 * @param {...xss.ShapePixels} varArgs
 */
xss.Shape = function(varArgs) {
    /** @type {xss.ShapePixels} */
    this.pixels = new xss.ShapePixels();

    /** @type {boolean} */
    this.enabled = true;

    /**
     * Put at end of painting queue and clear bbox coverage before painting.
     * @type {boolean}
     */
    this.clearBBox = false;

    /** @type {Object.<string,*>} */
    this.effects = {};

    /** @type {{x: number, y: number}} */
    this.shift = {x: 0, y: 0};

    /** @type {?xss.ShapeCache} */
    this.cache = null;

    /**
     * @type {number}
     * @private
     */
    this._expand = 0;

    this.add.apply(this, arguments);
};

xss.Shape.prototype = {

    /**
     * @return {xss.Shape}
     */
    clone: function() {
        return new xss.Shape(this.pixels);
    },

    /**
     * @param {number=} hPadding
     * @param {number=} vPadding
     * @return {xss.Shape}
     */
    outline: function(hPadding, vPadding) {
        xss.transform.outline(this, hPadding, vPadding);
        return this;
    },

    /**
     * @param {xss.BoundingBox=} bbox
     * @return {xss.Shape}
     */
    invert: function(bbox) {
        var pixels = this.pixels, inverted;

        inverted = new xss.ShapePixels();
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
     * @return {xss.Shape}
     */
    uncache: function() {
        this.cache = null;
        this._bbox = null;
        return this;
    },

    /**
     * @param {...xss.ShapePixels} varArgs
     * @return {xss.Shape}
     */
    set: function(varArgs) {
        this.pixels = new xss.ShapePixels();
        return this.add.apply(this, arguments);
    },

    /**
     * @param {...xss.ShapePixels} varArgs
     * @return {xss.Shape}
     */
    add: function(varArgs) {
        var add = this.pixels.add.bind(this.pixels);
        for (var i = 0, m = arguments.length; i < m; i++) {
            arguments[i].each(add);
        }
        return this.uncache();
    },

    /**
     * @param {...xss.ShapePixels} pixels
     * @return {xss.Shape}
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
     * @return {xss.BoundingBox}
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
    }

};
