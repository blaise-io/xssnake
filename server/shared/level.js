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
        return this.level.spawns[playerID];
    },

    /**
     * @param {number} playerID
     * @return {number}
     */
    getSpawnDirection: function(playerID) {
        return this.level.directions[playerID];
    },

    /**
     * @param {Array.<Array>} locations
     * @return {Array.<number>}
     */
    getEmptyLocation: function(locations) {
        while (true) {
            var location = [
                Math.floor(Math.random() * this.level.width),
                Math.floor(Math.random() * this.level.height)
            ];
            if (this.isEmptyLocation(locations, location)) {
                return location;
            }
        }
    },

    /**
     * @param {Array.<Array>} locations
     * @param {Array.<number>} location
     * @return {boolean}
     */
    isEmptyLocation: function(locations, location) {
        if (this.isWall(location[0], location[1])) {
            return false;
        }
        if (this.isUnreachable(location[0], location[1])) {
            return false;
        }
        for (var i = 0, m = locations.length; i < m; i++) {
            var iloc = locations[i];
            if (iloc && iloc[0] === location[0] && iloc[1] === location[1]) {
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
        return this.hasXY(this.level.walls, x, y);
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isUnreachable: function(x, y) {
        return this.hasXY(this.level.unreachables, x, y);
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