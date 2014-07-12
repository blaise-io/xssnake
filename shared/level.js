'use strict';

/**
 * Collisions and levels
 * @param {xss.LevelData} levelData
 * @param {number} seed
 * @param {number} animProgress
 * @constructor
 */
xss.Level = function(levelData, seed, animProgress) {
    /** @type {Array.<xss.ShapeCollection>} */
    this.animations = [];
    this.levelData = levelData;
    this.levelAnimation = new xss.LevelAnimation(seed, levelData.animation, animProgress);
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
     * @param {xss.Coordinate} coordinate
     * @return {boolean}
     */
    isMovingWall: function(coordinate) {
        for (var i = 0, m = this.animations.length; i < m; i++) {
            if (this.inShapes(this.animations[i], coordinate)) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param {xss.ShapeCollection} shapeCollection
     * @param {xss.Coordinate} coordinate
     * @return {boolean}
     */
    inShapes: function(shapeCollection, coordinate) {
        for (var i = 0, m = shapeCollection.shapes.length; i < m; i++) {
            var translate, translated, object = shapeCollection.shapes[i];
            if (object) {
                translate = object.transform.translate;
                translated = this.convertToGameSystem(coordinate, translate);
                if (object.pixels.has(translated[0], translated[1])) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Translate coordinate to game coordinate system.
     *
     * @param {xss.Coordinate} coordinate
     * @param {xss.Shift} translate
     */
    convertToGameSystem: function(coordinate, translate) {
        var tx, ty;
        if (xss.IS_CLIENT) {
            // In Client, Game transforms left/top. Not ideal, but it is done
            // so that we can move shapes without losing cache => performance.
            tx = (translate[0] - xss.GAME_LEFT) / xss.GAME_TILE;
            ty = (translate[1] - xss.GAME_TOP) / xss.GAME_TILE;
        } else {
            // In Server, There is never left/top translation.
            tx = translate[0] / xss.GAME_TILE;
            ty = translate[1] / xss.GAME_TILE;
        }
        return [coordinate[0] - tx, coordinate[1] - ty];
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
