/*jshint globalstrict:true, es5:true, node:true */
'use strict';


/**
 * Collisions and levels
 * @constructor
 * @param {number} levelID
 * @param {Object} levelData
 */
function Level(levelID, levelData) {
    this.level = levelData[levelID];
}

module.exports = Level;

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
     * @param {Array.<Snake>} snakes
     * @return {Array.<number>}
     * @suppress {checkTypes} GCC being weird
     */
    getRandomOpenTile: function(snakes) {
        var randomSeq, randomXY, max = this.level.width * this.level.height;
        while (true) {
            randomSeq = Math.floor(Math.random() * max);
            randomXY = this.seqToXY(randomSeq);
            if (this.clearOfWallsAndSnakes(randomXY, snakes)) {
                break;
            }
        }
        return randomXY;
    },

    /**
     * @param {Array.<number>} randomXY
     * @param {Array.<Snake>} snakes
     * @return {boolean}
     */
    clearOfWallsAndSnakes: function(randomXY, snakes) {
        if (this.isWall(randomXY[0], randomXY[1])) {
            return false;
        }
        for (var i = 0, m = snakes.length; i < m; i++) {
            if (snakes[i].hasPart(randomXY)) {
                return false;
            }
        }
        return true;
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