'use strict';

/**
 * @typedef {Array.<xss.Coordinate>}
 * @example [[0,0], [1,0], [2,0]]
 */
xss.SnakeParts;

/**
 * Snake
 * @param {xss.Coordinate} location
 * @param {number} direction
 * @param {number} size
 * @param {number} speed
 * @constructor
 */
xss.Snake = function(location, direction, size, speed) {
    /** @type xss.SnakeParts */
    this.parts = [location];
    this.direction = direction;
    this.size = size;
    this.speed = speed;
    this.crashed = false;
    this.limbo = null;
    this.gravity = null;
};

xss.Snake.prototype = {

    /**
     * @param {xss.Coordinate} position
     */
    move: function(position) {
        this.parts.push(position);
        this.trimParts();
    },

    /**
     * @return {xss.Coordinate}
     */
    getHead: function() {
        return this.parts[this.parts.length - 1];
    },

    /**
     * @param {xss.Coordinate} part
     * @return {boolean}
     */
    hasPartPredict: function(part) {
        var treshold = this.crashed ? -1 : 0;
        return (this.getPartIndex(part) > treshold);
    },

    trimParts: function() {
        while (this.parts.length > this.size) {
            this.parts.shift();
        }
    },

    /**
     * @param {xss.Coordinate} part
     * @return {boolean}
     */
    hasPart: function(part) {
        return (-1 !== this.getPartIndex(part));
    },

    /**
     * @param {xss.Coordinate} part
     * @return {number}
     */
    getPartIndex: function(part) {
        var parts = this.parts;
        for (var i = 0, m = parts.length; i < m; i++) {
            if (parts[i][0] === part[0] && parts[i][1] === part[1]) {
                return i;
            }
        }
        return -1;
    },

    /**
     * @param {xss.Shift} shift
     */
    shiftParts: function(shift) {
        var x = shift[0] || 0, y = shift[1] || 0;
        if (x || y) {
            for (var i = 0, m = this.parts.length; i < m; i++) {
                this.parts[i][0] += x;
                this.parts[i][1] += y;
            }
        }
    },

    /**
     * Head-tail switch.
     */
    reverse: function() {
        var dx, dy;

        dx = this.parts[0][0] - this.parts[1][0];
        dy = this.parts[0][1] - this.parts[1][1];

        if (dx === 0) {
            this.direction = (dy === -1) ? 1 : 3;
        } else {
            this.direction = (dx === -1) ? 0 : 2;
        }

        this.parts.reverse();
    }

};
