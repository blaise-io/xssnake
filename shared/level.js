'use strict';

/**
 * Collisions and levels
 * @constructor
 * @param {xss.LevelData} levelData
 */
xss.Level = function(levelData) {
    this.levelData = levelData;
    this.animation = new xss.LevelAnimation(levelData.animation);
    /** @type {Array.<Array.<xss.ShapePixels>>} */
    this.animated = [];
};

xss.Level.prototype = {

    /**
     * @param {number} delta
     * @return {Array.<Array.<xss.ShapePixels>>} shapePixelsArr
     */
    updateMovingWalls: function(delta) {
        var movingWalls = this.animation.update(delta);
        for (var i = 0, m = movingWalls.length; i < m; i++) {
            if (movingWalls[i]) {
                this.animated[i] = movingWalls[i];
            }
        }
        return movingWalls;
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
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isMovingWall: function(x, y) {
        for (var i = 0, m = this.animated.length; i < m; i++) {
            if (this.inShapePixelsArr(this.animated[i], x, y)) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param {Array.<xss.ShapePixels>} objects
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    inShapePixelsArr: function(objects, x, y) {
        for (var i = 0, m = objects.length; i < m; i++) {
            if (objects[i]) {
                if (objects[i].has(x, y)) {
                    return true;
                }
            }
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
