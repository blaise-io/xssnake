'use strict';

/**
 * @param {xss.Coordinate} part
 * @param {xss.game.Snake} snake
 * @extends {xss.game.Collision}
 * @constructor
 */
xss.game.OpponentCollision = function(part, snake) {
    xss.game.Collision.apply(this, arguments);
    this.snake = snake;
    this.into = xss.CRASH_OPPONENT;

    // @todo Detect draw
};
