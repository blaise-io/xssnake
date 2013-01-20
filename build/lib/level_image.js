/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var fs = require('fs'),
    pngparse = require('pngparse');

function LevelImage(file, fn) {
    this.file = fs.realpathSync(file);
    this.fn = fn;
    this._toLevel();
}

module.exports = LevelImage;

LevelImage.prototype = {

    _toLevel: function() {
        var buffer = fs.readFileSync(this.file);
        pngparse.parse(buffer, function(err, png) {
            if (err) {
                throw err;
            }

            this.spawns = [];
            this.directions = [];
            this.unreachables = [];
            this.walls = [];

            this.width = png.width;
            this.height = png.height;

            this._parsePixels(png.data);

        }.bind(this));
    },

    _parsePixels: function(imageData) {
        var r, g, b, a;

        for (var i = 0, m = imageData.length / 4; i < m; i++) {
            r = imageData[i * 4];
            g = imageData[i * 4 + 1];
            b = imageData[i * 4 + 2];
            a = imageData[i * 4 + 3];
            this._handleColor(r, g, b, i);
        }

        this._postProcessDirections();

        return this.fn({
            width: this.width,
            height: this.height,
            spawns: this.spawns,
            directions: this.directions,
            unreachables: this.unreachables,
            walls: this.walls
        });
    },

    _handleColor: function(r, g, b, i) {
        var key = r + ',' + g + ',' + b;
        switch (key) {
            case '255,255,255':
                return true;
            case '0,0,0':
                this.walls.push(i);
                return true;
            case '222,222,222':
                this.unreachables.push(i);
                return true;
            case '255,0,0':
                this.spawns[0] = i;
                return true;
            case '0,255,0':
                this.spawns[1] = i;
                return true;
            case '0,0,255':
                this.spawns[2] = i;
                return true;
            case '255,255,0':
                this.spawns[3] = i;
                return true;
            case '255,0,255':
                this.spawns[4] = i;
                return true;
            case '0,255,255':
                this.spawns[5] = i;
                return true;
            case '99,99,99':
                this.directions.push(i);
                return true;
            default:
                console.error('Unknown color:', [r, g, b]);
                console.error('File:', this.file);
                console.error('[ X, Y ]:', this.seqToXY(i, this.width));
                process.exit(1);
                return false;
        }
    },

    _postProcessDirections: function() {
        var i, m, spawnAt, nextAt, directions = [];

        // Missing spawns?
        for (i = 0, m = this.spawns.length; i < m; i++) {
            if (!this.spawns[i]) {
                console.error('Missing spawn with index:', i);
                console.error('File:', this.file);
                process.exit(1);
            }
        }

        // Generate directions
        for (i = 0, m = this.spawns.length; i < m; i++) {
            for (var ii = 0, mm = this.directions.length; ii < mm; ii++) {
                spawnAt = this.seqToXY(this.spawns[i], this.width);
                nextAt = this.seqToXY(this.directions[ii], this.width);
                if (1 ===
                        Math.abs(spawnAt[0] - nextAt[0]) +
                        Math.abs(spawnAt[1] - nextAt[1])) {
                    if (spawnAt[1] === nextAt[1]) {
                        directions[i] = (nextAt[0] < spawnAt[0]) ? 0 : 2;
                    } else {
                        directions[i] = (nextAt[1] < spawnAt[1]) ? 3 : 1;
                    }
                    break;
                }
            }
        }
        this.directions = directions;

        // Missing directions?
        for (i = 0, m = this.directions.length; i < m; i++) {
            if (!this.spawns[i]) {
                console.error('Missing direction with index:', i);
                console.error('File:', this.file);
                process.exit(1);
            }
        }
    },

    seqToXY: function(seq, width) {
        return [seq % width, Math.floor(seq / width)];
    }

};