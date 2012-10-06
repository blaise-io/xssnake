/*jshint globalstrict:true, es5:true */
'use strict';


/**
 * Collisions and levels
 * @constructor
 * @param {number} levelID
 * @param {Object} levelData
 */
function Level(levelID, levelData) {
    this.levelID = levelID;
    this.level = levelData[levelID];
}

if (typeof module !== 'undefined') {
    module.exports = Level;
}

Level.prototype = {

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isWall: function(x, y) {
        if (this.outOfBounds(x, y)) {
            return true;
        } else if (this.innerWall(x, y)) {
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
        return this.seqToXY(pos);
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
                return this.seqToXY(random);
            }
            if (samplesPerIteration === 0) {
                minOpenEdges--;
                samplesPerIteration = 50;
            }
        }

        return [-1, -1];
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    outOfBounds: function(x, y) {
        if (x < 0 || y < 0) {
            return true;
        } else {
            return x >= this.level.width || y >= this.level.height;
        }
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    innerWall: function(x, y) {
        var seq = this.xyToSeq(x, y);
        return this.innerWallSeq(seq);
    },

    /**
     * @param {number} seq
     * @return {boolean}
     */
    innerWallSeq: function(seq) {
        var wall = this.level.walls;
        for (var i = 0, m = wall.length; i < m; i++) {
            if (seq === wall[i]) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param {Array.<number>} a
     * @param {Array.<number>} b
     * @return {number}
     */
    gap: function(a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    },

    /**
     * @param {number} seq
     * @return {number}
     * @private
     */
    _getSpawnPreferability: function(seq) {
        var free = 0,
            xy = this.seqToXY(seq);

        if (!this.isOpenSpace(xy[0], xy[1])) {
            return 0;
        }

        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                if (this.isOpenSpace(xy[0] + x, xy[1] + y)) {
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
     */
    isOpenSpace: function(x, y) {
        if (this.isWall(x, y)) {
            return false;
        }

        // TODO: Snakes occupying spaces
        return true;
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {number}
     */
    xyToSeq: function(x, y) {
        return x + this.level.width * y;
    },

    /**
     * @param {number} seq
     * @return {Array.<number>}
     */
    seqToXY: function(seq) {
        return [
            seq % this.level.width,
            Math.floor(seq / this.level.width)
        ];
    }

};