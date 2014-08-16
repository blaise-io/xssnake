'use strict';

/**
 * @param {xss.game.Snake} snake
 * @param {Array.<xss.game.ClientSnake>} snakes
 * @param {xss.level.Level} level
 * @param {xss.Coordinate} location
 * @constructor
 */
xss.game.SnakeMove = function(snake, snakes, level, location) {
    this.snake = snake;
    this.level = level;
    this.snakes = snakes;
    this.location = location;
    this.collision = this.getCollission();
};

xss.game.SnakeMove.prototype = {

    getParts: function(part) {
        var parts = this.snake.parts.slice();
        parts.unshift();
        parts.push(part);
        return parts;
    },

    getCollission: function() {
        var parts = this.getParts(this.location);
        for (var i = 0, m = parts.length; i < m; i++) {
            var collision = this.getCollisionPart(i, parts[i]);
            if (collision) {
                return collision;
            }
        }
        return null;
    },

    getCollisionPart: function(index, part) {
        var snakes, snake, levelData, partIndex;
        snake = this.snake;
        snakes = this.snakes;
        levelData = this.level.data;

        if (index > 4) {
            partIndex = this.getPartIndex(part);
            if (-1 !== partIndex && partIndex !== index) {
                return new xss.game.SelfCollision(part);
            }
        }

        if (levelData.isWall(part[0], part[1])) {
            return new xss.game.WallCollision(part);
        }

        if (levelData.isMovingWall(part)) {
            return new xss.game.MovingWallCollision(part);
        }

        for (var ii = 0, mm = snakes.length; ii < mm; ii++) {
            if (snake !== snakes[ii] && snakes[ii].hasPart(part)) {
                return new xss.game.OpponentCollision(part, snakes[ii]);
            }
        }
    }

};
