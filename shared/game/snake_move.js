"use strict";

/**
 * @param {xss.game.Snake} snake
 * @param {Array.<xss.room.Player>} players
 * @param {xss.level.Level} level
 * @param {xss.Coordinate} location
 * @constructor
 */
xss.game.SnakeMove = function (snake, players, level, location) {
    this.snake = snake;
    this.level = level;
    this.players = players;
    this.location = location;
    /** @type {xss.game.Collision} */
    this.collision = this.getCollission();
};

xss.game.SnakeMove.prototype = {
    getParts: function (part) {
        const parts = this.snake.parts.slice();
        parts.unshift();
        parts.push(part);
        return parts;
    },

    /**
     * @return {xss.game.Collision}
     */
    getCollission: function () {
        const parts = this.getParts(this.location);
        for (let i = 0, m = parts.length; i < m; i++) {
            const collision = this.getCollisionPart(i, parts[i]);
            if (collision) {
                return collision;
            }
        }
        return null;
    },

    /**
     * @param {number} index
     * @param {xss.Coordinate} part
     * @return {xss.game.Collision}
     */
    getCollisionPart: function (index, part) {
        let players, levelData, partIndex;
        players = this.players;
        levelData = this.level.data;

        if (index > 4) {
            partIndex = this.snake.getPartIndex(part);
            if (-1 !== partIndex && index !== partIndex) {
                return new xss.game.Collision(part, xss.CRASH_SELF);
            }
        }

        if (levelData.isWall(part[0], part[1])) {
            return new xss.game.Collision(part, xss.CRASH_WALL);
        }

        if (levelData.isMovingWall(part)) {
            return new xss.game.Collision(part, xss.CRASH_MOVING_WALL);
        }

        for (let i = 0, m = players.length; i < m; i++) {
            const opponentSnake = players[i].snake;
            if (
                opponentSnake.crashed === false &&
                opponentSnake !== this.snake &&
                opponentSnake.hasPart(part)
            ) {
                return new xss.game.Collision(part, xss.CRASH_OPPONENT);
            }
        }

        return null;
    },
};
