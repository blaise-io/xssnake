/*jshint globalstrict:true*/
/*globals XSS,PixelEntity*/

'use strict';

/**
 * Collisions and levels
 * @constructor
 * @param {number} level_id
 */
function World(level_id) {
    var level = XSS.levels[level_id];

    this.data = level.data;
    this.width = level.width;
    this.height = level.height;

    this.entity = this._worldToEntity();
}

World.prototype = {

    addToEntities: function() {
        XSS.ents.world = this.entity;
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isWall: function(x, y) {
        if (x < 0 || y < 0) {
            return true;
        } else if ( x >= this.width || y >= this.height) {
            return true;
        } else if (this.data[this._xyToSeq(x, y)] === 0) {
            return true;
        }
        return false;
    },

    /**
     * @return {Array.<number>}
     */
    getRandomOpenTile: function() {
        var possibities, random, minOpenSpaceNeighbours, samplesPerIteration;

        possibities = this.width * this.height;
        minOpenSpaceNeighbours = 6;
        samplesPerIteration = 30;

        while (samplesPerIteration-- && minOpenSpaceNeighbours) {
            random = Math.floor(Math.random() * possibities);
            if (this._numOpenNeighbours(random) >= 5) {
                return this._seqToXY(random);
            }
            if (samplesPerIteration === 0) {
                minOpenSpaceNeighbours--;
                samplesPerIteration = 50;
            }
        }

        return [-1, -1];
    },

    /**
     * @param {number} seq
     * @return {number}
     * @private
     */
    _numOpenNeighbours: function(seq) {
        var free = 0,
            xy = this._seqToXY(seq);

        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                if (this._isOpenSpace(xy[0] + x, xy[1] + y)) {
                    free++;
                }
            }
        }

        return free;
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     * @private
     */
    _isOpenSpace: function(x, y) {
        if (this.isWall(x, y)) {
            return false;
        }

        // TODO: Snakes occupying spaces

        return true;
    },

    /**
     * @return {PixelEntity}
     * @private
     */
    _worldToEntity: function() {
        var seq, xy, pixels = [];

        for (seq in this.data) {
            if (this.data.hasOwnProperty(seq)) {
                if (this.data[seq] === 0) {
                    xy = this._seqToXY(parseInt(seq, 10));
                    pixels.push(xy);
                }
            }
        }

        return new PixelEntity(XSS.game.zoom(pixels));
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {number}
     * @private
     */
    _xyToSeq: function(x, y) {
        return x + this.width * y;
    },

    /**
     * @param {number} seq
     * @return {Array.<number>}
     * @private
     */
    _seqToXY: function(seq) {
        return [
            seq % this.width,
            Math.floor(seq / this.width)
        ];
    }

};