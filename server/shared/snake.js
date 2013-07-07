/*jshint globalstrict:true, node:true, sub:true*/
'use strict';

/**
 * Snake
 * @param {Array.<number>} location
 * @param {number} direction
 * @param {number} size
 * @param {number} speed
 * @constructor
 */
function Snake(location, direction, size, speed) {
    this.parts = [location];
    this.direction = direction;
    this.size = size;
    this.speed = speed;
    this.crashed = false;
    this.limbo = null;
}

module.exports = Snake;

Snake.prototype = {

    /**
     * @param {Array.<number>} position
     */
    move: function(position) {
        this.parts.push(position);
        this.trim();
    },

    /**
     * @return {Array.<number>}
     */
    head: function() {
        return this.parts[this.parts.length - 1];
    },

    /**
     * @param {Array.<number>} part
     * @return {boolean}
     */
    hasPartPredict: function(part) {
        var treshold = this.crashed ? -1 : 0;
        return (this.partIndex(part) > treshold);
    },

    trim: function() {
        while (this.parts.length > this.size) {
            this.parts.shift();
        }
    },

    /**
     * @param {Array.<number>} part
     * @return {boolean}
     */
    hasPart: function(part) {
        return (-1 !== this.partIndex(part));
    },

    /**
     * @param {Array.<number>} part
     * @return {number}
     */
    partIndex: function(part) {
        var parts = this.parts;
        for (var i = 0, m = parts.length; i < m; i++) {
            if (parts[i][0] === part[0] && parts[i][1] === part[1]) {
                return i;
            }
        }
        return -1;
    },

    /**
     * @param {number} direction
     * @return {Array.<number>}
     */
    directionToShift: function(direction) {
        return [[-1, 0], [0, -1], [1, 0], [0, 1]][direction];
    },

    /**
     * head-tail switch
     */
    reverse: function() {
        var dx, dy;

        dx = this.parts[0][0] - this.parts[1][0];
        dy = this.parts[0][1] - this.parts[1][1];

        if (dx !== 0) {
            this.direction = (dx === -1) ? 0 : 2;
        } else {
            this.direction = (dy === -1) ? 1 : 3;
        }

        this.parts.reverse();
    }

};
