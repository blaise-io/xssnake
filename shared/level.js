'use strict';

/**
 * Collisions and levels
 * @constructor
 * @param {xss.LevelData} levelData
 */
xss.Level = function(levelData) {
    this.levelData = levelData;
    this.animation = new xss.LevelAnimation(levelData.animation);
};

xss.Level.prototype = {

    /**
     * @param {number} delta
     * @return {Array.<Array.<xss.ShapePixels>>} shapePixelsArr
     */
    updateAnimateds: function(delta) {
        return this.animation.update(delta);
    },

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
        return this.levelData.spawns[playerID];
    },

    /**
     * @param {number} playerID
     * @return {number}
     */
    getSpawnDirection: function(playerID) {
        return this.levelData.directions[playerID];
    },

    /**
     * @param {Array.<Array>} nonEmptyLocations
     * @return {Array.<number>}
     */
    getEmptyLocation: function(nonEmptyLocations) {
        while (true) {
            var location = [
                Math.floor(Math.random() * this.levelData.width),
                Math.floor(Math.random() * this.levelData.height)
            ];
            if (this.isEmptyLocation(nonEmptyLocations, location)) {
                return location;
            }
        }
    },

    /**
     * @param {Array.<Array>} nonEmptyLocations
     * @param {Array.<number>} location
     * @return {boolean}
     */
    isEmptyLocation: function(nonEmptyLocations, location) {
        if (this.isWall(location[0], location[1])) {
            return false;
        }
        if (this.isUnreachable(location[0], location[1])) {
            return false;
        }
        for (var i = 0, m = nonEmptyLocations.length; i < m; i++) {
            var nonE = nonEmptyLocations[i];
            if (nonE && nonE[0] === location[0] && nonE[1] === location[1]) {
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
            return x >= this.levelData.width || y >= this.levelData.height;
        }
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    innerWall: function(x, y) {
        return this.hasXY(this.levelData.walls, x, y);
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isUnreachable: function(x, y) {
        return this.hasXY(this.levelData.unreachables, x, y);
    },

    /**
     * @param {Array.<Array.<number>>} obj
     * @param x
     * @param y
     * @return {boolean}
     */
    hasXY: function(obj, x, y) {
        var row = obj[y];
        if (typeof row !== 'undefined') {
            for (var i = 0, m = row.length; i < m; i++) {
                if (x === row[i]) {
                    return true;
                }
            }
        }
        return false;
    }

};
