'use strict';

/**
 * @constructor
 */
xss.levelset.Config = function() {
    this.level = xss.data.levels.blank;
    this.gravity = [0, 0];
    this.enableApples = true;
    this.enablePowerups = [];
    this.snakeSize = 4;
    this.snakeSpeed = 120; // Change tile every ms.
    this.snakeIncrease = 1;
    this.pointsApple = 1;
    this.pointsKnockout = 3;
};
