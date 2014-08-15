'use strict';

/**
 * @param {ImageData} imagedata
 * @param {xss.levelanim.Registry} animations
 * @constructor
 */
xss.level.Data = function(imagedata, animations) {
    var parser = new xss.level.Parser(imagedata);
    this.width = imagedata.width;
    this.height = imagedata.height;
    this.walls = parser.walls;
    this.spawns = parser.spawns;
    this.unreachables = parser.unreachables;
    this.animations = animations;
};

xss.level.Data.prototype = {

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isWall: function(x, y) {
        if (this.outOfBounds(x, y)) {
            return true;
        } else if (this.walls.has(x, y)) {
            return true;
        }
        return false;
    },

    /**
     * @param {xss.Coordinate} coordinate
     * @return {boolean}
     */
    isMovingWall: function(coordinate) {
        var shapes = this.animations.getMovingWalls();
        return this.inShapes(shapes, coordinate);
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
        if (this.unreachables.has(location[0], location[1])) {
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
            return x >= this.width || y >= this.height;
        }
    }

};
