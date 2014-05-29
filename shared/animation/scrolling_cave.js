'use strict';

/**
 * @implements {xss.animation.Interface}
 * @constructor
 */
xss.animation.ScrollingCave = function() {
    this.seed = Math.random();
    this.seedIteration = 0;

    /**
     * @type {Array.<xss.PixelCollection>}
     * @private
     */
    this._shapePixelsArr = [];

    this._scroll = this._scrollPref = 0;
};

xss.animation.ScrollingCave.prototype = {

    _SPEED        : 0.47,

    _BUMP_WIDTH   : [15, 25],
    _BUMP_HEIGHT  : [20, 40],
    _BUMP_DECREASE: [0, 2],

    // To do: get from {xss.LevelData} instance
    _LEVEL_WIDTH  : 63,
    _LEVEL_HEIGHT : 33,

    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @returns {Array.<xss.PixelCollection>}
     */
    update: function(ms, gameStarted) {
        this._scroll = Math.round(ms / (1000 - (this._SPEED * 2000)));

        if (this._scrollPref === this._scroll) {
            return null;
        } else {
            this._updateShapePixelsArrs(this._scrollPref - this._scroll);
            this._scrollPref = this._scroll;
            return this._shapePixelsArr;
        }
    },

    _updateShapePixelsArrs: function(offset) {
        var maxes = {hanging: this._LEVEL_WIDTH, standing: this._LEVEL_WIDTH - 15};
        for (var i = 0, m = this._shapePixelsArr.length; i < m; i++) {
            if (this._shapePixelsArr[i]) {
                this._updateShapePixelsArr(this._shapePixelsArr, i, offset, maxes);
            }
        }

        if (maxes.hanging <= this._LEVEL_WIDTH) {
            // Stalactite ‾\/‾
            this._generateHangingBump(maxes.hanging + 1);
        }

        if (maxes.standing <= this._LEVEL_WIDTH) {
            // Stalagmite _/\_
            this._generateStandingBump(maxes.standing + 1);
        }
    },

    _updateShapePixelsArr: function(shapePixelsArr, i, offset, maxes) {
        if (shapePixelsArr[i].meta.x1 < 0) {
            shapePixelsArr[i] = null;
        } else if (shapePixelsArr[i]) {
            var meta = shapePixelsArr[i].meta;
            shapePixelsArr[i] = xss.transform.shift(shapePixelsArr[i], offset);
            shapePixelsArr[i].meta = meta;
            shapePixelsArr[i].meta.x1 += offset;

            if (shapePixelsArr[i].meta.isHanging) {
                maxes.hanging = Math.max(maxes.hanging, shapePixelsArr[i].meta.x1);
            } else {
                maxes.standing = Math.max(maxes.standing, shapePixelsArr[i].meta.x1);
            }
        }
    },

    _scrambleDecimals: function(seed, cutat) {
        var max = 16, dec0, dec1, pow;
        pow = Math.pow(10, max);
        cutat = cutat % max;
        dec0 = seed * Math.pow(10, cutat) / pow;
        dec1 = seed * pow / Math.pow(10, max - cutat) % 1;
        return dec0 + dec1;
    },

    /**
     * @param {Array.<number>} range
     * @returns {number}
     * @private
     */
    _random: function(range) {
        this.seed = this._scrambleDecimals(this.seed, ++this.seedIteration);
        return range[0] + Math.floor(this.seed * (range[1] - range[0] + 1));
    },

    _generateHangingBump: function(xRow0) {
        var xRow1;
        xRow1 = xRow0 + this._random(this._BUMP_WIDTH);
        this._generateBump(true, xRow0, xRow1);
    },

    _generateStandingBump: function(xRow0) {
        var xRow1;
        xRow1 = xRow0 + this._random(this._BUMP_WIDTH);
        this._generateBump(false, xRow0, xRow1);
    },

    _generateBump: function(isHanging, xRow0, xRow1) {
        var maxHeight, shape;

        maxHeight = this._random(this._BUMP_HEIGHT);
        shape = new xss.Shape();

        shape.pixels.meta.x1 = xRow1;
        shape.pixels.meta.isHanging = isHanging;

        for (var y = 0; y < maxHeight; y++) {
            var yTop, xRow1Prev = xRow1;
            if (y) {
                xRow0 += this._random(this._BUMP_DECREASE);
                xRow1 -= this._random(this._BUMP_DECREASE);
            }
            yTop = isHanging ? y : this._LEVEL_HEIGHT - y - 1;
            if (xRow0 < xRow1 && xRow1 <= xRow1Prev) {
                shape.add(
                    xss.shapegen.line(xRow0, yTop, xRow1, yTop)
                );
                xRow1Prev = xRow1;
            } else {
                break;
            }
        }

        this._shapePixelsArr.push(shape.pixels);
    }

};
