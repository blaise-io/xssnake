import { DIRECTION, NETCODE_SYNC_MS } from "../const";
import { AUDIENCE } from "../messages";
import { Message, MessageId } from "../room/types";
import { Collision } from "./collision";
import { Snake } from "./snake";
import { CRASH_INTO } from "./snakeMove";

export class SnakeUpdateServerMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.SERVER_ROOM;

    constructor(public direction: DIRECTION, public parts: Coordinate[]) {}

    static fromData(snake: Snake, direction = -1): SnakeUpdateServerMessage {
        // Direction can be upcoming, may not be part of snake.
        const sync = Math.ceil(NETCODE_SYNC_MS / snake.speed);
        return new SnakeUpdateServerMessage(direction, snake.parts.slice(-sync));
    }

    static deserialize(untrustedNetcode: string): SnakeUpdateServerMessage | undefined {
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
            return new SnakeUpdateServerMessage(direction, parts);
        } catch (error) {
            console.error(error);
            return;
        }
    }

    get serialized(): string {
        return JSON.stringify([this.direction, ...this.parts]);
    }
}

export class SnakeUpdateClientMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public playerId: number, public direction: DIRECTION, public parts: Coordinate[]) {}

    static deserialize(trustedNetcode: string): SnakeUpdateClientMessage {
        const [playerId, direction, ...parts] = JSON.parse(trustedNetcode);
        return new SnakeUpdateClientMessage(playerId, direction, parts);
    }

    get serialized(): string {
        return JSON.stringify([this.playerId, this.direction, ...this.parts]);
    }
}

export class SnakeCrashMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(
        public collisions: {
            playerId: number;
            parts: Coordinate[];
            collision: Collision;
        }[],
    ) {}

    static fromSnakes(...snakes: Snake[]): SnakeCrashMessage {
        return new SnakeCrashMessage(
            snakes.map((snake) => {
                return {
                    playerId: snake.playerId,
                    parts: snake.parts,
                    collision: snake.collision as Collision,
                };
            }),
        );
    }

    static deserialize(trustedNetcode: string): SnakeCrashMessage {
        return new SnakeCrashMessage(
            JSON.parse(trustedNetcode).map(
                (collision: [number, Coordinate[], Coordinate, CRASH_INTO]) => {
                    return {
                        playerId: collision[0],
                        parts: collision[1],
                        collision: new Collision(collision[2], collision[3]),
                    };
                },
            ),
        );
    }

    get serialized(): string {
        return JSON.stringify(
            this.collisions.map((collision) => [
                collision.playerId,
                collision.parts,
                collision.collision.location,
                collision.collision.into,
            ]),
        );
    }
}
