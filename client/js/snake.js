/*jshint globalstrict:true*/
/*globals XSS,PixelEntity*/

'use strict';

/**
 * Snake
 * @param {number} id
 * @param {number} x
 * @param {number} y
 * @param {number} direction
 * @constructor
 */
function Snake(id, x, y, direction){
    this.id = id;
    this.parts = [[x, y]]; // [0] = tail, [n-1] = head
    this.direction = direction;

    this.local = false;
    this.crashed = false;

    this.size =  XSS.config.snake.size;
    this.speed = XSS.config.snake.speed; // ms between moves

    this.snakeProgress = 0;

    this.entity = new PixelEntity();
    this.entity.dynamic(true);

    this.entityName = 'snake_' + this.id;

    this._snakeTurnRequests = [];
}

Snake.prototype = {

    addControls: function() {
        XSS.on.keydown(this._handleKeys.bind(this));
    },

    addToEntities: function() {
        XSS.ents[this.entityName] = this.entity;
    },

    /**
     * @param {Array.<number>} move
     */
    move: function(move) {
        this._updateSnakePos(move);
        this.entity.pixels(XSS.effects.zoomGame(this.parts));
    },

    crash: function() {
        this.crashed = true;
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
        return (this._getPart(part) > treshold);
    },

    /**
     * @return {Array.<number>}
     */
    getNextPosition: function() {
        var shift, head = this.head();
        this._handleChangeRequests();
        shift = this._directionToShift(this.direction);
        return [head[0] + shift[0], head[1] + shift[1]];
    },

    emitState: function(direction) {
        XSS.socket.emit('/s/up', [this.parts, direction]);
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
    _getPart: function(part) {
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
     * @return {Array.<Array>}
     * @private
     */
    _directionToShift: function(direction) {
        return [[-1, 0], [0, -1], [1, 0], [0, 1]][direction];
    },

    /**
     * @param {Array.<number>} position
     */
    _updateSnakePos: function(position) {
        this.parts.push(position);
        this.trim();
    },

    /**
     * @param {Event} e
     * @private
     */
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

                // Send to server
                if (this._snakeTurnRequests.length ===  1) {
                    this.emitState(direction);
                } else {
                    // Wait a bit before sending this
                    window.setTimeout(function() {
                        this.emitState(direction);
                    }.bind(this), this.speed - 20);
                }
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