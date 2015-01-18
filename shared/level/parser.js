'use strict';

/**
 * @param {ImageData} imagedata
 * @constructor
 */
xss.level.Parser = function(imagedata) {
    this.width = imagedata.width;
    this.height = imagedata.height;
    this.walls = new xss.PixelCollection();
    this.unreachables = new xss.PixelCollection();

    /** @type {Array.<xss.level.Spawn>} */
    this.spawns = new Array(xss.ROOM_CAPACITY);

    /** @type {Array.<xss.Coordinate>} */
    this.spawnCoordinates = new Array(xss.ROOM_CAPACITY);

    /** @type {Array.<xss.Coordinate>} */
    this.spawnDirections = [];

    this.parsePixels(imagedata.data);
    this.generateSpawns();
};

xss.level.Parser.prototype = {

    /**
     * @param {Object} imagedata
     */
    parsePixels: function(imagedata) {
        for (var i = 0, m = imagedata.length / 4; i < m; i++) {
            this.parsePixel(
                [
                    imagedata[i * 4],
                    imagedata[i * 4 + 1],
                    imagedata[i * 4 + 2]
                ], [
                    i % this.width,
                    Math.floor(i / this.width)
                ]
            );
        }
    },

    /**
     * @param {Array.<number>} rgb
     * @param {xss.Coordinate} coordinate
     */
    parsePixel: function(rgb, coordinate) {
        function rgbEquals(r, g, b) {
            return rgb[0] === r && rgb[1] === g && rgb[2] === b;
        }

        if (rgbEquals(0, 0, 0)) {
            this.walls.add(coordinate[0], coordinate[1]);
        } else if (rgbEquals(222, 222, 222)) {
            this.unreachables.add(coordinate[0], coordinate[1]);
        } else if (rgbEquals(99, 99, 99)) {
            this.spawnDirections.push(coordinate);
        } else if (rgbEquals(255, 0, 0)) {
            this.spawnCoordinates[0] = coordinate;
        } else if (rgbEquals(0, 255, 0)) {
            this.spawnCoordinates[1] = coordinate;
        } else if (rgbEquals(0, 0, 255)) {
            this.spawnCoordinates[2] = coordinate;
        } else if (rgbEquals(255, 255, 0)) {
            this.spawnCoordinates[3] = coordinate;
        } else if (rgbEquals(255, 0, 255)) {
            this.spawnCoordinates[4] = coordinate;
        } else if (rgbEquals(0, 255, 255)) {
            this.spawnCoordinates[5] = coordinate;
        } else if (!rgbEquals(255, 255, 255)) {
            throw new Error('Unknown color: ' + rgb + ' ' + 'at ' + coordinate);
        }
    },

    generateSpawns: function() {
        for (var i = 0, m = this.spawnCoordinates.length; i < m; i++) {
            var spawnCoordinate = this.spawnCoordinates[i];
            
            if (spawnCoordinate) {
                this.spawns[i] = new xss.level.Spawn(
                    spawnCoordinate,
                    this.getDirectionForSpawn(spawnCoordinate)
                );
            } else {
                throw new Error('Missing spawn with index: ' + i);
            }
        }
    },

    /**
     * @param {xss.Coordinate} spawn
     * @return {number}
     */
    getDirectionForSpawn: function(spawn) {
        for (var i = 0, m = this.spawnDirections.length; i < m; i++) {
            var dx, dy;

            if (!this.spawnDirections[i]) {
                continue;
            }

            dx = spawn[0] - this.spawnDirections[i][0];
            dy = spawn[1] - this.spawnDirections[i][1];

            if (1 === Math.abs(dx) + Math.abs(dy)) {
                if (dx === 0) {
                    return (dy === 1) ? xss.DIRECTION_UP : xss.DIRECTION_DOWN;
                } else {
                    return (dx === 1) ? xss.DIRECTION_LEFT : xss.DIRECTION_RIGHT;
                }
            }
        }

        throw new Error('Spawn at ' + spawn + ' is missing a direction');
    }
};
