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
        headShifted = XSS.effects.shift([this.head], shift[0], shift[1]);

        this._updateSnakePos(headShifted[0][0], headShifted[0][1]);
        this.entity.pixels(XSS.effects.zoomX4(this.snake, 2, 2));
    },

    crash: function() {

    },

    isCrashIntoSelf: function() {
        for (var i = 0, m = this.snake.length - 1; i < m; ++i) {
            if (this.snake[i][0] === this.head[0] && this.snake[i][1] === this.head[1]) {
                return true;
            }
        }
        return false;
    },

    _directionToShift: function(turn) {
        return [[-1, 0], [0, -1], [1, 0], [0, 1]][turn];
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

    _handleChangeRequests: function() {
        if (this._snakeTurnRequests.length) {
            this.direction = this._snakeTurnRequests.shift();
        }
    },

    /** @private */
    _changeDirection: function(direction) {
        var lastDirection, turn;

        // Allow max of 2 turn requests in 1 move
        if (this._snakeTurnRequests.length <= 2) {
            lastDirection = this._getLastDirection();
            turn = Math.abs(direction - lastDirection);
            if (direction !== lastDirection && this._isTurnAllowed(turn)) {
                this._snakeTurnRequests.push(direction);
            }
        }
    },

    /** @private */
    _getLastDirection: function() {
        return (this._snakeTurnRequests.length) ?
            this._snakeTurnRequests[0] :
            this.direction;
    },

    /** @private */
    _isTurnAllowed: function(turn) {
        // Disallow 0: no turn, 2: bumping into torso
        return turn === 1 || turn === 3;
    }

};