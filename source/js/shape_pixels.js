/*jshint globalstrict:true, es5:true, sub:true*/
/*globals BoundingBox*/
'use strict';

/**
 * Shape pixels stored in a multi-dimensional array.
 * @param {Array.<Array.<number>>=} pixels
 * @constructor
 */
function ShapePixels(pixels) {
    /**
     * @type {Array.<Array.<number>>}
     */
    this.pixels = pixels || [];
}


ShapePixels.prototype = {

    /**
     * @param {number} x
     * @param {number} y
     * @return {ShapePixels}
     */
    add: function(x, y) {
        var pixels = this.pixels;
        if (typeof pixels[y] !== 'undefined') {
            pixels[y].push(x);
        } else {
            pixels[y] = [x];
        }
        return this;
    },

    /**
     * @return {BoundingBox}
     */
    bbox: function() {
        return new BoundingBox(this);
    },

    /**
     * @param {Array.<Array.<number>>} pairs
     * @returns {ShapePixels}
     */
    pairs: function(pairs) {
        for (var i = 0, m = pairs.length; i < m; i++) {
            var pair = pairs[i];
            this.add(pair[0], pair[1]);
        }
        return this;
    },

    /**
     * @returns {ShapePixels}
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
     * @returns {number}
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
     * @returns {boolean}
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
     * @returns {boolean}
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
     * @returns {ShapePixels}
     */
    remove: function(x, y) {
        var index = this.index(x, y);
        if (-1 !== index) {
            this.pixels[y].splice(index, 1);
        }
        return this;
    }

};