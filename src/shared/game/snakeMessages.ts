import { ServerSnake } from "../../server/game/serverSnake";
import { DIRECTION, NETCODE_SYNC_MS } from "../const";
import { AUDIENCE } from "../messages";
import { Message, MessageId } from "../room/types";
import { Collision } from "./collision";
import { Snake } from "./snake";

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

    constructor(
        public direction: DIRECTION,
        public parts: Coordinate[],
        public playerIndex: number,
    ) {}

    static fromData(snake: Snake, playerIndex: number): SnakeUpdateClientMessage {
        return new SnakeUpdateClientMessage(snake.direction, snake.parts, playerIndex);
    }

    static deserialize(trustedNetcode: string): SnakeUpdateClientMessage | undefined {
        const [direction, playerIndex, ...parts] = JSON.parse(trustedNetcode);
        return new SnakeUpdateClientMessage(direction, parts, playerIndex);
    }

    get serialized(): string {
        return JSON.stringify([this.direction, this.playerIndex, ...this.parts]);
    }
}

type SerializedColission = {
    playerIndex: number;
    parts: Coordinate[];
    collision: Collision;
};

export class SnakeCrashMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;
    colissions: SerializedColission[];

    constructor(...collisions: SerializedColission[]) {
        this.colissions = collisions;
    }

    static deserialize(trustedNetcode: string): SnakeCrashMessage | undefined {
        return new SnakeCrashMessage(
            ...JSON.parse(trustedNetcode).map((colissionLinear) => {
                return {
                    index: colissionLinear[0],
                    parts: colissionLinear[1],
                    colission: new Collision(colissionLinear[2], colissionLinear[3]),
                };
            }),
        );
    }

    get serialized(): string {
        return JSON.stringify(
            this.colissions.map((c) => [
                c.playerIndex,
                c.parts,
                c.collision.location,
                c.collision.into,
            ]),
        );
    }

    static fromSnakes(...snakes: ServerSnake[]): SnakeCrashMessage {
        return new SnakeCrashMessage(
            ...snakes.map((snake) => {
                return {
                    playerIndex: snake.index,
                    parts: snake.parts,
                    collision: snake.collision,
                };
            }),
        );
    }
}
