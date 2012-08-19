/*jshint globalstrict:true*/
/*globals XSS,PixelEntity*/

'use strict';

/**
 * Collisions and levels
 * @constructor
 * @param {number} levelID
 */
function World(levelID) {
    this.level = XSS.levels[levelID];
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
        var level = this.level;
        if (x < 0 || y < 0) {
            return true;
        } else if ( x >= level.width || y >= level.height) {
            return true;
        } else if (this._isInnerWall(x, y)) {
            return true;
        }
        return false;
    },

    /**
     * @param {number} playerID
     * @return {Array.<number>}
     */
    getSpawn: function(playerID) {
        var pos = this.level.spawns[playerID];
        return this._seqToXY(pos);
    },

    /**
     * @param {number} playerID
     * @return {number}
     */
    getSpawnDirection: function(playerID) {
        return this.level.directions[playerID];
    },

    /**
     * @return {Array.<number>}
     */
    getRandomOpenTile: function() {
        var possibities, random, minOpenEdges, samplesPerIteration;

        possibities = this.level.width * this.level.height;
        minOpenEdges = 4;
        samplesPerIteration = 200;

        while (samplesPerIteration-- && minOpenEdges) {
            random = Math.floor(Math.random() * possibities);
            if (this._getSpawnPreferability(random) >= minOpenEdges) {
                return this._seqToXY(random);
            }
            if (samplesPerIteration === 0) {
                minOpenEdges--;
                samplesPerIteration = 50;
            }
        }

        return [-1, -1];
    },

    /**
     * @param {...number} varArgs
     * @private
     */
    _isInnerWall: function(varArgs) {
        var seq, wall = this.level.wall;

        seq = (arguments.length === 2) ?
            this._xyToSeq(arguments[0], arguments[1]) :
            arguments[0];

        for (var i = 0, m = wall.length; i < m; i++) {
            if (seq === wall[i]) {
                return true;
            }
        }

        return false;
    },

    /**
     * @param {number} seq
     * @return {number}
     * @private
     */
    _getSpawnPreferability: function(seq) {
        var free = 0,
            xy = this._seqToXY(seq);

        if (!this._isOpenSpace(xy[0], xy[1])) {
            return 0;
        }

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
        var xy, pixels = [], wall = this.level.wall;

        for (var i = 0, m = wall.length; i < m; i++) {
            xy = this._seqToXY(wall[i]);
            pixels.push(xy);
        }
        return new PixelEntity(XSS.effects.zoomGame(pixels));
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {number}
     * @private
     */
    _xyToSeq: function(x, y) {
        return x + this.level.width * y;
    },

    /**
     * @param {number} seq
     * @return {Array.<number>}
     * @private
     */
    _seqToXY: function(seq) {
        return [
            seq % this.level.width,
            Math.floor(seq / this.level.width)
        ];
    }

};