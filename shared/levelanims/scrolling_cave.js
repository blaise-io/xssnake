'use strict';

/**
 * @param {number} seed
 * @implements {xss.levelanim.Interface}
 * @constructor
 */
xss.levelanims.ScrollingCave = function(seed) {
    this.seed = seed;
    this.seedIteration = 0;

    this._shapes = new xss.ShapeCollection();
    this._scroll = this._scrollPref = 0;

    this._max = {
        // Stalactite ‾\/‾
        // Mnemonic: They hang...
        stalactite: this._LEVEL_WIDTH,
        // Stalagmite _/\_
        stalagmite: this._LEVEL_WIDTH + Math.round(
            xss.util.average(this._BUMP_WIDTH)
        )
    };
};

xss.levelanims.ScrollingCave.prototype = {

    _SPEED        : 0.47,

    _BUMP_WIDTH   : [15, 25],
    _BUMP_HEIGHT  : [20, 40],
    _BUMP_DECREASE: [0, 2],

    _LEVEL_WIDTH  : 63,
    _LEVEL_HEIGHT : 33,

    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @return {xss.ShapeCollection|null}
     */
    update: function(ms, gameStarted) {

        if (!gameStarted) {
            return null;
        } else if (!this.gameStartedAtMs) {
            this.gameStartedAtMs = ms;
        }

        ms -= this.gameStartedAtMs;
        this._scroll = Math.round(ms / (1000 - (this._SPEED * 2000)));

        if (this._scrollPref === this._scroll) {
            return null;
        } else {
            this._updateShapePixelsArrs(this._scrollPref - this._scroll);
            this._scrollPref = this._scroll;
            return this._shapes;
        }
    },

    _updateShapePixelsArrs: function(offset) {
        var max = this._max;

        this._shapes.each(function(shape, index) {
            this._updateShape(shape, index, offset);
        }.bind(this));

        max.stalactite += offset;
        max.stalagmite += offset;

        if (max.stalactite < this._LEVEL_WIDTH) {
            max.stalactite = this._spawnStalactite(max.stalactite + 1);
        }

        if (max.stalagmite < this._LEVEL_WIDTH) {
            max.stalagmite = this._spawnStalagmite(max.stalagmite + 1);
        }
    },

    _updateShape: function(shape, index, offset) {
        var translate = shape.transform.translate;

        var gameTileNormalized = Math.abs(translate[0]) / xss.GAME_TILE;
        if (gameTileNormalized - shape.bbox().width > this._LEVEL_WIDTH) {
            // No longer visible, despawn shape.
            this._shapes.set(index, null);
        } else {
            // Visible, move shape.
            translate[0] += offset * xss.GAME_TILE;
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
     * @return {number}
     * @private
     */
    _random: function(range) {
        this.seed = this._scrambleDecimals(this.seed, ++this.seedIteration);
        return range[0] + Math.floor(this.seed * (range[1] - range[0] + 1));
    },

    _spawnStalactite: function(x0) {
        var x1 = x0 + this._random(this._BUMP_WIDTH);
        this._spawnFormation(true, x0, x1);
        return x1;
    },

    _spawnStalagmite: function(x0) {
        var x1 = x0 + this._random(this._BUMP_WIDTH);
        this._spawnFormation(false, x0, x1);
        return x1;
    },

    _spawnFormation: function(isStalactite, x0, x1) {
        var y1, shape;

        y1 = this._random(this._BUMP_HEIGHT);
        shape = new xss.Shape();

        for (var y0 = 0; y0 < y1; y0++) {
            var y0Ite, xRow1Prev = x1;
            if (y0) {
                x0 += this._random(this._BUMP_DECREASE);
                x1 -= this._random(this._BUMP_DECREASE);
            }
            y0Ite = isStalactite ? y0 : this._LEVEL_HEIGHT - y0 - 1;
            if (x0 < x1 && x1 <= xRow1Prev) {
                shape.add(
                    xss.shapegen.line(x0, y0Ite, x1, y0Ite)
                );
                xRow1Prev = x1;
            } else {
                break;
            }
        }

        this._shapes.add(shape);
    }

};
