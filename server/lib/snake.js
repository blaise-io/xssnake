/*jshint globalstrict:true,es5:true*/
'use strict';

/**
 * Snake
 * TODO Crash detection
 * @constructor
 */
function Snake(server) {
    this.server = server;

    this.parts = []; // [0] = tail, [n-1] = head
    this.direction = 0;

    this.crashed = false;
    this.size = 4;
    this.speed = 500;

    this.elapsed = 0;

    this._tickHandler = this._onTick.bind(this);
    this._bindEvents();
}

module.exports = Snake;

Snake.prototype = {

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} direction
     * @return {Boolean}
     */
    update: function(x, y, direction) {
        // TODO Validate user input
        while (this.size <= this.parts.length) {
            this.parts.shift();
        }
        this.parts.push([x, y]);
        this.direction = direction;

        return true; // Move was valid
    },

    get: function() {
        return [this.parts, this.direction];
    },

    crash: function() {
        this.crashed = true;
        this.server.ticker.removeListener('tick', this._tickHandler);
    },

    _bindEvents: function() {
        this.server.ticker.on('tick', this._tickHandler);
    },

    /**
     * @param {number} elapsed
     * @private
     */
    _onTick: function(elapsed) {
        this.elapsed += elapsed;
        if (this.elapsed >= this.speed && this.parts.length) {
            this.elapsed -= this.speed;
            this._continueInDirection();
        }
    },

    _continueInDirection: function() {
        var shift, head;
        shift = [[-1, 0], [0, -1], [1, 0], [0, 1]][this.direction];
        head = this.parts[this.parts.length - 1];
        this.update(head[0] + shift[0], head[1] + shift[1], this.direction);
    }

};