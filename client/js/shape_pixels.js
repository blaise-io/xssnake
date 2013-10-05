'use strict';

/**
 * xss.Shape pixels stored in a multi-dimensional array.
 * @param {Array.<Array.<number>>=} pixels
 * @constructor
 */
xss.ShapePixels = function(pixels) {
    /**
     * @type {Array.<Array.<number>>}
     */
    this.pixels = pixels || [];
};


xss.ShapePixels.prototype = {

    /**
     * @param {number} x
     * @param {number} y
     * @return {xss.ShapePixels}
     */
    add: function(x, y) {
        var pixels = this.pixels;
        if (y >= 0) {
            if (typeof pixels[y] !== 'undefined') {
                pixels[y].push(x);
            } else {
                pixels[y] = [x];
            }
        }
        return this;
    },

    /**
     * @return {xss.BoundingBox}
     */
    bbox: function() {
        return new xss.BoundingBox(this);
    },

    /**
     * @param {Array.<Array.<number>>} pairs
     * @return {xss.ShapePixels}
     */
    pairs: function(pairs) {
        for (var i = 0, m = pairs.length; i < m; i++) {
            var pair = pairs[i];
            this.add(pair[0], pair[1]);
        }
        return this;
    },

    /**
     * @return {xss.ShapePixels}
     */
    sort: function() {
        var sort, pixels = this.pixels;

        sort = function(a, b) {
            return a - b;
        };

        for (var i = 0, m = pixels.length; i < m; i++) {
            if (pixels[i]) {
                pixels[i] = pixels[i].sort(sort);
            }
        }
        return this;
    },

    /**
     * @param {function(number,number)} callback
     */
    each: function(callback) {
        var pixels = this.pixels;
        for (var y = 0, m = pixels.length; y < m; y++) {
            var row = pixels[y];
            if (typeof row !== 'undefined') {
                for (var i = 0, mm = row.length; i < mm; i++) {
                    callback(row[i], y);
                }
            }
        }
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {number}
     */
    index: function(x, y) {
        var row = this.pixels[y];
        if (typeof row !== 'undefined') {
            for (var i = 0, m = row.length; i < m; i++) {
                if (row[i] === x) {
                    return i;
                }
            }
        }
        return -1;
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    has: function(x, y) {
        var row = this.pixels[y];
        if (typeof row !== 'undefined') {
            for (var i = 0, m = row.length; i < m; i++) {
                if (row[i] === x) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * @param {*} shapes
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    hasMultiple: function(shapes, x, y) {
        for (var k in shapes) {
            if (shapes.hasOwnProperty(k) && shapes[k]) {
                if (shapes[k].pixels !== this && shapes[k].pixels.has(x, y)) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {xss.ShapePixels}
     */
    remove: function(x, y) {
        var index = this.index(x, y);
        if (-1 !== index) {
            this.pixels[y].splice(index, 1);
        }
        return this;
    }

};
