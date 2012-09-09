/*jshint globalstrict:true,es5:true*/
'use strict';


/**
 * Snake
 * @constructor
 */
function Snake() {
    this.parts = []; // [0] = tail, [n-1] = head
    this.direction = 0;

    this.crashed = false;
    this.size = 4;
    this.speed = 500;
}

module.exports = Snake;

Snake.prototype = {

    update: function(x, y, direction) {
        // TODO: Validate
        while (this.size <= this.parts.length) {
            this.parts.shift();
        }
        this.parts.push([x, y]);
        this.direction = direction;

        return true; // Move was valid
    },

    get: function() {
        return [this.parts, this.direction];
    }

};