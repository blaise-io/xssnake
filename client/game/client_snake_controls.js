'use strict';

/**
 * @param {xss.game.ClientSnake} snake
 * @constructor
 */
xss.game.ClientSnakeControls = function(snake) {
    this.snake = snake;
    this.bindEvents();
    // Allow buffering the next move.
    this.upcomingDirections = [];
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
            this.setDirection(xss.KEY_TO_DIRECTION[event.keyCode]);
        }
    },

    /**
     * @param {number} direction
     * @private
     */
    setDirection: function(direction) {
        var allowed = this.isDirectionAllowed(direction, this.getPreviousDirection());
        if (allowed && this.upcomingDirections.length <= 2) {
            this.upcomingDirections.push(direction);
            this.emitNewDirection(direction);
        }
    },

    /**
     * @return {number}
     * @private
     */
    getPreviousDirection: function() {
        if (this.upcomingDirections.length) {
            return this.upcomingDirections[0];
        }
        return this.snake.direction;
    },

    /**
     * @param {number} direction
     * @param {number} prevDirection
     * @private
     */
    isDirectionAllowed: function(direction, prevDirection) {
        var turns = Math.abs(direction - prevDirection);
        // Disallow 0: no turn, 2: bumping into torso
        return turns === 1 || turns === 3;
    },

    /**
     * @return {number}
     */
    getNextDirection: function() {
        if (this.upcomingDirections.length) {
            this.snake.direction = this.upcomingDirections[0];
        }
        return this.snake.direction;
    },

    /**
     * @param {number} direction
     */
    emitNewDirection: function(direction) {
        if (xss.player && xss.player.room && xss.player.room.gameHasStarted()) {
            this.snake.emit(direction);
        }
    },

    /**
     * Snake moved. Administrate!
     */
    move: function() {
        if (this.upcomingDirections.length) {
            this.emitNewDirection(this.upcomingDirections.shift());
        }
    }

};
