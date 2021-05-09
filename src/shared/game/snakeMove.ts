import { Level } from "../level/level";
import { Player } from "../room/player";
import { Snake } from "./snake";
import { Collision } from "./collision";

export const enum CRASH_INTO {
    // UNKNOWN,
    WALL,
    MOVING_WALL,
    SELF,
    OPPONENT_BODY,
    // OPPONENT_HEAD,
}

export class SnakeMove {
    collision?: Collision;

    constructor(
        public snake: Snake,
        public players: Player[],
        public level: Level,
        public location: Coordinate,
    ) {
        this.collision = this.getCollision();
    }

    getCoordinates(part: Coordinate): Coordinate[] {
        const parts = this.snake.parts.slice();
        parts.unshift();
        parts.push(part);
        return parts;
    }

    getCollision(): Collision | undefined {
        const coordinates = this.getCoordinates(this.location);
        for (let i = 0, m = coordinates.length; i < m; i++) {
            const collision = this.getCollisionAtCoordinate(i, coordinates[i]);
            if (collision) {
                return collision;
            }
        }
    }

    getCollisionAtCoordinate(index: number, coordinate: Coordinate): Collision | null {
        const players = this.players;
        const levelData = this.level.data!;

        if (!coordinate) {
            return null;
        }

        if (index > 4) {
            const partIndex = this.snake.getPartIndex(coordinate);
            if (-1 !== partIndex && index !== partIndex) {
                return new Collision(coordinate, CRASH_INTO.SELF);
            }
        }

        if (levelData.isWall(coordinate[0], coordinate[1])) {
            return new Collision(coordinate, CRASH_INTO.WALL);
        }

        if (levelData.isMovingWall(coordinate)) {
            return new Collision(coordinate, CRASH_INTO.MOVING_WALL);
        }

        for (let i = 0, m = players.length; i < m; i++) {
            const snakeOpponent = players[i].snake;
            if (
                snakeOpponent &&
                snakeOpponent.crashed === false &&
                snakeOpponent !== this.snake &&
                snakeOpponent.hasCoordinate(coordinate)
            ) {
                return new Collision(coordinate, CRASH_INTO.OPPONENT_BODY);
            }
        }

        return null;
    }
}
