/*jshint globalstrict:true,es5:true*/
'use strict';

/**
 * @param {Room} room
 * @param {number} index
 * @param {array} parts
 * @param {number} direction
 * @constructor
 */
function Snake(room, index, parts, direction) {
    this.room = room;
    this.index = index;
    this.server = room.server;
    this.parts = parts;
    this.direction = direction;

    this.crashed = false;

    this.size = this.server.config.snake.size;
    this.speed = this.server.config.snake.speed;

    this.elapsed = 0;

    this._tickHandler = this._onTick.bind(this);
    this._bindEvents();
}

module.exports = Snake;

Snake.prototype = {

    /**
     * @param {Room} room
     * @param {Array.Array} parts
     * @param {number} direction
     * @return {boolean} Valid move
     */
    update: function(room, parts, direction) {
        var head, gap;

        head = parts[parts.length - 1];

        // TODO: Move game logic to new Game Class
        // Game: Apples, Snakes, Crashes, Levels
        // Room: Communication entry point, chatting, joining, leaving
        // TODO: Detect validity of parts. Invalid = ignore+reset.
        // TODO: Detect crashes in between turns.

        if (this.isCrash(room, parts)) {
            this.handleCrash(parts);
        }

        if (this.isNom(head)) {
            this.handleAppleHit();
        }

        gap = this._gap(head, this.head());

        if (gap !== 0) {
            this.parts = parts;
        }
        this.direction = direction;
        return true;
    },

    isCrash: function(room, parts) {
        var level = room.level;

        // TODO: Crash into Self
        // TODO: Crash into Others

        // Level walls
        for (var i = 0, m = parts.length; i < m; i++) {
            var part = parts[i];
            if (level.isWall(part[0], part[1])) {
                return true;
            }
        }

        return false;
    },

    handleCrash: function(parts) {
        this.crashed = true;
        this.room.emit('/c/crash', [this.index, parts]);
    },

    isNom: function(head) {
        var apple = this.room.apple;
        return (head[0] === apple[0] && head[1] === apple[1]);
    },

    // TODO Implement possibility of multiple apples
    handleAppleHit: function() {
        this.size++;
        this.room.emit('/c/nom', [this.index, this.size, 0]);
        this.room.respawnApple();
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
    head: function() {
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
     * @param {Array.<number>} a
     * @param {Array.<number>} b
     * @return {number}
     * @private
     */
    _gap: function(a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
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
            this.trim();
        }
    },

    _continueInDirection: function() {
        var shift, newHead, head = this.head();
        shift = [[-1, 0], [0, -1], [1, 0], [0, 1]][this.direction];
        newHead = [head[0] + shift[0], head[1] + shift[1]];
        if (this.isNom(newHead)) {
            this.handleAppleHit();
        }
        this.parts.push(newHead);
    }

};