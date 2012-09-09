/*jshint globalstrict:true,es5:true*/
'use strict';

var Level = require('./level.js');

/**
 * Snake
 * TODO: Crash detection
 * TODO: Remove tick listener on client disconnect
 * @constructor
 */
function Snake(server, index, levelID) {
    var level = new Level(server, levelID);

    this.server = server;
    this.parts = [level.getSpawn(index)];
    this.direction = level.getSpawnDirection(index);

    this.crashed = false;
    this.size = server.config.snake.size;
    this.speed = server.config.snake.speed;

    this.elapsed = 0;

    this._tickHandler = this._onTick.bind(this);
    this._bindEvents();
}

module.exports = Snake;

Snake.prototype = {

    /**
     * TODO: Validate user input
     * @param {Array.<number>} head
     * @param {number} direction
     * @return {boolean} Valid move
     */
    update: function(head, direction) {
        // TODO: Fill gaps caused by server prediction + client lag
        this.parts[this.parts.length - 1] = head;
        this.direction = direction;
        return true;
    },

    trim: function() {
        while (this.parts.length > this.size) {
            this.parts.shift();
        }
    },

    serialize: function() {
        return [this.parts, this.direction];
    },

    /**
     * @return {Array.<number>}
     */
    getHead: function() {
        return this.parts[this.parts.length - 1];
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
        var shift, head = this.getHead();
        shift = [[-1, 0], [0, -1], [1, 0], [0, 1]][this.direction];
        this.parts.push([head[0] + shift[0], head[1] + shift[1]]);
        this.trim();
    }

};