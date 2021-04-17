import { CRASH_MOVING_WALL, CRASH_OPPONENT, CRASH_SELF, CRASH_WALL } from "../const";
import { Level } from "../level/level";
import { Player } from "../room/player";
import { Snake } from "../snake";
import { Collision } from "./collision";

export class SnakeMove {
    collision: Collision;

    constructor(
        public snake: Snake,
        public players: Player[],
        public level: Level,
        public location: Coordinate
    ) {
        this.collision = this.getCollission();
    }

    getParts(part: Coordinate): Coordinate[] {
        const parts = this.snake.parts.slice();
        parts.unshift();
        parts.push(part);
        return parts;
    }

    getCollission(): Collision {
        const parts = this.getParts(this.location);
        for (let i = 0, m = parts.length; i < m; i++) {
            const collision = this.getCollisionPart(i, parts[i]);
            if (collision) {
                return collision;
            }
        }
        return null;
    }

    getCollisionPart(index: number, part: Coordinate): Collision {
        const players = this.players;
        const levelData = this.level.data;
        if (index > 4) {
            const partIndex = this.snake.getPartIndex(part);
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
            if (
                opponentSnake.crashed === false &&
                opponentSnake !== this.snake &&
                opponentSnake.hasPart(part)
            ) {
                return new Collision(part, CRASH_OPPONENT);
            }
        }

        return null;
    }
}
