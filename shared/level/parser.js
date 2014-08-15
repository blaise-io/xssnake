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

    /**
     * @type {Array.<xss.level.Spawn>}
     */
    this.spawns = new Array(xss.ROOM_CAPACITY);

    /**
     * @type {Array.<xss.Coordinate>}
     * @private
     */
    this._spawns = new Array(xss.ROOM_CAPACITY);

    /**
     * @type {Array.<xss.Coordinate>}
     * @private
     */
    this._directions = new Array(xss.ROOM_CAPACITY);

    this._parsePixels(imagedata.data);
};

xss.level.Parser.prototype = {

    /**
     * @param {Object} imagedata
     * @private
     */
    _parsePixels: function(imagedata) {
        for (var i = 0, m = imagedata.length / 4; i < m; i++) {
            var rgb = [], location = this._seqToXY(i);
            for (var ii = 0; ii < 3; ii++) {
                rgb.push(imagedata[i * 4 + ii]);
            }
            this._handleColor(rgb, location[0], location[1]);
        }

        this._generateSpawns();
    },

    /**
     * @param {Array.<number>} rgb
     * @param {number} x
     * @param {number} y
     * @private
     */
    _handleColor: function(rgb, x, y) {
        switch (rgb.join(',')) {
            case '255,255,255':
                break;
            case '0,0,0':
                this.walls.add(x, y);
                break;
            case '222,222,222':
                this.unreachables.add(x, y);
                break;
            case '99,99,99':
                this._directions.push([x, y]);
                break;
            case '255,0,0':
                this._spawns[0] = [x, y];
                break;
            case '0,255,0':
                this._spawns[1] = [x, y];
                break;
            case '0,0,255':
                this._spawns[2] = [x, y];
                break;
            case '255,255,0':
                this._spawns[3] = [x, y];
                break;
            case '255,0,255':
                this._spawns[4] = [x, y];
                break;
            case '0,255,255':
                this._spawns[5] = [x, y];
                break;
            default:
                throw new Error(
                    'Unknown color: ' + rgb + ' ' +
                    'at ' + x + ',' + y
                );
        }
    },

    /**
     * @param {number} seq
     * @return {xss.Coordinate}
     * @private
     */
    _seqToXY: function(seq) {
        return [
            seq % this.width,
            Math.floor(seq / this.width)
        ];
    },

    /**
     * @private
     */
    _generateSpawns: function() {
        for (var i = 0, m = this._spawns.length; i < m; i++) {
            var direction, spawn = this._spawns[i];
            if (spawn) {
                direction = this._getSpawnDirection(spawn);
                this.spawns[i] = new xss.level.Spawn(spawn, direction);
            } else {
                throw new Error('Missing spawn with index: ' + i);
            }
        }
    },

    /**
     * @param {xss.Coordinate} spawn
     * @return {number}
     * @private
     */
    _getSpawnDirection: function(spawn) {
        for (var i = 0, m = this._directions.length; i < m; i++) {
            var dx, dy;

            if (!this._directions[i]) {
                continue;
            }

            dx = spawn[0] - this._directions[i][0];
            dy = spawn[1] - this._directions[i][1];

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
