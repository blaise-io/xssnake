'use strict';

/**
 * Collisions and levels
 * @param {xss.LevelData} levelData
 * @param {number} animProgress
 * @constructor
 */
xss.Level = function(levelData, animProgress) {
    /** @type {Array.<xss.ShapeCollection>} */
    this.animations = [];
    this.levelData = levelData;
    this.levelAnimation = new xss.LevelAnimation(levelData.animation, animProgress);
    this.levelWind = new xss.LevelWind(levelData.wind);
};

xss.Level.prototype = {

    /**
     * @param {number} delta
     * @param {boolean} gameStarted
     * @return {Array.<xss.ShapeCollection>}
     */
    updateMovingWalls: function(delta, gameStarted) {
        var shapeCollections = this.levelAnimation.update(delta, gameStarted);
        if (gameStarted) {
            for (var i = 0, m = shapeCollections.length; i < m; i++) {
                if (shapeCollections[i]) {
                    this.animations[i] = shapeCollections[i];
                }
            }
        }
        return shapeCollections;
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isWall: function(x, y) {
        if (this.outOfBounds(x, y)) {
            return true;
        } else if (this.levelData.walls.has(x, y)) {
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
        for (var i = 0, m = this.animations.length; i < m; i++) {
            if (this.inShapes(this.animations[i], x, y)) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param {xss.ShapeCollection} shapeCollection
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    inShapes: function(shapeCollection, x, y) {
        for (var i = 0, m = shapeCollection.shapes.length; i < m; i++) {
            var translate, tx, ty, object = shapeCollection.shapes[i];
            if (object) {
                translate = object.transform.translate;
                tx = (translate[0] - xss.GAME_LEFT) / xss.GAME_TILE;
                ty = (translate[1] - xss.GAME_TOP) / xss.GAME_TILE;
                if (object.pixels.has(x - tx, y - ty)) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * @param {number} playerID
     * @return {xss.Coordinate}
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
     * @return {xss.Coordinate}
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
     * @param {xss.Coordinate} location
     * @return {boolean}
     */
    isEmptyLocation: function(nonEmptyLocations, location) {
        if (this.isWall(location[0], location[1])) {
            return false;
        }
        if (this.levelData.unreachables.has(location[0], location[1])) {
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
    }

};
