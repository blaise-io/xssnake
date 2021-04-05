"use strict";

/**
 * xss.Shape pixels stored in a multi-dimensional array.
 * I tried using an Uint8Array, but performance was bad.
 * @param {Array.<Array.<number>>=} pixels
 * @constructor
 */
xss.PixelCollection = function (pixels) {
    /** @type {Array.<Array.<number>>} */
    this.pixels = pixels || [];
};

xss.PixelCollection.prototype = {
    /**
     * @param {number} x
     * @param {number} y
     * @return {xss.PixelCollection}
     */
    add: function (x, y) {
        const pixels = this.pixels;
        if (pixels[y]) {
            pixels[y].push(x);
        } else {
            pixels[y] = [x];
        }
        return this;
    },

    /**
     * @return {!xss.BoundingBox}
     */
    bbox: function () {
        return new xss.BoundingBox(this);
    },

    /**
     * @param {Array.<xss.Coordinate>} pairs
     * @return {xss.PixelCollection}
     */
    addPairs: function (pairs) {
        for (let i = 0, m = pairs.length; i < m; i++) {
            this.add(pairs[i][0], pairs[i][1]);
        }
        return this;
    },

    /**
     * @return {xss.PixelCollection}
     */
    sort: function () {
        const pixels = this.pixels,
            sort = xss.util.sort;
        for (let i = 0, m = pixels.length; i < m; i++) {
            if (pixels[i]) {
                pixels[i] = sort(pixels[i]);
            }
        }
        return this;
    },

    /**
     * @param {function(number,number)} callback
     */
    each: function (callback) {
        const pixels = this.pixels;
        for (let y = 0, m = pixels.length; y < m; y++) {
            const row = pixels[y];
            if (row) {
                for (let i = 0, mm = row.length; i < mm; i++) {
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
    index: function (x, y) {
        const row = this.pixels[y];
        if (row) {
            for (let i = 0, m = row.length; i < m; i++) {
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
    has: function (x, y) {
        return -1 !== this.index(x, y);
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {xss.PixelCollection}
     */
    remove: function (x, y) {
        const index = this.index(x, y);
        if (-1 !== index) {
            this.pixels[y].splice(index, 1);
        }
        return this;
    },

    /**
     * @param {number} y
     * @return {xss.PixelCollection}
     */
    removeLine: function (y) {
        if (this.pixels[y]) {
            this.pixels[y].length = 0;
        }
        return this;
    },
};
