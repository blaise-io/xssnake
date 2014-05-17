'use strict';

/**
 * @implements {xss.animation.Interface}
 * @constructor
 */
xss.animation.ScrollingCave = function() {
    this.seed = Math.random();
    this.seedIteration = 0;

    /**
     * @type {Array.<xss.Shape>}
     * @private
     */
    this._shapePixelsArr = [];

    this._scroll = this._scrollPref = 0;

    this._xPointer = {
        hanging : 0, // Stalactite ‾\/‾
        standing: -15 // Stalagmite _/\_ - width/2 because want a zigzag tunnel.
    };
};

xss.animation.ScrollingCave.prototype = {

    _SPEED        : 0.8,

    _BUMP_WIDTH   : [5, 30],
    _BUMP_HEIGHT  : [5, 50],
    _BUMP_DECREASE: [0, 2],

    // To do: get from {xss.LevelData} instance
    _LEVEL_WIDTH  : 63,
    _LEVEL_HEIGHT : 33,

    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @returns {Array.<xss.ShapePixels>}
     */
    update: function(ms, gameStarted) {
        this._scroll = Math.round(ms / (1000 - (this._SPEED * 1000)));

        if (this._scrollPref === this._scroll) {
            return null;
        } else {
            this._updateShapes(this._scrollPref - this._scroll);
            this._appendHanging(); // Stalactite ‾\/‾
            this._appendStanding(); // Stalagmite _/\_
            this._scrollPref = this._scroll;
            return this._shapePixelsArr;
        }
    },

    _updateShapes: function(offset) {
        var i, m, sPixelsArr = this._shapePixelsArr;
        for (i = 0, m = sPixelsArr.length; i < m; i++) {
            if (sPixelsArr[i]) {
                sPixelsArr[i] = xss.transform.shift(sPixelsArr[i], offset);
            }
        }
    },
    
    _appendHanging: function() {
//        while (this._requireNewBump(this._xPointer.hanging)) {
//            this._generateHangingBump();
//        }
    },
    
    _appendStanding: function() {
        while (this._requireNewBump(this._xPointer.standing)) {
            this._generateStandingBump();
        }
    },

    _requireNewBump: function(x) {
        return x - this._scroll < this._LEVEL_WIDTH;
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

    _generateHangingBump: function() {
        var xRow0, xRow1;
        xRow0 = this._xPointer.hanging;
        xRow1 = xRow0 + this._random(this._BUMP_WIDTH);
        this._xPointer.hanging = xRow1;
        this._generateBump(true, xRow0, xRow1);
    },

    _generateStandingBump: function() {
        var xRow0, xRow1;
        xRow0 = this._xPointer.standing;
        xRow1 = xRow0 + 15; // this._random(this._BUMP_WIDTH);
        this._xPointer.standing = xRow1 + 2;// + 1;
        this._generateBump(false, xRow0, xRow1);
    },

    _generateBump: function(isHanging, xRow0, xRow1) {
        var maxHeight = 1, shape = new xss.Shape(); // this._random(this._BUMP_HEIGHT);

        for (var y = 0; y < maxHeight; y++) {
            var yTop, xRow1Prev = xRow1;
            if (y) {
                xRow0 += 1; // this._random(this._BUMP_DECREASE);
                xRow1 -= 1; // this._random(this._BUMP_DECREASE);
            }
            if (xRow0 % 2) {
                y += 1;
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
