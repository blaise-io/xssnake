'use strict';

/**
 * @implements {xss.animation.Interface}
 * @constructor
 */
xss.animation.ScrollingCave = function() {
    this.seed = Math.random();
    this.seedIteration = 0;
};

xss.animation.ScrollingCave.prototype = {

    /**
     * @param {number} ms
     * @param {boolean} gameStarted
     * @returns {Array.<xss.ShapePixels>}
     */
    update: function(ms, gameStarted) {
        var shapes, x1, LEVEL_WIDTH, i;

        if (this.generated) {
            return null;
        }
        this.generated = true;

        shapes = [];
        x1 = 0;
        LEVEL_WIDTH = 63;

        // Hanging
        for (i = 0; i < 10; i++) {
            if (x1 < LEVEL_WIDTH) {
                x1 = this._generateBump(i, shapes, true, x1);
            }
        }

        // Standing
        x1 = -15;
        for (i = 0; i < 10; i++) {
            if (x1 < LEVEL_WIDTH) {
                x1 = this._generateBump(i, shapes, false, x1);
            }
        }
        return shapes;
    },

    _scrambleDecimals: function(seed, cutat) {
        var max = 16, dec0, dec1, pow;
        pow = Math.pow(10, max);
        cutat = cutat % max;
        dec0 = seed * Math.pow(10, cutat) / pow;
        dec1 = seed * pow / Math.pow(10, max - cutat) % 1;
        return dec0 + dec1;
    },

    _random: function(min, max) {
        this.seed = this._scrambleDecimals(this.seed, ++this.seedIteration);
        return min + Math.floor(this.seed * (max - min + 1));
    },

    _generateBump: function(index, shapes, hanging, x0) {
        var yn, yt, x1, xn, xp;

        var WIDTH = [5, 30];
        var HEIGHT = [5, 50];
        var DECREASE = [0, 2];
        var LEVEL_HEIGHT = 33;

        yn = this._random(HEIGHT[0], HEIGHT[1]);
        xn = x0 + this._random(WIDTH[0], WIDTH[1]);
        xp = xn;
        x1 = xn;

        for (var y = 0; y < yn; y++) {
            yt = hanging ? y : LEVEL_HEIGHT - y;
            if (y) {
                x0 += this._random(DECREASE[0], DECREASE[1]);
                x1 -= this._random(DECREASE[0], DECREASE[1]);
            }
            if (x0 < x1 && x1 <= xp) {
                shapes.push(xss.shapegen.line(x0, yt, x1, yt));
                xp = x1;
            } else {
                break;
            }
        }
        return xn;
    }
};
