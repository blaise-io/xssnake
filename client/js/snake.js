/*jshint globalstrict:true*/
/*globals XSS,PixelEntity*/

'use strict';

/**
 * Snake
 * @param {number} x
 * @param {number} y
 * @param {number} direction
 * @constructor
 */
function Snake(x, y, direction){
    this.head = [x, y];
    this.snake = [this.head];
    this.direction = direction;

    this.crashed = false;
    this.parts = 3;
    this.speed = 100; // ms between moves

    this.snakeProgress = 0;

    this.entity = new PixelEntity().dynamic(true);
    this.entityName = 'snake_' + XSS.utils.uuid();

    this._snakeTurnRequests = [];
}

Snake.prototype = {

    addControls: function() {
        XSS.on.keydown(this._handleKeys.bind(this));
    },

    addToEntities: function() {
        XSS.ents[this.entityName] = this.entity;
    },

    move: function() {
        var headShifted, shift;

        this._handleChangeRequests();

        shift = this._directionToShift(this.direction);
        headShifted = [[this.head[0] + shift[0], this.head[1] + shift[1]]];

        this._updateSnakePos(headShifted[0][0], headShifted[0][1]);
        this.entity.pixels(XSS.game.zoom(this.snake));
    },

    crash: function() {
        this.crashed = true;
    },

    isCrashIntoSelf: function() {
        var snake = this.snake;
        for (var i = 0, m = snake.length - 1; i < m; ++i) {
            if (snake[i][0] === this.head[0] && snake[i][1] === this.head[1]) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param {number} direction
     * @return {Array.<number>}
     * @private
     */
    _directionToShift: function(direction) {
        return [[-1, 0], [0, -1], [1, 0], [0, 1]][direction];
    },

    /**
     * @param {number} x
     * @param {number} y
     */
    _updateSnakePos: function(x, y) {
        while (this.parts <= this.snake.length) {
            this.snake.shift();
        }
        this.head = [x, y];
        this.snake.push([x, y]);
    },

    /** @private */
    _handleKeys: function(e) {
        switch (e.which) {
            case XSS.KEY_LEFT:
                this._changeDirection(XSS.DIRECTION_LEFT);
                break;
            case XSS.KEY_UP:
                this._changeDirection(XSS.DIRECTION_UP);
                break;
            case XSS.KEY_RIGHT:
                this._changeDirection(XSS.DIRECTION_RIGHT);
                break;
            case XSS.KEY_DOWN:
                this._changeDirection(XSS.DIRECTION_DOWN);
                break;
        }
    },

    /** @private */
    _handleChangeRequests: function() {
        if (this._snakeTurnRequests.length) {
            this.direction = this._snakeTurnRequests.shift();
        }
    },

    /**
     * @param {number} direction
     * @private
     */
    _changeDirection: function(direction) {
        var lastDirection, turns;

        // Allow max of 2 turn requests in 1 move
        if (this._snakeTurnRequests.length <= 2) {
            lastDirection = this._getLastDirection();
            turns = Math.abs(direction - lastDirection);
            if (direction !== lastDirection && this._isNumTurnAllowed(turns)) {
                this._snakeTurnRequests.push(direction);
            }
        }
    },

    /**
     * @return {number}
     * @private
     */
    _getLastDirection: function() {
        return (this._snakeTurnRequests.length) ?
            this._snakeTurnRequests[0] :
            this.direction;
    },

    /**
     * @param {number} turns
     * @private
     */
    _isNumTurnAllowed: function(turns) {
        // Disallow 0: no turn, 2: bumping into torso
        return turns === 1 || turns === 3;
    }

};