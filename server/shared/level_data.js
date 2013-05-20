/*jshint globalstrict:true, es5:true, node:true */
'use strict';

/**
 * @param {ImageData} imagedata
 * @constructor
 */
function LevelData(imagedata) {
    this.width = imagedata.width;
    this.height = imagedata.height;

    this.spawns = [];
    this.directions = [];
    this.unreachables = [];
    this.walls = [];

    this._parseImagedata(imagedata.data);
}

module.exports = LevelData;

LevelData.prototype = {

    /**
     * @param {Object} imagedata
     * @private
     */
    _parseImagedata: function(imagedata) {
        for (var i = 0, m = imagedata.length / 4; i < m; i++) {
            var rgb = [], location = this._seqToXY(i);
            for (var ii = 0; ii < 3; ii++) {
                rgb.push(imagedata[i * 4 + ii]);
            }
            this._handleColor(rgb.join(','), location[0], location[1]);
        }

        this._detectMissingSpawns();
        this._processDirections();
        this._detectMissingDirections();
    },

    _handleColor: function(rgb, x, y) {
        switch (rgb) {
            case '255,255,255':
                break;
            case '0,0,0':
                this._addTo(this.walls, x, y);
                break;
            case '222,222,222':
                this._addTo(this.unreachables, x, y);
                break;
            case '99,99,99':
                this.directions.push([x, y]);
                break;
            case '255,0,0':
                this.spawns[0] = [x, y];
                break;
            case '0,255,0':
                this.spawns[1] = [x, y];
                break;
            case '0,0,255':
                this.spawns[2] = [x, y];
                break;
            case '255,255,0':
                this.spawns[3] = [x, y];
                break;
            case '255,0,255':
                this.spawns[4] = [x, y];
                break;
            case '0,255,255':
                this.spawns[5] = [x, y];
                break;
            default:
                throw new Error(
                    'Unknown color: ' + rgb + ' ' +
                    'at ' + x + ',' + y
                );
        }
    },

    /**
     * @param {Object} obj
     * @param {number} x
     * @param {number} y
     * @private
     */
    _addTo: function(obj, x, y) {
        obj[y] = obj[y] || [];
        obj[y].push(x);
    },

    /**
     * @param {number} seq
     * @return {Array.<number>}
     * @private
     */
    _seqToXY: function(seq) {
        return [
            seq % this.width,
            Math.floor(seq / this.width)
        ];
    },

    _detectMissingSpawns: function() {
        for (var i = 0, m = this.spawns.length; i < m; i++) {
            if (!this.spawns[i]) {
                throw new Error('Missing spawn with index: ' + i);
            }
        }
    },

    _detectMissingDirections: function() {
        for (var i = 0, m = this.directions.length; i < m; i++) {
            if (!this.spawns[i]) {
                throw new Error('Missing direction with index: ' + i);
            }
        }
    },

    _processDirections: function() {
        var directions = [];

        for (var i = 0, m = this.spawns.length; i < m; i++) {
            for (var ii = 0, mm = this.directions.length; ii < mm; ii++) {
                var delta = {}, spawn, direction;

                spawn = this.spawns[i];
                direction = this.directions[ii];

                delta.x = spawn[0] - direction[0];
                delta.y = spawn[1] - direction[1];

                if (1 === Math.abs(delta.x) + Math.abs(delta.y)) {
                    if (delta.x === 0) {
                        directions[i] = (delta.y === 1) ? 1 : 3;
                    } else {
                        directions[i] = (delta.x === 1) ? 0 : 2;
                    }
                    break;
                }
            }
        }

        this.directions = directions;
    }

};
