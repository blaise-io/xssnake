'use strict';

/**
 * @param {xss.game.Snake} snake
 * @param {Array.<xss.game.ClientPlayer>} players
 * @param {xss.level.Level} level
 * @param {xss.Coordinate} location
 * @constructor
 */
xss.game.SnakeMove = function(snake, players, level, location) {
    this.snake = snake;
    this.level = level;
    this.players = players;
    this.location = location;
    this.tick = 0;
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
        var players, snake, levelData, partIndex;
        snake = this.snake;
        players = this.players;
        levelData = this.level.data;

        if (index > 4) {
            partIndex = snake.getPartIndex(part);
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

        for (var ii = 0, mm = players.length; ii < mm; ii++) {
            if (snake !== players[ii].snake && players[ii].snake.hasPart(part)) {
                return new xss.game.OpponentCollision(part, players[ii].snake);
            }
        }
    }

};
