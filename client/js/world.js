/*jshint globalstrict:true*/
/*globals XSS,PixelEntity*/

'use strict';

/**
 * Collisions and levels
 * @constructor
 * @param {number} level
 */
function World(level) {
    var levelTmp = XSS.levels[level];
    this.width = levelTmp.width;
    this.height = levelTmp.height;
    this.data = levelTmp.data;
}

World.prototype = {

    addToEntities: function() {
        XSS.ents.world = this._worldToEntity();
    },

    isCrashIntoWorld: function(x, y) {
        if (x < 0 || y < 0) {
            return true;
        } else if ( x >= this.width || y >= this.height) {
            return true;
        } else if (this.data[this._xyToSeq(x, y)] === 0) {
            return true;
        }
        return false;
    },

    _worldToEntity: function() {
        var k, xy, pixels;

        pixels = [];

        for (k in this.data) {
            if (this.data.hasOwnProperty(k)) {
                if (this.data[k] === 0) {
                    xy = this._seqToXY(k);
                    pixels.push(xy);
                }
            }
        }

        pixels = XSS.effects.zoomX4(pixels, 2, 2);

        return new PixelEntity(pixels);
    },

    _xyToSeq: function(x, y) {
        return x + this.width * y;
    },

    _seqToXY: function(seq) {
        seq = parseInt(seq, 10);
        return [
            seq % this.width,
            Math.floor(seq / this.width)
        ];
    }

};