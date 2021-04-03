/**
 * @param {game.Snake} snake
 * @param {Array.<room.Player>} players
 * @param {level.Level} level
 * @param {Coordinate} location
 * @constructor
 */
import { CRASH_MOVING_WALL, CRASH_OPPONENT, CRASH_SELF, CRASH_WALL } from "../const";
import { Collision } from "./collision";

export class SnakeMove {
    public collision: Collision;

    constructor(public snake, public players, public level, public location) {
        this.collision = this.getCollission();
    }

    getParts(part) {
        const parts = this.snake.parts.slice();
        parts.unshift();
        parts.push(part);
        return parts;
    }

    /**
     * @return {game.Collision}
     */
    getCollission() {
        const parts = this.getParts(this.location);
        for (let i = 0, m = parts.length; i < m; i++) {
            const collision = this.getCollisionPart(i, parts[i]);
            if (collision) {
                return collision;
            }
        }
        return null;
    }

    /**
     * @param {number} index
     * @param {Coordinate} part
     * @return {game.Collision}
     */
    getCollisionPart(index, part) {
        let players; let levelData; let partIndex;
        players = this.players;
        levelData = this.level.data;

        if (index > 4) {
            partIndex = this.snake.getPartIndex(part);
            if (-1 !== partIndex && index !== partIndex) {
                return new Collision(part, CRASH_SELF);
            }
        }

        if (levelData.isWall(part[0], part[1])) {
            return new Collision(part, CRASH_WALL);
        }

        if (levelData.isMovingWall(part)) {
            return new Collision(part, CRASH_MOVING_WALL);
        }

        for (let i = 0, m = players.length; i < m; i++) {
            const opponentSnake = players[i].snake;
            if (opponentSnake.crashed === false &&
                opponentSnake !== this.snake &&
                opponentSnake.hasPart(part)
            ) {
                return new Collision(part, CRASH_OPPONENT);
            }
        }

        return null;
    }

}
