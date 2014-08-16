'use strict';

/**
 * @param {xss.Coordinate} part
 * @extends {xss.game.Collision}
 * @constructor
 */
xss.game.MovingWallCollision = function(part) {
    xss.game.Collision.apply(this, arguments);
    this.into = xss.CRASH_MOVING_WALL;
};
