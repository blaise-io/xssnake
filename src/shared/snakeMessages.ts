import { DIRECTION, NETCODE_SYNC_MS } from "./const";
import { AUDIENCE, NETCODE } from "./room/netcode";
import { Message } from "./room/types";
import { Snake } from "./snake";

export class SnakeUpdateServerMessage implements Message {
    static id = NETCODE.SNAKE_UPDATE_SERVER;
    static audience = AUDIENCE.SERVER_ROOM;

    constructor(public direction: DIRECTION, public parts: Coordinate[]) {}

    static fromData(snake: Snake, direction = -1): SnakeUpdateServerMessage {
        // Direction can be upcoming, may not be part of snake.
        const sync = Math.ceil(NETCODE_SYNC_MS / snake.speed);
        return new SnakeUpdateServerMessage(direction, snake.parts.slice(-sync));
    }

    static fromNetcode(untrustedNetcode: string): SnakeUpdateServerMessage | undefined {
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

    get netcode(): string {
        return JSON.stringify([this.direction, ...this.parts]);
    }
}

export class SnakeUpdateClientMessage implements Message {
    static id = NETCODE.SNAKE_UPDATE_CLIENT;
    static audience = AUDIENCE.CLIENT;

    constructor(
        public direction: DIRECTION,
        public parts: Coordinate[],
        public playerIndex: number,
    ) {}

    static fromData(snake: Snake, playerIndex: number): SnakeUpdateClientMessage {
        return new SnakeUpdateClientMessage(snake.direction, snake.parts, playerIndex);
    }

    static fromNetcode(trustedNetcode: string): SnakeUpdateClientMessage | undefined {
        const [direction, playerIndex, ...parts] = JSON.parse(trustedNetcode);
        return new SnakeUpdateClientMessage(direction, parts, playerIndex);
    }

    get netcode(): string {
        return JSON.stringify([this.direction, this.playerIndex, ...this.parts]);
    }
}
