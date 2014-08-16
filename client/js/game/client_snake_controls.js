'use strict';

/**
 * @param {xss.game.ClientSnake} snake
 * @constructor
 */
xss.game.ClientSnakeControls = function(snake) {
    this.snake = snake;
    this.bindEvents();
    this.directionBuffer = [];
};

xss.game.ClientSnakeControls.prototype = {

    destruct: function() {
        xss.event.off(
            xss.DOM_EVENT_KEYDOWN,
            xss.NS_SNAKE_CONTROLS
        );
    },

    bindEvents: function() {
        xss.event.on(
            xss.DOM_EVENT_KEYDOWN,
            xss.NS_SNAKE_CONTROLS,
            this.handleKeys.bind(this)
        );
    },

    /**
     * @param {Event} event
     */
    handleKeys: function(event) {
        if (!xss.keysBlocked) {
            this.changeDirection(xss.KEY_TO_DIRECTION[event.keyCode]);
        }
    },

    /**
     * @param {number} direction
     * @private
     */
    changeDirection: function(direction) {
        var allowed = this.isTurnAllowed(direction, this.getPreviousDirection());
        if (this.directionBuffer.length <= 2 && allowed) {
            this.directionBuffer.push(direction);
            this.emitProxy(direction);
        }
    },

    /**
     * @param {number} direction
     * @private
     */
    emitProxy: function(direction) {
        var emit = function() {
            this.snake.emit(direction);
        }.bind(this);
        if (xss.room && xss.room.game && xss.room.game.model.started) {
            if (this.directionBuffer.length <= 1) {
                emit();
            } else {
                setTimeout(emit, this.speed);
            }
        }
    },

    /**
     * @return {number}
     * @private
     */
    getPreviousDirection: function() {
        return (this.directionBuffer.length) ?
            this.directionBuffer[0] :
            this.snake.direction;
    },

    /**
     * @param {number} direction
     * @param {number} prevDirection
     * @private
     */
    isTurnAllowed: function(direction, prevDirection) {
        var turns = Math.abs(direction - prevDirection);
        // Disallow 0: no turn, 2: bumping into torso
        return turns === 1 || turns === 3;
    },

    /**
     * @returns {number}
     */
    getNextDirection: function() {
        if (this.directionBuffer.length) {
            this.snake.direction = this.directionBuffer.shift();
        }
        return this.snake.direction;
    }
};
