/*jshint globalstrict:true, es5:true*/
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
}

if (typeof module !== 'undefined') {
    module.exports = Snake;
}

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
     * @param {Array.<number>} head
     * @return {boolean}
     */
    isHead: function(head) {
        var thisHead = this.head();
        return (thisHead[0] === head[0] && thisHead[1] === head[1]);
    },

    /**
     * @param {Array.<number>} part
     * @return {boolean}
     */
    hasPartPredict: function(part) {
        var treshold = this.crashed ? -1 : 0;
        return (this.partIndex(part) > treshold);
    },

    /**
     * @return {Array.<number>}
     */
    getNextPosition: function() {
        var shift, head = this.head();
        shift = this.directionToShift(this.direction);
        return [head[0] + shift[0], head[1] + shift[1], 'x'];
    },

    trim: function() {
        while (this.parts.length > this.size) {
            this.parts.shift();
        }
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
     * @return {ShapePixels}
     */
    directionToShift: function(direction) {
        return [[-1, 0], [0, -1], [1, 0], [0, 1]][direction];
    }

};