import { DIRECTION, NETCODE_SYNC_MS } from "./const";
import { Collision } from "./game/collision";
import { Level } from "./level/level";
import { Message } from "./room/types";
import { AUDIENCE, NETCODE } from "./room/netcode";

export class SnakeMessage implements Message {
    static id = NETCODE.SNAKE_UPDATE;
    static audience = AUDIENCE.SERVER;

    constructor(public direction: DIRECTION, public parts: Coordinate[]) {}

    static fromSnake(snake: Snake, direction = -1): SnakeMessage {
        // Direction can be upcoming, may not be part of snake.
        // This syncs a partial snake. That makes it only useful from client to server?
        const sync = Math.ceil(NETCODE_SYNC_MS / snake.speed);
        return new SnakeMessage(
            direction !== -1 ? direction : snake.direction,
            snake.parts.slice(-sync),
        );
    }

    static fromNetcode(untrustedNetcode: string): SnakeMessage | undefined {
        console.log(untrustedNetcode);
        try {
            const [direction, ...parts] = JSON.parse(untrustedNetcode);
            if (
                direction !== DIRECTION.LEFT &&
                direction !== DIRECTION.UP &&
                direction !== DIRECTION.RIGHT &&
                direction !== DIRECTION.DOWN
            ) {
                return;
            }
            return new SnakeMessage(direction, parts);
        } catch (error) {
            console.error(error);
            return;
        }
    }

    get netcode(): string {
        return JSON.stringify([this.direction, ...this.parts]);
    }
}

export class Snake {
    /** Head is last in array */
    parts: Coordinate[];
    direction: DIRECTION;
    size: number;
    speed: number;
    crashed: boolean;
    collision: Collision;

    constructor(public index: number, level: Level) {
        const spawn = level.data.spawns[index];

        this.parts = [spawn.location];
        this.direction = spawn.direction;
        this.size = level.config.snakeSize;
        this.speed = level.config.snakeSpeed;

        this.crashed = false;
        this.collision = undefined;
    }

    move(position: Coordinate): void {
        this.parts.push(position);
        this.trimParts();
    }

    getHead(): Coordinate {
        return this.parts[this.parts.length - 1];
    }

    hasPartPredict(part: Coordinate): boolean {
        const treshold = this.crashed ? -1 : 0;
        return this.getPartIndex(part) > treshold;
    }

    trimParts(): void {
        while (this.parts.length > this.size) {
            this.parts.shift();
        }
    }

    hasPart(part: Coordinate): boolean {
        return -1 !== this.getPartIndex(part);
    }

    getPartIndex(part: Coordinate): number {
        const parts = this.parts;
        for (let i = 0, m = parts.length; i < m; i++) {
            if (parts[i][0] === part[0] && parts[i][1] === part[1]) {
                return i;
            }
        }
        return -1;
    }

    shiftParts(shift: Shift): void {
        const x = shift[0] || 0;
        const y = shift[1] || 0;
        if (x || y) {
            for (let i = 0, m = this.parts.length; i < m; i++) {
                this.parts[i][0] += x;
                this.parts[i][1] += y;
            }
        }
    }

    reverse(): void {
        const dx = this.parts[0][0] - this.parts[1][0];
        const dy = this.parts[0][1] - this.parts[1][1];

        if (dx === 0) {
            this.direction = dy === -1 ? 1 : 3;
        } else {
            this.direction = dx === -1 ? 0 : 2;
        }

        this.parts.reverse();
    }
}
